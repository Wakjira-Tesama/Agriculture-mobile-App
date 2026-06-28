import { createFileRoute } from "@tanstack/react-router";
import { CreditCard, ArrowDownLeft, ArrowUpRight, History } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/wallet")({
  head: () => ({ meta: [{ title: "AgriBridge — Wallet" }] }),
  component: Wallet,
});

function Wallet() {
  const { t } = useI18n();
  const { user } = useAuth();

  const { data: wallet, isLoading } = useQuery({
    queryKey: ["wallet", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("wallets").select("*").eq("user_id", user!.id).single();
      if (error && error.code !== 'PGRST116') throw error; // Ignore not found
      return data || { balance: 0 };
    },
  });

  return (
    <AppShell title={t("wallet") || "My Wallet"}>
      <div className="mb-6 rounded-3xl bg-gradient-primary p-6 text-primary-foreground shadow-soft">
        <p className="text-sm opacity-90 mb-1">Available Balance</p>
        <h2 className="font-display text-4xl font-bold">
          {isLoading ? "..." : Number(wallet?.balance || 0).toLocaleString()} <span className="text-lg font-normal">ETB</span>
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center gap-2 rounded-xl bg-white/20 py-3 font-semibold hover:bg-white/30 transition-colors">
            <ArrowDownLeft size={18} /> Deposit
          </button>
          <button className="flex items-center justify-center gap-2 rounded-xl bg-white/20 py-3 font-semibold hover:bg-white/30 transition-colors">
            <ArrowUpRight size={18} /> Withdraw
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-display text-lg font-bold mb-3">Linked Accounts</h3>
        <div className="grid gap-3">
          <div className="flex items-center justify-between rounded-2xl bg-card p-4 shadow-card border border-border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-100 text-green-700 flex items-center justify-center font-bold text-lg">
                T
              </div>
              <div>
                <p className="font-bold">Telebirr</p>
                <p className="text-xs text-muted-foreground">+251 911 *** ***</p>
              </div>
            </div>
            <button className="text-sm font-semibold text-primary">Manage</button>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-card p-4 shadow-card border border-border opacity-50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg">
                C
              </div>
              <div>
                <p className="font-bold">CBE Birr</p>
                <p className="text-xs text-muted-foreground">Not Linked</p>
              </div>
            </div>
            <button className="text-sm font-semibold text-primary">Link</button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-display text-lg font-bold mb-3 flex items-center gap-2">
          <History size={20} /> Recent Transactions
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-2xl bg-card p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
                <ArrowDownLeft size={18} />
              </div>
              <div>
                <p className="font-bold">Sold Teff to Selam PLC</p>
                <p className="text-xs text-muted-foreground">Today, 10:30 AM</p>
              </div>
            </div>
            <p className="font-bold text-green-600">+4,500 ETB</p>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-card p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center">
                <ArrowUpRight size={18} />
              </div>
              <div>
                <p className="font-bold">Purchased Fertilizer</p>
                <p className="text-xs text-muted-foreground">Yesterday</p>
              </div>
            </div>
            <p className="font-bold text-foreground">-1,200 ETB</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
