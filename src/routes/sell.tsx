import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Camera, Check, Loader2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/sell")({
  head: () => ({ meta: [{ title: "AgriBridge — Sell Produce" }] }),
  component: Sell,
});

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold">{label}</span>
      <input {...props} className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary" />
    </label>
  );
}

function Sell() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useI18n();
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({ crop: "", quantity: "", unit: "quintal", price: "", location: "", harvest_date: "" });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  if (!user) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <span className="mb-4 text-5xl">🔒</span>
          <h1 className="font-display text-xl font-bold">{t("signInToSell")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("signInToSellDesc")}</p>
          <Link to="/auth" className="mt-6 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">{t("signInRegister")}</Link>
        </div>
      </AppShell>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    const { error } = await supabase.from("crop_listings").insert({
      farmer_id: user.id,
      crop: form.crop,
      quantity: Number(form.quantity) || 0,
      unit: form.unit,
      price: Number(form.price) || 0,
      location: form.location,
      harvest_date: form.harvest_date || null,
    });
    setLoading(false);
    if (error) { setErr(error.message); return; }
    setDone(true);
  };

  if (done) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="mb-4 grid h-20 w-20 place-items-center rounded-full bg-primary/10 text-primary"><Check className="h-10 w-10" /></span>
          <h1 className="font-display text-2xl font-bold">{t("listingPublished")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("listingPublishedDesc")}</p>
          <button onClick={() => navigate({ to: "/market" })} className="mt-6 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">{t("viewMarketplace")}</button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title={t("sellProduce")}>
      <form onSubmit={submit} className="space-y-4">
        <button type="button" className="flex aspect-[2/1] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-card text-muted-foreground">
          <Camera className="h-8 w-8" />
          <span className="text-sm font-semibold">{t("addPhotos")}</span>
        </button>
        <Field label={t("cropName")} placeholder="e.g. White Teff" value={form.crop} onChange={(e) => set("crop", e.target.value)} required />
        <div className="grid grid-cols-2 gap-3">
          <Field label={t("quantity")} type="number" placeholder="20" value={form.quantity} onChange={(e) => set("quantity", e.target.value)} required />
          <Field label={t("unit")} placeholder="quintal" value={form.unit} onChange={(e) => set("unit", e.target.value)} required />
        </div>
        <Field label={t("priceEtb")} type="number" placeholder="12300" value={form.price} onChange={(e) => set("price", e.target.value)} required />
        <Field label={t("location")} placeholder="Adama, Oromia" value={form.location} onChange={(e) => set("location", e.target.value)} required />
        <Field label={t("harvestDate")} type="date" value={form.harvest_date} onChange={(e) => set("harvest_date", e.target.value)} />
        {err && <p className="text-sm text-destructive">{err}</p>}
        <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-primary py-3.5 font-semibold text-primary-foreground shadow-soft disabled:opacity-60">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />} {t("publishListing")}
        </button>
      </form>
    </AppShell>
  );
}