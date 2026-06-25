import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Mic, Square, X, Loader2 } from "lucide-react";
import { useI18n, SPEECH_LANG, type Lang } from "@/lib/i18n";

/**
 * Voice command navigation for low-literacy farmers.
 * Uses AI to understand complex queries and navigate or answer with data.
 */

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const res = r.result as string;
      resolve(res.split(",")[1] ?? "");
    };
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

// Keywords that trigger reading the whole current page aloud instead of navigating.
const READ_WORDS: Record<Lang, string[]> = {
  en: ["read", "read page", "read this", "read it", "tell me", "what is here", "information"],
  am: ["አንብብ", "ይህን አንብብ", "ንገረኝ", "መረጃ"],
  om: ["dubbisi", "naaf dubbisi", "natti himi", "odeeffannoo", "maali jira"],
  so: ["akhri", "ii akhri", "ii sheeg", "macluumaad"],
  ti: ["ኣንብብ", "ንገረኒ", "ሓበሬታ"],
};

// Generic words that are not unique enough to identify a single item.
const GENERIC = new Set([
  "contact", "open", "view", "all", "more", "ok", "go", "select", "buy", "shop",
  "quunnamtii", "la xiriir", "አግኝ", "ርኸብ",
]);

type PageItem = { label: string; keywords: string[]; details: string; el: HTMLElement };

function leadText(container: Element | null): string {
  if (!container) return "";
  const lead = container.querySelector(
    "h1, h2, h3, h4, h5, .font-semibold, .font-bold, strong, p",
  ) as HTMLElement | null;
  return (lead?.innerText || lead?.textContent || "").replace(/\s+/g, " ").trim();
}

function detailText(container: Element | null, fallback: string): string {
  const raw = container
    ? (container as HTMLElement).innerText || container.textContent || ""
    : fallback;
  return raw
    .split("\n")
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter((s) => s.length > 0)
    .join(". ")
    .slice(0, 400);
}

function collectItems(): PageItem[] {
  if (typeof document === "undefined") return [];
  const root = document.querySelector("main") ?? document.body;
  const clickables = Array.from(
    root.querySelectorAll<HTMLElement>("a[href], button, [role='button']"),
  );
  const items: PageItem[] = [];
  const seen = new Set<string>();
  for (const el of clickables) {
    if (el.closest("[data-voice-skip]")) continue;
    const own = (el.innerText || el.textContent || "").replace(/\s+/g, " ").trim();
    const container = el.closest("[class*='card'], li, article") ?? el.parentElement;
    const lead = leadText(container);
    const ownGeneric = !own || own.length < 2 || GENERIC.has(own.toLowerCase());
    const label = (ownGeneric && lead ? lead : own).split("\n")[0].slice(0, 40).trim();
    if (!label) continue;
    const key = label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const keywords = [own, lead]
      .map((w) => w.toLowerCase().trim())
      .filter((w) => w.length >= 2 && !GENERIC.has(w));
    items.push({
      label,
      keywords: keywords.length ? keywords : [key],
      details: detailText(container, label),
      el,
    });
  }
  return items.slice(0, 24);
}

function currentPageKey(): string {
  if (typeof window === "undefined") return "home";
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  const map: Record<string, string> = {
    "/": "home", "/learn": "learn", "/assistant": "assistant", "/market": "market",
    "/weather": "weather", "/sell": "sell", "/expert": "expert", "/community": "community",
    "/prices": "prices", "/notifications": "notifications", "/profile": "profile",
  };
  return map[path] ?? "home";
}

export function VoiceNav() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [heard, setHeard] = useState("");
  const [status, setStatus] = useState<"idle" | "going" | "nomatch" | "reading" | "selected" | "error">("idle");
  const [items, setItems] = useState<PageItem[]>([]);
  
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const itemsRef = useRef<PageItem[]>([]);

  useEffect(() => setMounted(true), []);

  const supported = mounted && typeof window !== "undefined" && navigator.mediaDevices?.getUserMedia;

  const speak = (text: string, onEnd?: () => void) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = SPEECH_LANG[lang] ?? "en-US";
    u.rate = 0.95;
    
    // Attempt to match the voice to the requested language explicitly
    const voices = window.speechSynthesis.getVoices();
    const match = voices.find((v) => v.lang?.startsWith(u.lang.split("-")[0]));
    if (match) u.voice = match;

    if (onEnd) u.onend = onEnd;
    window.speechSynthesis.speak(u);
  };

  const describePage = (onDone?: () => void): PageItem[] => {
    const found = collectItems();
    setItems(found);
    itemsRef.current = found;
    const pageName = t(currentPageKey());
    const intro = t("voiceOnPage").replace("{page}", pageName);
    let speech = intro;
    if (found.length) {
      const names = found.slice(0, 6).map((i) => i.label);
      const more = found.length > 6 ? ` ${t("voiceAndMore")}` : "";
      speech += ` ${t("voiceItemsHere")} ${names.join(", ")}${more}. ${t("voiceSayItem")} ${t("voiceTakeYourTime")}`;
    }
    speak(speech, onDone);
    return found;
  };

  const readPage = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const root = document.querySelector("main") ?? document.body;
    const parts: string[] = [];
    const seen = new Set<string>();
    root
      .querySelectorAll("h1, h2, h3, h4, p, li, button, a, span, label, td, th")
      .forEach((el) => {
        const node = el as HTMLElement;
        if (node.closest("[data-voice-skip]")) return;
        if (node.querySelector("h1, h2, h3, h4, p, li, button, a, label")) return;
        const txt = (node.innerText || node.textContent || "").replace(/\s+/g, " ").trim();
        if (!txt || txt.length < 2 || seen.has(txt)) return;
        seen.add(txt);
        parts.push(txt);
      });
    const full = parts.join(". ");
    if (!full.trim()) {
      speak(t("voiceNothingToRead"));
      setStatus("nomatch");
      return;
    }
    setStatus("reading");
    setOpen(false);
    speak(full);
  };

  const processAudio = async (blob: Blob) => {
    setProcessing(true);
    setStatus("idle");
    try {
      const b64 = await blobToBase64(blob);
      const format = (blob.type || "audio/webm").includes("mp4") ? "m4a" : "webm";
      
      const resp = await fetch("/api/voice-command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audio: { data: b64, format },
          lang,
          currentPage: window.location.pathname,
        }),
      });

      if (!resp.ok) throw new Error("API Error");

      const data = await resp.json();
      
      if (data.explanation) {
        setHeard(data.explanation);
      }

      if (data.navigateTo) {
        setStatus("going");
        speak(data.explanation || t("voiceGoing"));
        setTimeout(() => {
          setOpen(false);
          navigate({ to: data.navigateTo });
        }, 1500);
      } else {
        setStatus("selected");
        speak(data.explanation || t("voiceSelected"));
      }

    } catch (e) {
      console.error(e);
      setStatus("error");
      speak(t("voiceNoMatch"));
    } finally {
      setProcessing(false);
    }
  };

  const stop = () => {
    if (recorderRef.current && recorderRef.current.state === "recording") {
      recorderRef.current.stop();
    }
    setListening(false);
  };

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      
      mr.ondataavailable = (ev) => ev.data.size > 0 && chunksRef.current.push(ev.data);
      
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || "audio/webm" });
        await processAudio(blob);
      };
      
      mr.start();
      recorderRef.current = mr;
      setListening(true);
      setHeard("");
      setStatus("idle");
    } catch (e) {
      console.error(e);
      setStatus("error");
      setListening(false);
    }
  };

  const openPanel = () => {
    setOpen(true);
    setStatus("idle");
    setHeard("");
    describePage(() => setTimeout(start, 300));
  };

  if (!supported) return null;

  return (
    <>
      <button
        type="button"
        onClick={openPanel}
        aria-label={t("voiceNav")}
        title={t("voiceNav")}
        className="fixed bottom-28 right-4 z-40 grid h-16 w-16 place-items-center rounded-full bg-gradient-primary text-primary-foreground shadow-soft active:scale-95 sm:right-[calc(50%-13rem)]"
      >
        <Mic className="h-7 w-7" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 pb-32"
          onClick={() => {
            stop();
            setOpen(false);
          }}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-background p-6 shadow-soft"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">{t("voiceNav")}</h2>
              <button
                type="button"
                onClick={() => {
                  stop();
                  setOpen(false);
                }}
                aria-label={t("voiceClose")}
                className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col items-center gap-4 py-2 text-center">
              <button
                type="button"
                onClick={listening ? stop : start}
                disabled={processing}
                aria-label={listening ? t("voiceClose") : t("voiceNav")}
                className={`grid h-24 w-24 place-items-center rounded-full text-primary-foreground transition ${
                  processing ? "bg-muted text-muted-foreground" :
                  listening ? "animate-pulse bg-destructive" : "bg-gradient-primary"
                }`}
              >
                {processing ? <Loader2 className="h-10 w-10 animate-spin" /> :
                 listening ? <Square className="h-9 w-9" /> : <Mic className="h-10 w-10" />}
              </button>

              <p className="text-sm font-semibold">
                {processing ? t("aiThinking") : listening ? t("voiceListening") : t("voiceHint")}
              </p>

              {heard && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold">AI:</span> “{heard}”
                </p>
              )}
              {status === "going" && (
               <p className="text-sm font-semibold text-primary">{t("voiceGoing")}…</p>
              )}
              {status === "error" && (
                <p className="text-sm font-semibold text-destructive">{t("voiceNoMatch")}</p>
              )}

              {items.length > 0 && !processing && !heard && (
                <div className="mt-1 w-full text-left">
                  <p className="mb-1 text-xs font-semibold">{t("voiceItemsHere")}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {items.slice(0, 8).map((it, idx) => (
                      <span key={idx} className="rounded-full bg-muted px-2.5 py-1 text-xs">
                        {it.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground">{t("voiceHint")}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}