import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Send, Mic, Camera, Sparkles, Loader2, Square, X } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useI18n, SPEECH_LANG } from "@/lib/i18n";

export const Route = createFileRoute("/assistant")({
  head: () => ({ meta: [{ title: "AgriBridge — AI Assistant" }] }),
  component: Assistant,
});

type Msg = { role: "user" | "assistant"; text: string; image?: string };

const suggestions = [
  "When should I plant teff?",
  "Yellow spots on my coffee leaves",
  "Best fertilizer for maize?",
  "Will it rain this week?",
];

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

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

function Assistant() {
  const { lang, t } = useI18n();
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "assistant",
      text:
        "Selam! Akkam! I'm your AgriBridge assistant 🌿 Ask me anything about your farm — type, speak, or upload a photo.",
    },
  ]);
  const [input, setInput] = useState("");
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Keep the welcome message in the selected language until the chat starts.
  useEffect(() => {
    setMsgs((m) => (m.length <= 1 ? [{ role: "assistant", text: t("aiWelcome") }] : m));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  async function callAI(
    nextMsgs: Msg[],
    opts: { image?: string | null; audio?: { data: string; format: string } | null } = {},
  ) {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMsgs
            .filter((m) => m.text || m.image)
            .map((m) => ({ role: m.role, text: m.text })),
          image: opts.image ?? null,
          audio: opts.audio ?? null,
          lang,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setError(data?.error ?? "Something went wrong.");
        return;
      }
      setMsgs((m) => [...m, { role: "assistant", text: data.text }]);
      
      // Auto-play voice if the user input was via audio
      if (opts.audio && typeof window !== "undefined" && "speechSynthesis" in window) {
        const synth = window.speechSynthesis;
        synth.cancel();
        const u = new SpeechSynthesisUtterance(data.text);
        u.lang = SPEECH_LANG[lang] ?? "en-US";
        u.rate = 0.92;
        const match = synth.getVoices().find((v) => v.lang?.startsWith(u.lang.split("-")[0]));
        if (match) u.voice = match;
        synth.speak(u);
      }
      
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  const send = (text: string) => {
    const trimmed = text.trim();
    if ((!trimmed && !pendingImage) || loading) return;
    const userMsg: Msg = {
      role: "user",
      text: trimmed || (pendingImage ? "(photo)" : ""),
      image: pendingImage ?? undefined,
    };
    const next = [...msgs, userMsg];
    setMsgs(next);
    setInput("");
    const img = pendingImage;
    setPendingImage(null);
    void callAI(next, { image: img });
  };

  const onPickPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = await fileToDataUrl(f);
    setPendingImage(url);
    e.target.value = "";
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (ev) => ev.data.size > 0 && chunksRef.current.push(ev.data);
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || "audio/webm" });
        const b64 = await blobToBase64(blob);
        const format = (mr.mimeType || "audio/webm").includes("mp4") ? "m4a" : "webm";
        const userMsg: Msg = { role: "user", text: "🎤 Voice question" };
        const next = [...msgs, userMsg];
        setMsgs(next);
        void callAI(next, { audio: { data: b64, format } });
      };
      mr.start();
      recorderRef.current = mr;
      setRecording(true);
    } catch {
      setError("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    setRecording(false);
  };

  return (
    <AppShell>
      <div className="mb-4 flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary text-primary-foreground">
          <Sparkles className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-display text-lg font-bold leading-none">{t("aiTitle")}</h1>
          <p className="text-xs text-primary">{t("aiStatus")}</p>
        </div>
      </div>

      <div className="space-y-3 pb-40">
        {msgs.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
              m.role === "user"
                ? "ml-auto bg-primary text-primary-foreground"
                : "bg-card shadow-card"
            }`}
          >
            {m.image && (
              <img
                src={m.image}
                alt="uploaded crop"
                className="mb-2 max-h-40 rounded-lg object-cover"
              />
            )}
            {m.text}
          </div>
        ))}
        {loading && (
          <div className="flex max-w-[85%] items-center gap-2 rounded-2xl bg-card px-4 py-2.5 text-sm shadow-card">
            <Loader2 className="h-4 w-4 animate-spin" /> {t("aiThinking")}
          </div>
        )}
        {error && (
          <div className="max-w-[85%] rounded-2xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
            {error}
          </div>
        )}
      </div>

      {msgs.length <= 1 && !loading && (
        <div className="mt-4 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="fixed bottom-24 left-1/2 z-30 w-full max-w-md -translate-x-1/2 px-4">
        {pendingImage && (
          <div className="mb-2 inline-flex items-center gap-2 rounded-xl border border-border bg-background p-1.5 shadow-soft">
            <img src={pendingImage} alt="preview" className="h-12 w-12 rounded-lg object-cover" />
            <button
              onClick={() => setPendingImage(null)}
              className="grid h-7 w-7 place-items-center rounded-full bg-muted text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        <div className="flex items-center gap-2 rounded-full border border-border bg-background px-2 py-1.5 shadow-soft">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={onPickPhoto}
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={loading}
            className="grid h-10 w-10 place-items-center rounded-full text-muted-foreground"
          >
            <Camera className="h-5 w-5" />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
            placeholder={t("aiPlaceholder")}
            disabled={loading}
            className="w-full bg-transparent text-sm outline-none"
          />
          <button
            onClick={recording ? stopRecording : startRecording}
            disabled={loading}
            className={`grid h-10 w-10 place-items-center rounded-full ${
              recording ? "bg-destructive text-destructive-foreground" : "text-muted-foreground"
            }`}
          >
            {recording ? <Square className="h-4 w-4" /> : <Mic className="h-5 w-5" />}
          </button>
          <button
            onClick={() => send(input)}
            disabled={loading}
            className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </AppShell>
  );
}
