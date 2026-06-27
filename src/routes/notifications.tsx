import { createFileRoute } from "@tanstack/react-router";
import { CloudRain, Store, MessageSquare, TrendingUp, Syringe } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { SpeakButton } from "@/components/SpeakButton";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "AgriBridge — Notifications" }] }),
  component: Notifications,
});

const items = [
  { icon: CloudRain, color: "bg-blue-500/15 text-blue-600", title: "Heavy Rain Warning", text: "Expected Wed–Thu. Protect your harvested teff.", time: "1h", unread: true },
  { icon: Store, color: "bg-primary/15 text-primary", title: "New Buyer Offer", text: "Selam Trading offered 12,500 ETB/100kg for your teff.", time: "3h", unread: true },
  { icon: MessageSquare, color: "bg-accent/15 text-accent", title: "Advisory Response", text: "Dr. Hanna replied to your coffee leaf question.", time: "5h", unread: false },
  { icon: TrendingUp, color: "bg-primary/15 text-primary", title: "Market Price Change", text: "Coffee up +5.1% in Hawassa today.", time: "8h", unread: false },
  { icon: Syringe, color: "bg-red-500/15 text-red-600", title: "Vaccination Reminder", text: "Cattle FMD vaccination due this week.", time: "1d", unread: false },
];

function Notifications() {
  const { t } = useI18n();
  return (
    <AppShell title={t("notificationsTitle")}>
      <div className="space-y-2">
        {items.map((n, i) => (
          <div key={i} className={`flex gap-3 rounded-2xl p-4 shadow-card ${n.unread ? "bg-card" : "bg-card/60"}`}>
            <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${n.color}`}><n.icon className="h-5 w-5" /></span>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{n.title}</p>
                <span className="text-xs text-muted-foreground">{n.time}</span>
              </div>
              <p className="text-sm text-muted-foreground">{n.text}</p>
            </div>
            <SpeakButton text={`${n.title}. ${n.text}`} size={16} />
            {n.unread && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent" />}
          </div>
        ))}
      </div>
    </AppShell>
  );
}