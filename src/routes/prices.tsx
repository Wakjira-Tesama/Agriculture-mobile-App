import { createFileRoute } from "@tanstack/react-router";
import { TrendingUp, Lightbulb } from "lucide-react";
import { LineChart, Line, XAxis, ResponsiveContainer, Tooltip } from "recharts";
import { AppShell } from "@/components/AppShell";
import { useI18n } from "@/lib/i18n";
import { marketPrices, markets, priceTrend } from "@/lib/data";

export const Route = createFileRoute("/prices")({
  head: () => ({ meta: [{ title: "AgriBridge — Market Prices" }] }),
  component: Prices,
});

const chartData = priceTrend.map((v, i) => ({ day: `D${i + 1}`, price: v }));

function Prices() {
  const { t } = useI18n();
  return (
    <AppShell title={t("marketPricesTitle")}>
      <div className="mb-4 flex gap-2 overflow-x-auto no-scrollbar">
        {markets.map((m, i) => (
          <button key={m} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${i === 1 ? "bg-primary text-primary-foreground" : "bg-card"}`}>{m}</button>
        ))}
      </div>

      <div className="mb-5 rounded-2xl bg-card p-4 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">Maize · Adama</p>
            <p className="font-display text-2xl font-bold">4,200 <span className="text-sm font-normal text-muted-foreground">ETB/100kg</span></p>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary"><TrendingUp className="h-3.5 w-3.5" /> +3.2% {t("thisWeek")}</span>
        </div>
        <div className="mt-3 h-32">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="day" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="price" stroke="var(--primary)" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mb-5 flex gap-3 rounded-2xl border border-accent/40 bg-accent/10 p-4">
        <Lightbulb className="h-5 w-5 shrink-0 text-accent" />
        <p className="text-sm"><span className="font-semibold">{t("bestSellingTime")}</span> {t("bestSellingTip")}</p>
      </div>

      <h2 className="mb-3 font-display text-lg font-bold">{t("allCropsToday")}</h2>
      <div className="space-y-2">
        {marketPrices.map((p) => (
          <div key={p.crop} className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card">
            <div className="flex-1">
              <p className="font-semibold">{p.crop}</p>
              <p className="text-xs text-muted-foreground">{p.market} · {t("perUnit")} {p.unit}</p>
            </div>
            <div className="text-right">
              <p className="font-display font-bold">{p.price.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">ETB</span></p>
              <p className={`text-xs font-semibold ${p.change >= 0 ? "text-primary" : "text-destructive"}`}>{p.change >= 0 ? "+" : ""}{p.change}%</p>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}