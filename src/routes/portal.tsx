import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ShoppingCart, Stethoscope, Shield, Users, TrendingUp, Package,
  DollarSign, BadgeCheck, ArrowLeft, BarChart3,
} from "lucide-react";
import { listings, advisoryTickets, marketPrices } from "@/lib/data";

export const Route = createFileRoute("/portal")({
  head: () => ({ meta: [{ title: "AgriBridge — Web Portals" }] }),
  component: Portal,
});

type Role = "buyer" | "expert" | "admin" | null;

const roles = [
  { id: "buyer" as const, name: "Buyer Portal", desc: "Discover produce, place orders, message farmers, manage payments.", icon: ShoppingCart },
  { id: "expert" as const, name: "Expert Dashboard", desc: "Advisory requests, crop diagnosis, livestock consultation.", icon: Stethoscope },
  { id: "admin" as const, name: "Admin Dashboard", desc: "User & content management, verification, analytics & reports.", icon: Shield },
];

function Stat({ icon: Icon, label, value, trend }: { icon: typeof Users; label: string; value: string; trend?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-center justify-between">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span>
        {trend && <span className="text-xs font-semibold text-primary">{trend}</span>}
      </div>
      <p className="mt-3 font-display text-2xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function Portal() {
  const [role, setRole] = useState<Role>(null);

  return (
    <div className="min-h-dvh bg-background">
      <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary text-lg shadow-soft">🌿</span>
          <span className="font-display text-lg font-bold">Agri<span className="text-primary">Bridge</span> <span className="text-sm font-normal text-muted-foreground">Web</span></span>
        </Link>
        <Link to="/" className="flex items-center gap-1.5 text-sm font-semibold text-primary"><ArrowLeft className="h-4 w-4" /> Farmer App</Link>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {!role && (
          <>
            <h1 className="font-display text-3xl font-bold">Web Portals</h1>
            <p className="mt-1 text-muted-foreground">Role-based dashboards for buyers, experts and administrators.</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {roles.map((r) => (
                <button key={r.id} onClick={() => setRole(r.id)} className="rounded-3xl border border-border bg-card p-6 text-left shadow-card transition hover:shadow-soft">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground"><r.icon className="h-6 w-6" /></span>
                  <p className="mt-4 font-display text-lg font-bold">{r.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{r.desc}</p>
                </button>
              ))}
            </div>
          </>
        )}

        {role && (
          <>
            <button onClick={() => setRole(null)} className="mb-5 flex items-center gap-1.5 text-sm font-semibold text-primary"><ArrowLeft className="h-4 w-4" /> All portals</button>

            {role === "buyer" && (
              <>
                <h1 className="font-display text-2xl font-bold">Buyer Portal</h1>
                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  <Stat icon={Package} label="Active Orders" value="12" trend="+3" />
                  <Stat icon={DollarSign} label="Spent (ETB)" value="284K" trend="+8%" />
                  <Stat icon={BadgeCheck} label="Saved Farmers" value="27" />
                </div>
                <h2 className="mt-8 font-display text-lg font-bold">Product Discovery</h2>
                <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {listings.map((l) => (
                    <div key={l.id} className="rounded-2xl border border-border bg-card p-4 shadow-card">
                      <div className="grid h-20 place-items-center rounded-xl bg-secondary text-4xl">{l.emoji}</div>
                      <p className="mt-2 font-semibold">{l.crop}</p>
                      <p className="text-sm text-primary">{l.price}</p>
                      <p className="text-xs text-muted-foreground">{l.farmer} · {l.location}</p>
                      <button className="mt-2 w-full rounded-lg bg-primary py-1.5 text-sm font-semibold text-primary-foreground">Place Order</button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {role === "expert" && (
              <>
                <h1 className="font-display text-2xl font-bold">Expert Dashboard</h1>
                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  <Stat icon={Stethoscope} label="Open Requests" value="8" />
                  <Stat icon={BadgeCheck} label="Resolved" value="146" trend="+12" />
                  <Stat icon={TrendingUp} label="Rating" value="4.9" />
                </div>
                <h2 className="mt-8 font-display text-lg font-bold">Advisory Requests</h2>
                <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
                  {advisoryTickets.map((t) => (
                    <div key={t.id} className="flex items-center gap-4 border-b border-border px-5 py-4 last:border-0">
                      <span className="text-sm font-semibold text-muted-foreground">#{t.id}</span>
                      <span className="flex-1 font-medium">{t.title}</span>
                      <span className="text-sm text-muted-foreground">{t.date}</span>
                      <button className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground">Respond</button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {role === "admin" && (
              <>
                <h1 className="font-display text-2xl font-bold">Admin Dashboard</h1>
                <div className="mt-5 grid gap-4 sm:grid-cols-4">
                  <Stat icon={Users} label="Total Users" value="38,420" trend="+6.2%" />
                  <Stat icon={TrendingUp} label="Transactions" value="9,310" trend="+11%" />
                  <Stat icon={DollarSign} label="GMV (ETB)" value="14.2M" trend="+9%" />
                  <Stat icon={BadgeCheck} label="Pending Verifications" value="54" />
                </div>
                <div className="mt-8 grid gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
                    <h2 className="flex items-center gap-2 font-display text-lg font-bold"><BarChart3 className="h-5 w-5 text-primary" /> Top Crops by Volume</h2>
                    <div className="mt-4 space-y-3">
                      {marketPrices.slice(0, 5).map((p, i) => (
                        <div key={p.crop}>
                          <div className="flex justify-between text-sm"><span>{p.crop}</span><span className="text-muted-foreground">{90 - i * 14}%</span></div>
                          <div className="mt-1 h-2 rounded-full bg-secondary"><div className="h-2 rounded-full bg-gradient-primary" style={{ width: `${90 - i * 14}%` }} /></div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
                    <h2 className="font-display text-lg font-bold">Verification Queue</h2>
                    <div className="mt-4 space-y-3">
                      {["Selam Trading (Buyer)", "Dr. Yonas K. (Expert)", "Adama Coop (Cooperative)"].map((n) => (
                        <div key={n} className="flex items-center gap-3 rounded-xl bg-secondary/40 px-4 py-3">
                          <span className="flex-1 text-sm font-medium">{n}</span>
                          <button className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">Verify</button>
                          <button className="rounded-lg bg-muted px-3 py-1.5 text-xs font-semibold">Reject</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}