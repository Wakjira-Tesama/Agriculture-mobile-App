import { createFileRoute } from "@tanstack/react-router";
import { Heart, MessageCircle, Users } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { SpeakButton } from "@/components/SpeakButton";
import { useI18n } from "@/lib/i18n";
import { communityPosts } from "@/lib/data";

export const Route = createFileRoute("/community")({
  head: () => ({ meta: [{ title: "AgriBridge — Community" }] }),
  component: Community,
});

function Community() {
  const { t } = useI18n();
  return (
    <AppShell title={t("community")}>
      <div className="mb-4 flex gap-3 overflow-x-auto no-scrollbar">
        {[t("all"), "Q&A", "Success Stories", "Cooperatives", "Forums"].map((c, i) => (
          <button key={c} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold ${i === 0 ? "bg-primary text-primary-foreground" : "bg-card"}`}>{c}</button>
        ))}
      </div>
      <div className="mb-4 flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-secondary"><Users className="h-4 w-4 text-primary" /></span>
        <input placeholder={t("shareCommunity")} className="w-full bg-transparent text-sm outline-none" />
        <button className="rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground">{t("post")}</button>
      </div>
      <div className="space-y-3">
        {communityPosts.map((p, i) => (
          <div key={i} className="rounded-2xl bg-card p-4 shadow-card">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-primary text-sm font-bold text-primary-foreground">{p.author[0]}</span>
              <div>
                <p className="text-sm font-semibold">{p.author}</p>
                <p className="text-xs text-muted-foreground">{p.time} ago</p>
              </div>
              <SpeakButton text={p.text} size={16} className="ml-auto" />
            </div>
            <p className="mt-3 text-sm">{p.text}</p>
            <div className="mt-3 flex gap-5 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Heart className="h-4 w-4" /> {p.likes}</span>
              <span className="flex items-center gap-1.5"><MessageCircle className="h-4 w-4" /> {p.comments}</span>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}