import { createFileRoute } from "@tanstack/react-router";

type ContentBlock =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } }
  | { type: "input_audio"; input_audio: { data: string; format: string } };

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string | ContentBlock[];
};

type ChatRequestBody = {
  messages?: { role: "user" | "assistant"; text: string }[];
  image?: string | null;
  audio?: { data: string; format: string } | null;
  lang?: string;
};

const LANG_LABEL: Record<string, string> = {
  en: "English",
  am: "Amharic (አማርኛ)",
  om: "Afaan Oromo (Afaan Oromoo)",
  so: "Somali (Soomaali)",
  ti: "Tigrinya (ትግርኛ)",
};

import { weather } from "@/lib/data";

async function buildDataContext(): Promise<string> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    
    const { data: expertData } = await supabaseAdmin
      .from("advisory_requests")
      .select("title, body, category, status")
      .eq("status", "answered")
      .order("updated_at", { ascending: false })
      .limit(10);
      
    const { data: listingsData } = await supabaseAdmin
      .from("crop_listings")
      .select("crop, quantity, unit, price, currency, location")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(15);

    const { data: pricesData } = await supabaseAdmin
      .from("market_prices")
      .select("crop, market, price, unit, trend")
      .order("created_at", { ascending: false })
      .limit(10);

    let context = "\n\n--- REAL-TIME FARM DATA ---";
    
    context += `\nWEATHER in ${weather.location}: ${weather.temp}°C, ${weather.condition}. Forecast: ${weather.alerts.map(a => a.note).join(" ")}`;
    
    if (pricesData && pricesData.length > 0) {
      context += `\nMARKET PRICES: `;
      pricesData.forEach(p => {
        context += `${p.crop} in ${p.market} is ${p.price} ETB per ${p.unit}. `;
      });
    }

    if (listingsData && listingsData.length > 0) {
      context += `\nACTIVE CROP LISTINGS FOR SALE: `;
      listingsData.forEach(l => {
        context += `\n- ${l.quantity} ${l.unit} of ${l.crop} in ${l.location} for ${l.price} ${l.currency}`;
      });
    }

    if (expertData && expertData.length > 0) {
      context += `\nPAST EXPERT ADVICE: `;
      expertData.forEach(r => {
        context += `\n- Q: ${r.title}. A: ${r.body}`;
      });
    }

    return context + "\n--------------------------\n";
  } catch {
    return "";
  }
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.LOVABLE_API_KEY;
        if (!key) {
          return Response.json({ error: "AI is not configured." }, { status: 500 });
        }

        let body: ChatRequestBody;
        try {
          body = (await request.json()) as ChatRequestBody;
        } catch {
          return Response.json({ error: "Invalid request." }, { status: 400 });
        }

        const history = Array.isArray(body.messages) ? body.messages : [];
        if (history.length === 0 && !body.image && !body.audio) {
          return Response.json({ error: "Empty message." }, { status: 400 });
        }

        const langLabel = LANG_LABEL[body.lang ?? "en"] ?? "English";
        const dataContext = await buildDataContext();

        const systemPrompt =
          `You are AgriBridge, an AI farming assistant for Ethiopian smallholder farmers. ` +
          `Give clear, practical, low-literacy-friendly advice about crops, soil, livestock, ` +
          `pests, irrigation, weather, harvest, and local market prices. Keep answers short, ` +
          `actionable, and encouraging. Use simple words and step-by-step tips. ` +
          `Always answer in ${langLabel}. When a photo of a crop is provided, diagnose the ` +
          `likely problem and suggest treatment. When audio is provided, treat it as the ` +
          `farmer's spoken question and answer it.` +
          dataContext;

        const messages: ChatMessage[] = [{ role: "system", content: systemPrompt }];

        for (let i = 0; i < history.length - 1; i++) {
          messages.push({ role: history[i].role, content: history[i].text });
        }

        const last = history[history.length - 1];
        const blocks: ContentBlock[] = [];
        if (last?.text) blocks.push({ type: "text", text: last.text });
        if (body.image) {
          blocks.push({ type: "image_url", image_url: { url: body.image } });
        }
        if (body.audio) {
          blocks.push({
            type: "input_audio",
            input_audio: { data: body.audio.data, format: body.audio.format },
          });
        }
        if (blocks.length === 0) {
          blocks.push({ type: "text", text: "Please help me with my farm." });
        }
        messages.push({ role: "user", content: blocks });

        const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Lovable-API-Key": key,
          },
          body: JSON.stringify({ model: "google/gemini-2.5-flash", messages }),
        });

        if (resp.status === 429) {
          return Response.json(
            { error: "Too many requests. Please try again in a moment." },
            { status: 429 },
          );
        }
        if (resp.status === 402) {
          return Response.json(
            { error: "AI credits exhausted. Please add credits to continue." },
            { status: 402 },
          );
        }
        if (!resp.ok) {
          const detail = await resp.text();
          return Response.json({ error: "AI request failed.", detail }, { status: 502 });
        }

        const json = await resp.json();
        const text: string =
          json?.choices?.[0]?.message?.content ?? "Sorry, I couldn't generate an answer.";
        return Response.json({ text });
      },
    },
  },
});
