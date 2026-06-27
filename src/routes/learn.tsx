import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Play, Download, Heart, Clock } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { SpeakButton } from "@/components/SpeakButton";
import { useI18n } from "@/lib/i18n";
import { learningCategories, lessons } from "@/lib/data";

export const Route = createFileRoute("/learn")({
  head: () => ({ meta: [{ title: "AgriBridge — Learning Center" }] }),
  component: Learn,
});

function Learn() {
  const [active, setActive] = useState<string | null>(null);
  const { t } = useI18n();
  const filtered = active ? lessons.filter((l) => l.category === active) : lessons;
  return (
    <AppShell title={t("learningCenter")}>
      <p className="mb-4 text-sm text-muted-foreground">{t("learnDesc")}</p>
      <div className="mb-5 flex gap-3 overflow-x-auto no-scrollbar pb-1">
        <button onClick={() => setActive(null)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold ${!active ? "bg-primary text-primary-foreground" : "bg-card"}`}>{t("all")}</button>
        {learningCategories.map((c) => (
          <button key={c.name} onClick={() => setActive(c.name)} className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold ${active === c.name ? "bg-primary text-primary-foreground" : "bg-card"}`}>
            <span>{c.emoji}</span> {c.name}
          </button>
        ))}
      </div>

      {!active && (
        <div className="mb-6 grid grid-cols-4 gap-3">
          {learningCategories.map((c) => (
            <button key={c.name} onClick={() => setActive(c.name)} className="flex flex-col items-center gap-1 rounded-2xl bg-card p-3 shadow-card">
              <span className="text-2xl">{c.emoji}</span>
              <span className="text-[10px] font-semibold leading-tight">{c.name}</span>
            </button>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((l) => (
          <div key={l.id} className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-secondary text-2xl">{l.emoji}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{l.title}</p>
              <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded bg-accent/20 px-1.5 py-0.5 font-semibold text-accent">{l.type}</span>
                <Clock className="h-3 w-3" /> {l.duration}
              </p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <SpeakButton text={l.title} size={16} />
              <button className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground"><Play className="h-4 w-4" /></button>
              <div className="flex gap-1 text-muted-foreground">
                <button className="grid h-6 w-6 place-items-center"><Download className="h-3.5 w-3.5" /></button>
                <button className="grid h-6 w-6 place-items-center"><Heart className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}