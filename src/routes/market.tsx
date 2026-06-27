import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, BadgeCheck, MapPin, Plus } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/market")({
  head: () => ({ meta: [{ title: "AgriBridge — Marketplace" }] }),
  component: Market,
});

function Market() {
  const { t } = useI18n();
  const { data: dbListings } = useQuery({
    queryKey: ["listings"],
    queryFn: async () => {
      const { data } = await supabase.from("crop_listings").select("*").eq("status", "active").order("created_at", { ascending: false });
      return (data ?? []).map((l) => ({
        id: l.id,
        crop: l.crop,
        qty: `${l.quantity} ${l.unit}`,
        price: `${Number(l.price).toLocaleString()}/${l.unit}`,
        location: l.location ?? "—",
        date: l.harvest_date ? `Harvested ${l.harvest_date}` : "Fresh",
        farmer: "Farmer",
        verified: l.verified,
        emoji: "🌾",
      }));
    },
  });
  const listings = dbListings ?? [];
  return (
    <AppShell title={t("marketplace")}>
      <div className="mb-4 flex items-center gap-2 rounded-2xl bg-card px-4 py-3 shadow-card">
        <Search className="h-5 w-5 text-muted-foreground" />
        <input placeholder={t("search")} className="w-full bg-transparent text-sm outline-none" />
      </div>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{listings.length} {t("listingsNear")}</p>
        <Link to="/prices" className="text-sm font-semibold text-primary">{t("marketPricesLink")}</Link>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {listings.map((l) => (
          <div key={l.id} className="overflow-hidden rounded-2xl bg-card shadow-card">
            <div className="grid h-24 place-items-center bg-secondary text-5xl">{l.emoji}</div>
            <div className="p-3">
              <div className="flex items-center gap-1">
                <p className="truncate font-semibold">{l.crop}</p>
                {l.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />}
              </div>
              <p className="font-display font-bold text-primary">{l.price}</p>
              <p className="text-xs text-muted-foreground">{l.qty}</p>
              <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground"><MapPin className="h-3 w-3" /> {l.location}</p>
              <button className="mt-2 w-full rounded-lg bg-primary/10 py-1.5 text-xs font-semibold text-primary">{t("contact")}</button>
            </div>
          </div>
        ))}
      </div>
      <Link to="/sell" className="fixed bottom-24 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-gradient-harvest px-5 py-3 font-semibold text-accent-foreground shadow-soft">
        <Plus className="h-5 w-5" /> {t("sellProduce")}
      </Link>
    </AppShell>
  );
}