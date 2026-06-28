import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles, Store, GraduationCap, CloudSun, MessageCircleQuestion,
  Users, Tractor, TrendingUp, ChevronRight, Loader2, Wallet as WalletIcon
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { SpeakButton } from "@/components/SpeakButton";
import { useI18n } from "@/lib/i18n";
import { weather } from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AgriBridge — Home" },
      { name: "description", content: "Your farm dashboard: weather, AI assistant, market prices, learning and direct market access." },
    ],
  }),
  component: Index,
});

const quickActions = [
  { to: "/assistant", key: "qa_assistant", icon: Sparkles, bg: "bg-gradient-primary text-primary-foreground" },
  { to: "/sell", key: "qa_sell", icon: Tractor, bg: "bg-card" },
  { to: "/expert", key: "qa_expert", icon: MessageCircleQuestion, bg: "bg-card" },
  { to: "/learn", key: "qa_learn", icon: GraduationCap, bg: "bg-card" },
  { to: "/market", key: "qa_market", icon: Store, bg: "bg-card" },
  { to: "/community", key: "qa_community", icon: Users, bg: "bg-card" },
  { to: "/wallet", key: "wallet", icon: WalletIcon, bg: "bg-card" },
];

function Index() {
  const { t } = useI18n();
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user!.id).single();
      if (error) throw error;
      return data;
    },
  });

  const { data: marketPrices = [], isLoading: isLoadingPrices } = useQuery({
    queryKey: ["market_prices"],
    queryFn: async () => {
      const { data, error } = await supabase.from("market_prices").select("*").order("created_at", { ascending: false }).limit(4);
      if (error) throw error;
      return data;
    },
  });

  const name = profile?.full_name || (user?.user_metadata?.full_name as string) || "Guest";
  const avatar = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "👤";
  const location = profile?.woreda && profile?.region ? `${profile.woreda}, ${profile.region}` : "Welcome";
  const farmSize = profile?.farm_size || "—";

  return (
    <AppShell>
      <section className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{t("greeting")} 👋</p>
          <h1 className="font-display text-2xl font-bold">{name}</h1>
          <p className="text-xs text-muted-foreground">{location} · {farmSize}</p>
        </div>
        <Link to="/profile" className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-primary font-display text-lg font-bold text-primary-foreground shadow-soft">
          {avatar}
        </Link>
      </section>

      {/* Weather widget */}
      <Link to="/weather" className="mb-5 block overflow-hidden rounded-3xl bg-gradient-primary p-5 text-primary-foreground shadow-soft">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm/none opacity-90">{weather.location}</p>
            <p className="mt-2 font-display text-5xl font-bold">{weather.temp}°</p>
            <p className="text-sm opacity-90">{weather.condition}</p>
          </div>
          <div className="text-right text-sm">
            <p className="text-4xl">⛅</p>
            <p className="mt-2 opacity-90">💧 {weather.humidity}%</p>
            <p className="opacity-90">🌧️ {weather.rainChance}%</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-xs">
          ⚠️ {weather.alerts[0].type}: {weather.alerts[0].note}
        </div>
      </Link>

      {/* Quick actions */}
      <section className="mb-6">
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map(({ to, key, icon: Icon, bg }) => (
            <Link key={to} to={to} className={`flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl ${bg} p-2 text-center shadow-card`}>
              <Icon className="h-7 w-7" strokeWidth={1.8} />
              <span className="text-xs font-semibold leading-tight">{t(key)}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Market prices */}
      <section className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">{t("todayPrices")}</h2>
          <Link to="/prices" className="flex items-center text-sm font-semibold text-primary">{t("all")} <ChevronRight className="h-4 w-4" /></Link>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {isLoadingPrices ? (
            <p className="text-sm text-muted-foreground p-2">Loading prices...</p>
          ) : marketPrices.map((p) => (
            <div key={p.id} className="min-w-[140px] rounded-2xl bg-card p-4 shadow-card">
              <p className="font-semibold">{p.crop}</p>
              <p className="text-xs text-muted-foreground">{p.market} · {t("perUnit")} {p.unit}</p>
              <p className="mt-2 font-display text-xl font-bold">{Number(p.price).toLocaleString()} <span className="text-xs font-normal text-muted-foreground">ETB</span></p>
              <p className={`mt-1 flex items-center gap-1 text-xs font-semibold ${p.trend === 'up' ? "text-primary" : p.trend === 'down' ? "text-destructive" : "text-muted-foreground"}`}>
                <TrendingUp className={`h-3.5 w-3.5 ${p.trend === 'down' ? "rotate-180" : ""}`} /> 
                {p.trend === 'up' ? "+ (Up)" : p.trend === 'down' ? "- (Down)" : "Stable"}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* AI assistant promo */}
      <Link to="/assistant" className="mb-4 flex items-center gap-3 rounded-3xl border border-border bg-card p-4 shadow-card">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-accent/20 text-accent"><Sparkles className="h-6 w-6" /></span>
        <div className="flex-1">
          <p className="font-display font-bold">{t("askAI")}</p>
          <p className="text-xs text-muted-foreground">{t("askAIDesc")}</p>
        </div>
        <SpeakButton text={`${t("askAI")}. ${t("askAIDesc")}`} />
      </Link>

      <p className="px-1 pb-2 text-center text-xs text-muted-foreground">
        {t("portalNote")} <Link to="/portal" className="font-semibold text-primary">{t("openPortals")}</Link>
      </p>
    </AppShell>
  );
}
