import { useEffect, useState } from "react";
import { Volume2, Square } from "lucide-react";
import { useI18n, SPEECH_LANG } from "@/lib/i18n";

/**
 * Accessibility helper for low-literacy farmers: reads the given text aloud
 * in the currently selected language using the browser's speech synthesis.
 */
export function SpeakButton({
  text,
  className = "",
  size = 18,
}: {
  text: string;
  className?: string;
  size?: number;
}) {
  const { lang, t } = useI18n();
  const [speaking, setSpeaking] = useState(false);
  const [mounted, setMounted] = useState(false);
  const supported = mounted && typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  if (!supported || !text.trim()) return null;

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const synth = window.speechSynthesis;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = SPEECH_LANG[lang] ?? "en-US";
    u.rate = 0.92;
    const match = synth.getVoices().find((v) => v.lang?.startsWith(u.lang.split("-")[0]));
    if (match) u.voice = match;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    setSpeaking(true);
    synth.speak(u);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t("listen")}
      title={t("listen")}
      className={`grid shrink-0 place-items-center rounded-full text-primary transition-colors hover:bg-primary/10 ${className}`}
      style={{ height: size + 16, width: size + 16 }}
    >
      {speaking ? <Square style={{ height: size, width: size }} /> : <Volume2 style={{ height: size, width: size }} />}
    </button>
  );
}