import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MapPin, Sprout, Beef, Ruler, Droplets, Languages, ChevronRight, LogOut, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { LANGUAGES, useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "AgriBridge — Profile" }] }),
  component: Profile,
});

function Profile() {
  const { lang, setLang, t } = useI18n();
  const { user, roles, signOut } = useAuth();
  const navigate = useNavigate();
  
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user!.id).single();
      if (error) throw error;
      return data;
    },
  });

  const name = profile?.full_name || (user?.user_metadata?.full_name as string) || "Guest User";
  const handleSignOut = async () => { await signOut(); navigate({ to: "/auth" }); };
  
  const rows = [
    { icon: MapPin, label: t("pLocation"), value: profile?.woreda && profile?.region ? `${profile.woreda}, ${profile.region}` : "—" },
    { icon: Ruler, label: t("pFarmSize"), value: profile?.farm_size || "—" },
    { icon: Sprout, label: t("pMainCrops"), value: profile?.main_crops?.join(", ") || "—" },
    { icon: Beef, label: t("pLivestock"), value: profile?.livestock?.join(", ") || "—" },
    { icon: Droplets, label: t("pIrrigation"), value: profile?.irrigation || "—" },
  ];

  return (
    <AppShell title={t("myProfile")}>
      <div className="mb-5 flex flex-col items-center rounded-3xl bg-gradient-primary p-6 text-center text-primary-foreground shadow-soft">
        <div className="grid h-20 w-20 place-items-center rounded-full bg-white/20 font-display text-3xl font-bold uppercase">{name.split(" ").map((n) => n[0]).join("").slice(0, 2)}</div>
        <p className="mt-3 font-display text-xl font-bold">{name}</p>
        <p className="text-sm capitalize opacity-90">{roles[0] ?? t("farmer")}{user?.email ? ` · ${user.email}` : ""}</p>
        {!user && <Link to="/auth" className="mt-3 rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold">{t("signIn")}</Link>}
      </div>

      <div className="mb-5 divide-y divide-border rounded-2xl bg-card shadow-card">
        {isLoading ? (
          <div className="flex justify-center p-6"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          rows.map((r) => (
            <div key={r.label} className="flex items-center gap-3 px-4 py-3.5">
              <r.icon className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">{r.label}</span>
              <span className="ml-auto text-sm font-semibold">{r.value}</span>
            </div>
          ))
        )}
      </div>

      <div className="mb-5 rounded-2xl bg-card p-4 shadow-card">
        <p className="mb-3 flex items-center gap-2 font-semibold"><Languages className="h-4 w-4 text-primary" /> {t("preferredLanguage")}</p>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((l) => (
            <button key={l.code} onClick={() => { setLang(l.code); supabase.from("profiles").update({ preferred_language: l.code as any }).eq("id", user?.id || ""); }} className={`rounded-full px-3 py-1.5 text-sm font-semibold ${lang === l.code ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>{l.native}</button>
          ))}
        </div>
      </div>

      <Link to="/portal" className="mb-3 flex items-center gap-3 rounded-2xl bg-card p-4 shadow-card">
        <span className="font-semibold">{t("portalsRow")}</span>
        <ChevronRight className="ml-auto h-5 w-5 text-muted-foreground" />
      </Link>
      {user && (
        <button onClick={handleSignOut} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/30 p-4 font-semibold text-destructive">
          <LogOut className="h-5 w-5" /> {t("signOut")}
        </button>
      )}
    </AppShell>
  );
}