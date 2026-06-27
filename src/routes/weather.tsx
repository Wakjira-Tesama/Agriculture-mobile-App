import { createFileRoute } from "@tanstack/react-router";
import { Droplets, Wind, AlertTriangle } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { SpeakButton } from "@/components/SpeakButton";
import { useI18n } from "@/lib/i18n";
import { weather } from "@/lib/data";

export const Route = createFileRoute("/weather")({
  head: () => ({ meta: [{ title: "AgriBridge — Weather & Climate" }] }),
  component: Weather,
});

function Weather() {
  const { t } = useI18n();
  return (
    <AppShell title={t("weatherTitle")}>
      <div className="mb-5 rounded-3xl bg-gradient-primary p-6 text-center text-primary-foreground shadow-soft">
        <p className="opacity-90">{weather.location}</p>
        <p className="my-1 font-display text-6xl font-bold">{weather.temp}°</p>
        <p className="opacity-90">{weather.condition}</p>
        <div className="mt-4 flex justify-center gap-6 text-sm">
          <span className="flex items-center gap-1.5"><Droplets className="h-4 w-4" /> {weather.humidity}%</span>
          <span className="flex items-center gap-1.5"><Wind className="h-4 w-4" /> {weather.wind} km/h</span>
          <span>🌧️ {weather.rainChance}%</span>
        </div>
      </div>

      <h2 className="mb-3 font-display text-lg font-bold">{t("forecast7")}</h2>
      <div className="mb-6 space-y-1 rounded-2xl bg-card p-2 shadow-card">
        {weather.forecast.map((d) => (
          <div key={d.day} className="flex items-center gap-3 rounded-xl px-3 py-2.5">
            <span className="w-10 font-semibold">{d.day}</span>
            <span className="text-xl">{d.icon}</span>
            <span className="flex-1 text-sm text-muted-foreground">💧 {d.rain}%</span>
            <span className="font-semibold">{d.hi}°</span>
            <span className="text-muted-foreground">{d.lo}°</span>
          </div>
        ))}
      </div>

      <h2 className="mb-3 font-display text-lg font-bold">{t("activeAlerts")}</h2>
      <div className="space-y-3">
        {weather.alerts.map((a) => (
          <div key={a.type} className="flex gap-3 rounded-2xl border border-accent/40 bg-accent/10 p-4">
            <AlertTriangle className="h-5 w-5 shrink-0 text-accent" />
            <div className="flex-1">
              <p className="font-semibold">{a.type} <span className="ml-1 rounded bg-accent/20 px-1.5 py-0.5 text-xs text-accent">{a.level}</span></p>
              <p className="text-sm text-muted-foreground">{a.note}</p>
            </div>
            <SpeakButton text={`${a.type}. ${a.note}`} size={16} />
          </div>
        ))}
      </div>
    </AppShell>
  );
}