import { Link, useRouterState } from "@tanstack/react-router";
import { Home, GraduationCap, Sparkles, Store, CloudSun, Bell, Globe } from "lucide-react";
import type { ReactNode } from "react";
import { useI18n, LANGUAGES } from "@/lib/i18n";
import { VoiceNav } from "@/components/VoiceNav";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const nav: { to: string; key: string; icon: typeof Home; center?: boolean }[] = [
  { to: "/", key: "home", icon: Home },
  { to: "/learn", key: "learn", icon: GraduationCap },
  { to: "/assistant", key: "assistant", icon: Sparkles, center: true },
  { to: "/market", key: "market", icon: Store },
  { to: "/weather", key: "weather", icon: CloudSun },
];

export function AppShell({ children, title }: { children: ReactNode; title?: string }) {
  const { t, lang, setLang } = useI18n();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-background">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border/60 bg-background/85 px-4 py-3 backdrop-blur">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary text-lg shadow-soft">🌿</span>
          <span className="font-display text-lg font-bold leading-none">
            Agri<span className="text-primary">Bridge</span>
          </span>
        </Link>
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 rounded-full border border-border px-2.5 py-1.5 text-xs font-semibold">
              <Globe className="h-3.5 w-3.5" />
              {lang.toUpperCase()}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {LANGUAGES.map((l) => (
                <DropdownMenuItem key={l.code} onClick={() => setLang(l.code)}>
                  {l.native} <span className="ml-auto text-xs text-muted-foreground">{l.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Link to="/notifications" className="relative grid h-9 w-9 place-items-center rounded-full hover:bg-muted">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent" />
          </Link>
        </div>
      </header>

      {title && (
        <div className="px-4 pt-4">
          <h1 className="font-display text-2xl font-bold">{title}</h1>
        </div>
      )}

      <main className="flex-1 px-4 pb-28 pt-4">{children}</main>

      <VoiceNav />

      <nav className="fixed bottom-0 left-1/2 z-30 w-full max-w-md -translate-x-1/2 border-t border-border/60 bg-background/95 px-2 pb-[env(safe-area-inset-bottom)] pt-1.5 backdrop-blur">
        <ul className="flex items-end justify-around">
          {nav.map(({ to, key, icon: Icon, center }) => {
            const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
            if (center) {
              return (
                <li key={key} className="-mt-6">
                  <Link to={to as string} className="flex flex-col items-center gap-1">
                    <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-soft">
                      <Icon className="h-6 w-6" />
                    </span>
                    <span className="text-[10px] font-semibold text-primary">{t(key)}</span>
                  </Link>
                </li>
              );
            }
            return (
              <li key={key}>
                <Link
                  to={to as string}
                  className={`flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 ${active ? "text-primary" : "text-muted-foreground"}`}
                >
                  <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                  <span className="text-[10px] font-semibold">{t(key)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}