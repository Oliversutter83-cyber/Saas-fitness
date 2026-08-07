import Link from "next/link";
import type { Metadata } from "next";
import { deconnecter } from "@/app/(auth)/actions";
import { Logo } from "@/components/ui";
import { hasAccess, requireUser } from "@/lib/auth";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const NAV = [
  { href: "/app", label: "Accueil", icon: "🏠" },
  { href: "/app/bilan", label: "Mon bilan", icon: "🎯" },
  { href: "/app/programmes", label: "Programmes", icon: "📋" },
  { href: "/app/progression", label: "Progression", icon: "📈" },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const active = hasAccess(user);

  return (
    <div className="min-h-dvh bg-ink-950 pb-24 md:pb-0">
      <header className="sticky top-0 z-40 border-b border-ink-900/5 bg-ink-950/85 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-5">
          <Link href="/app">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-3.5 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/5"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/app/abonnement"
              className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                active ? "bg-brand-400/15 text-brand-200" : "bg-ink-900 text-brand-300"
              }`}
            >
              {active ? "Abonné" : "Activer"}
            </Link>
            <form action={deconnecter}>
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

      {/* Barre de navigation mobile, façon application */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink-950/90 backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 py-2.5 text-[0.65rem] font-semibold text-white/55"
            >
              <span className="text-lg" aria-hidden>
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
