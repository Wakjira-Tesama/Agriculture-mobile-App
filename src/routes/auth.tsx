import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mail, Lock, User, Phone, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth, type Role } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "AgriBridge — Sign In" }] }),
  component: Auth,
});

const roleOptions: { id: Role; label: string; emoji: string }[] = [
  { id: "farmer", label: "Farmer", emoji: "🌾" },
  { id: "buyer", label: "Buyer", emoji: "🛒" },
  { id: "expert", label: "Expert", emoji: "🩺" },
];

function Auth() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<Role>("farmer");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/" });
  }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName, role, phone },
          },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/" });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    setErr("");
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) setErr("Google sign-in failed");
    else if (!result.redirected) navigate({ to: "/" });
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center bg-background px-6 py-10">
      <Link to="/" className="mb-8 flex items-center justify-center gap-2">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-primary text-xl shadow-soft">🌿</span>
        <span className="font-display text-2xl font-bold">Agri<span className="text-primary">Bridge</span></span>
      </Link>

      <h1 className="font-display text-2xl font-bold">{mode === "signin" ? "Welcome back" : "Create your account"}</h1>
      <p className="mb-6 text-sm text-muted-foreground">{mode === "signin" ? "Sign in to your AgriBridge account." : "Join thousands of Ethiopian farmers."}</p>

      <button onClick={google} className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 font-semibold shadow-card">
        <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
        Continue with Google
      </button>

      <div className="mb-4 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> or {mode} with email <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={submit} className="space-y-3">
        {mode === "signup" && (
          <>
            <Input icon={User} placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            <Input icon={Phone} placeholder="Phone (+251…)" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <div className="grid grid-cols-3 gap-2">
              {roleOptions.map((r) => (
                <button type="button" key={r.id} onClick={() => setRole(r.id)} className={`rounded-xl border py-2.5 text-sm font-semibold ${role === r.id ? "border-primary bg-primary/10 text-primary" : "border-border bg-card"}`}>
                  {r.emoji} {r.label}
                </button>
              ))}
            </div>
          </>
        )}
        <Input icon={Mail} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input icon={Lock} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {err && <p className="text-sm text-destructive">{err}</p>}
        <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary py-3.5 font-semibold text-primary-foreground shadow-soft disabled:opacity-60">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "signin" ? "Sign In" : "Create Account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {mode === "signin" ? "New to AgriBridge? " : "Already have an account? "}
        <button onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setErr(""); }} className="font-semibold text-primary">
          {mode === "signin" ? "Create account" : "Sign in"}
        </button>
      </p>
    </div>
  );
}

function Input({ icon: Icon, ...props }: { icon: typeof Mail } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 focus-within:border-primary">
      <Icon className="h-5 w-5 text-muted-foreground" />
      <input {...props} className="w-full bg-transparent text-sm outline-none" />
    </div>
  );
}