import { createFileRoute } from "@tanstack/react-router";
import { Star, Mic, Camera, Plus, Circle, Loader2 } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { useI18n } from "@/lib/i18n";
import { experts } from "@/lib/data";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/expert")({
  head: () => ({ meta: [{ title: "AgriBridge — Expert Advisory" }] }),
  component: Expert,
});

const statusColor: Record<string, string> = {
  open: "text-accent bg-accent/15",
  answered: "text-primary bg-primary/10",
  closed: "text-muted-foreground bg-muted",
};

function Expert() {
  const { t } = useI18n();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [body, setBody] = useState("");
  const [err, setErr] = useState("");

  const { data: tickets, isLoading } = useQuery({
    queryKey: ["advisory_requests", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("advisory_requests")
        .select("*")
        .eq("farmer_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const submitReq = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Please login to ask an expert.");
      const { error } = await supabase.from("advisory_requests").insert({
        farmer_id: user.id,
        title: body.slice(0, 30) + (body.length > 30 ? "..." : ""),
        body,
        status: "open",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setBody("");
      queryClient.invalidateQueries({ queryKey: ["advisory_requests"] });
    },
    onError: (e) => setErr(e.message),
  });

  return (
    <AppShell title={t("expertAdvisory")}>
      <div className="mb-5 rounded-3xl border border-border bg-card p-4 shadow-card">
        <p className="font-display font-bold">{t("askExpert")}</p>
        <p className="text-xs text-muted-foreground">{t("askExpertDesc")}</p>
        <textarea 
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={t("describeProblem")} 
          rows={3} 
          className="mt-3 w-full rounded-xl border border-border bg-secondary/40 p-3 text-sm outline-none focus:border-primary" 
        />
        {err && <p className="mt-1 text-xs text-destructive">{err}</p>}
        <div className="mt-3 flex items-center gap-2">
          <button className="flex items-center gap-1.5 rounded-xl bg-secondary px-3 py-2 text-sm font-semibold"><Mic className="h-4 w-4" /> {t("voice")}</button>
          <button className="flex items-center gap-1.5 rounded-xl bg-secondary px-3 py-2 text-sm font-semibold"><Camera className="h-4 w-4" /> {t("photo")}</button>
          <button onClick={() => submitReq.mutate()} disabled={submitReq.isPending || !body.trim()} className="ml-auto flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">
            {submitReq.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} {t("submit")}
          </button>
        </div>
      </div>

      <h2 className="mb-3 font-display text-lg font-bold">{t("availableExperts")}</h2>
      <div className="mb-6 flex gap-3 overflow-x-auto no-scrollbar">
        {experts.map((e) => (
          <div key={e.name} className="min-w-[150px] rounded-2xl bg-card p-4 text-center shadow-card">
            <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-full bg-gradient-primary font-display font-bold text-primary-foreground">{e.name.split(" ").map((n) => n[0]).join("")}</div>
            <p className="truncate text-sm font-semibold">{e.name}</p>
            <p className="truncate text-xs text-muted-foreground">{e.field}</p>
            <p className="mt-1 flex items-center justify-center gap-1 text-xs"><Star className="h-3 w-3 fill-accent text-accent" /> {e.rating}</p>
            <p className={`mt-1 flex items-center justify-center gap-1 text-[11px] ${e.status === "Online" ? "text-primary" : "text-muted-foreground"}`}><Circle className="h-2 w-2 fill-current" /> {e.status}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-3 font-display text-lg font-bold">{t("myTickets")}</h2>
      <div className="space-y-3">
        {isLoading && <p className="text-sm text-muted-foreground">Loading tickets...</p>}
        {tickets?.length === 0 && <p className="text-sm text-muted-foreground">No advisory requests yet.</p>}
        {tickets?.map((tk) => (
          <div key={tk.id} className="rounded-2xl bg-card p-4 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">#{tk.id.slice(0, 8)}</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${statusColor[tk.status] || statusColor.open}`}>{tk.status}</span>
            </div>
            <p className="mt-1 font-semibold">{tk.title}</p>
            <p className="text-xs text-muted-foreground">{new Date(tk.created_at).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </AppShell>
  );
}