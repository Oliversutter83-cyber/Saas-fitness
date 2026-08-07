import Link from "next/link";
import type { Metadata } from "next";
import { deconnecter } from "@/app/(auth)/actions";
import { MemberNavDesktop, MemberNavMobile, type NavItem } from "@/components/MemberNav";
import { Logo } from "@/components/ui";
import { hasAccess, isOwner, requireUser } from "@/lib/auth";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/** Les rubriques du quotidien : elles restent dans la barre du bas sur téléphone. */
const PRIMARY: NavItem[] = [
  { href: "/app", label: "Accueil", icon: "🏠" },
  { href: "/app/programmes", label: "Programmes", icon: "📋" },
  { href: "/exercices", label: "Exercices", icon: "💪" },
  { href: "/app/bilan", label: "Mon bilan", icon: "🎯" },
];

/** Les rubriques occasionnelles : accessibles via « Plus » sur téléphone. */
const SECONDARY: NavItem[] = [
  { href: "/app/progression", label: "Progression", icon: "📈" },
  { href: "/app/abonnement", label: "Abonnement", icon: "💳" },
];

const OWNER_ITEMS: NavItem[] = [
  { href: "/app/pilotage", label: "Pilotage", icon: "📊" },
  { href: "/app/kit-pub", label: "Kit publicité", icon: "🎬" },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const active = hasAccess(user);
  const secondary = isOwner(user.email) ? [...SECONDARY, ...OWNER_ITEMS] : SECONDARY;

  return (
    // La marge basse laisse la place à la barre de navigation du téléphone,
    // encoche comprise, pour que le dernier bloc ne passe jamais dessous.
    <div
      className="min-h-dvh bg-ink-950 md:pb-0"
      style={{ paddingBottom: "calc(5.5rem + env(safe-area-inset-bottom))" }}
    >
      <header className="sticky top-0 z-40 border-b border-white/10 bg-ink-950/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-3 px-5">
          <Link href="/app" className="shrink-0">
            <Logo />
          </Link>

          <MemberNavDesktop items={[...PRIMARY, ...secondary]} />

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/app/abonnement"
              className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                active ? "bg-brand-400/15 text-brand-200" : "bg-ember-500 text-white"
              }`}
            >
              {active ? "Abonné" : "Activer"}
            </Link>
            <form action={deconnecter} className="hidden md:block">
              <button
                type="submit"
                className="rounded-full px-3 py-1.5 text-xs font-semibold text-white/55 transition hover:bg-white/5"
              >
                Quitter
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-5 py-8">{children}</main>

      <MemberNavMobile
        primary={PRIMARY}
        secondary={secondary}
        logout={
          <form action={deconnecter}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold text-white/60 transition hover:bg-white/5"
            >
              <span className="text-lg" aria-hidden>
                ↩
              </span>
              Se déconnecter
            </button>
          </form>
        }
      />
    </div>
  );
}
