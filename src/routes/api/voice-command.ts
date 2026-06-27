import { createFileRoute } from "@tanstack/react-router";
import { weather } from "@/lib/data";

type ContentBlock =
  | { type: "text"; text: string }
  | { type: "input_audio"; input_audio: { data: string; format: string } };

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string | ContentBlock[];
};

type VoiceCommandRequestBody = {
  audio?: { data: string; format: string };
  text?: string;
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

// Local navigation fallback when AI is unavailable
function matchLocalNav(text: string, lang?: string): { path: string; explanation: string } | null {
  const lower = text.toLowerCase().trim();
  const l = lang || "en";
  const routes: { kw: string[]; path: string; label: Record<string, string> }[] = [
    { kw: ["home", "mana", "guriga", "jalqaba", "gala"], path: "/", label: { en: "Going to Home", om: "Gara Manaa deemaa jira", am: "ወደ መነሻ በመሄድ ላይ" } },
    { kw: ["learn", "baradhu", "barumsa", "baro", "tamari", "barnoota"], path: "/learn", label: { en: "Opening Learning Center", om: "Wiirtuu Barumsaa banaa jira", am: "የትምህርት ማዕከል በመክፈት ላይ" } },
    { kw: ["market", "gabaa", "suuq", "suuqa", "gurgurtaa"], path: "/market", label: { en: "Opening Marketplace", om: "Iddoo Gabaa banaa jira", am: "ገበያ በመክፈት ላይ" } },
    { kw: ["assistant", "gargaaraa", "kaaliye", "gorsaa", "ai"], path: "/assistant", label: { en: "Opening AI Assistant", om: "Gargaaraa AI banaa jira", am: "AI ረዳት በመክፈት ላይ" } },
    { kw: ["weather", "qilleensa", "qilleensaa", "cimilada", "cimilo", "rooba"], path: "/weather", label: { en: "Opening Weather", om: "Haala Qilleensaa banaa jira", am: "የአየር ሁኔታ በመክፈት ላይ" } },
    { kw: ["sell", "gurguri", "iibi", "oomisha"], path: "/sell", label: { en: "Opening Sell page", om: "Fuula Gurgurtaa banaa jira", am: "ምርት ሽጥ በመክፈት ላይ" } },
    { kw: ["expert", "ogeessa", "ogeessaa", "khabiir", "gorsa"], path: "/expert", label: { en: "Opening Expert Advisory", om: "Gorsa Ogeessaa banaa jira", am: "የባለሙያ ምክር በመክፈት ላይ" } },
    { kw: ["community", "hawaasa", "hawaasaa", "bulshada"], path: "/community", label: { en: "Opening Community", om: "Hawaasa banaa jira", am: "ማህበረሰብ በመክፈት ላይ" } },
    { kw: ["prices", "price", "gatii", "gatiiwwan", "qiimaha"], path: "/prices", label: { en: "Opening Prices", om: "Gatii Gabaa banaa jira", am: "ዋጋ በመክፈት ላይ" } },
    { kw: ["profile", "profaayilii", "astaan"], path: "/profile", label: { en: "Opening Profile", om: "Profaayilii banaa jira", am: "መገለጫ በመክፈት ላይ" } },
    { kw: ["notifications", "beeksisa", "beeksisaa", "ogeysiisyo"], path: "/notifications", label: { en: "Opening Notifications", om: "Beeksisa banaa jira", am: "ማሳወቂያ በመክፈት ላይ" } },
  ];
  for (const route of routes) {
    for (const k of route.kw) {
      if (lower.includes(k)) {
        return { path: route.path, explanation: route.label[l] || route.label.en };
      }
    }
  }
  return null;
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

        if (!body.audio && !body.text) {
          return Response.json({ error: "No audio or text provided." }, { status: 400 });
        }

        const langLabel = LANG_LABEL[body.lang ?? "en"] ?? "English";

        // If no API key, use local navigation matching as fallback
        if (!key) {
          if (body.text) {
            const nav = matchLocalNav(body.text, body.lang);
            if (nav) {
              return Response.json({ navigateTo: nav.path, explanation: nav.explanation });
            }
          }
          return Response.json({ error: "AI is not configured. Please add LOVABLE_API_KEY to .env" }, { status: 500 });
        }

        const dataContext = await buildDataContext();

        const systemPrompt =
          `You are AgriBridge Voice Assistant for Ethiopian farmers. ` +
          `The user has given a command or question in ${langLabel}. ` +
          `Based on their input, decide if they want to navigate to a page OR if they are asking a question about farming/data. ` +
          `You MUST understand Afaan Oromoo, Amharic, Somali, Tigrinya and English equally well. ` +
          `Pages available: '/' (home), '/learn' (learning/barumsa), '/assistant' (AI assistant/gargaaraa), '/market' (marketplace/gabaa), '/weather' (weather/qilleensaa), '/sell' (sell produce/gurguri), '/expert' (expert advisory/ogeessa), '/community' (community/hawaasa), '/prices' (market prices/gatii), '/notifications' (notifications/beeksisa), '/profile' (profile/profaayilii). ` +
          `Current page: ${body.currentPage || '/'}. ` +
          `If they ask a question about farming, crops, weather, prices, etc., answer it clearly and concisely in ${langLabel} using the provided REAL-TIME FARM DATA. ` +
          `If they want to navigate, provide the page path in 'navigateTo'. ` +
          `You MUST respond ONLY with a valid JSON object with two keys: 'navigateTo' (string or null) and 'explanation' (string, your spoken response in ${langLabel}). ` +
          `Example navigation: {"navigateTo": "/market", "explanation": "Gara Gabaa deemaa jira."} ` +
          `Example question: {"navigateTo": null, "explanation": "Gatiin Xaafii Finfinnee keessatti 6000 ETB."}` +
          dataContext;

        // Build user content blocks - text and/or audio
        const userContent: ContentBlock[] = [];
        if (body.text) {
          userContent.push({ type: "text", text: body.text });
        }
        if (body.audio) {
          userContent.push({
            type: "input_audio",
            input_audio: { data: body.audio.data, format: body.audio.format },
          });
        }

        const messages: ChatMessage[] = [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
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
