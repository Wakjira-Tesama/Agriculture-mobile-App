import { createFileRoute } from "@tanstack/react-router";
import { weather, marketPrices } from "@/lib/data";

type ContentBlock =
  | { type: "text"; text: string }
  | { type: "input_audio"; input_audio: { data: string; format: string } };

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string | ContentBlock[];
};

type VoiceCommandRequestBody = {
  audio: { data: string; format: string };
  lang?: string;
  currentPage?: string;
};

const LANG_LABEL: Record<string, string> = {
  en: "English",
  am: "Amharic (አማርኛ)",
  om: "Afaan Oromo (Afaan Oromoo)",
  so: "Somali (Soomaali)",
  ti: "Tigrinya (ትግርኛ)",
};

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

    let context = "\n\n--- REAL-TIME FARM DATA ---";
    
    context += `\nWEATHER in ${weather.location}: ${weather.temp}°C, ${weather.condition}. Forecast: ${weather.alerts.map(a => a.note).join(" ")}`;
    
    context += `\nMARKET PRICES: `;
    marketPrices.forEach(p => {
      context += `${p.crop} in ${p.market} is ${p.price} ETB per ${p.unit}. `;
    });

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

export const Route = createFileRoute("/api/voice-command")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.LOVABLE_API_KEY;
        if (!key) {
          return Response.json({ error: "AI is not configured." }, { status: 500 });
        }

        let body: VoiceCommandRequestBody;
        try {
          body = (await request.json()) as VoiceCommandRequestBody;
        } catch {
          return Response.json({ error: "Invalid request." }, { status: 400 });
        }

        if (!body.audio) {
          return Response.json({ error: "No audio provided." }, { status: 400 });
        }

        const langLabel = LANG_LABEL[body.lang ?? "en"] ?? "English";
        const dataContext = await buildDataContext();

        const systemPrompt =
          `You are AgriBridge Voice Assistant. The user will speak a command or a question in ${langLabel}. ` +
          `Based on their input, decide if they want to navigate to a page OR if they are asking a question about farm data. ` +
          `Pages available: '/', '/learn', '/assistant', '/market', '/weather', '/sell', '/expert', '/community', '/prices', '/notifications', '/profile'. ` +
          `Current page: ${body.currentPage || '/'}. ` +
          `If they ask a question, answer it clearly and concisely in ${langLabel} using the provided REAL-TIME FARM DATA. ` +
          `If they want to navigate, provide the page path in 'navigateTo'. ` +
          `You MUST respond ONLY with a valid JSON object with two keys: 'navigateTo' (string or null) and 'explanation' (string, your spoken response). ` +
          `Example 1: {"navigateTo": "/market", "explanation": "Going to the market page."} ` +
          `Example 2: {"navigateTo": null, "explanation": "Teff is currently 6000 ETB in Addis Ababa."}` +
          dataContext;

        const messages: ChatMessage[] = [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type: "input_audio",
                input_audio: { data: body.audio.data, format: body.audio.format },
              },
            ],
          },
        ];

        const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Lovable-API-Key": key,
          },
          body: JSON.stringify({ 
            model: "google/gemini-2.5-flash", 
            messages,
            response_format: { type: "json_object" } 
          }),
        });

        if (resp.status === 429) {
          return Response.json({ error: "Too many requests. Please try again in a moment." }, { status: 429 });
        }
        if (resp.status === 402) {
          return Response.json({ error: "AI credits exhausted. Please add credits to continue." }, { status: 402 });
        }
        if (!resp.ok) {
          const detail = await resp.text();
          return Response.json({ error: "AI request failed.", detail }, { status: 502 });
        }

        const json = await resp.json();
        const text: string = json?.choices?.[0]?.message?.content || "{}";
        
        try {
          const parsed = JSON.parse(text);
          return Response.json({ 
            navigateTo: parsed.navigateTo || null, 
            explanation: parsed.explanation || "Sorry, I couldn't understand." 
          });
        } catch {
          return Response.json({ navigateTo: null, explanation: text });
        }
      },
    },
  },
});
