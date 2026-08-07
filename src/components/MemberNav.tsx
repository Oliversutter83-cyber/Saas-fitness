"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Navigation de l'espace membre.
 *
 * Contrainte de départ : sur téléphone, une barre du bas ne tient pas plus de
 * cinq entrées lisibles au pouce, alors que l'espace en compte davantage.
 * Les rubriques quotidiennes restent donc dans la barre, et les autres
 * (progression, abonnement, outils) vivent dans un panneau « Plus » — au lieu
 * d'être simplement absentes du téléphone, comme c'était le cas avant.
 *
 * Deux composants séparés, et ce n'est pas cosmétique : la barre du bas et son
 * panneau sont en `position: fixed`, or un ancêtre en `backdrop-filter` — comme
 * l'en-tête translucide — devient le bloc conteneur de ses descendants fixes.
 * Placés dans l'en-tête, ils se collaient sous celui-ci au lieu du bas de
 * l'écran. Ils doivent donc rester en dehors.
 */

export type NavItem = { href: string; label: string; icon: string };

function useIsActive() {
  const pathname = usePathname();
  return (href: string) =>
    href === "/app" ? pathname === "/app" : pathname.startsWith(href);
}

/** Barre de l'en-tête, sur ordinateur uniquement. */
export function MemberNavDesktop({ items }: { items: NavItem[] }) {
  const isActive = useIsActive();

  return (
    <nav className="hidden items-center gap-1 md:flex">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={isActive(item.href) ? "page" : undefined}
          className={`rounded-full px-3 py-2 text-sm font-semibold transition ${
            isActive(item.href)
              ? "bg-white/10 text-white"
              : "text-white/60 hover:bg-white/5 hover:text-white"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

/** Barre du bas + panneau « Plus », sur téléphone uniquement. */
export function MemberNavMobile({
  primary,
  secondary,
  logout,
}: {
  /** 4 rubriques au maximum : la cinquième colonne est le bouton « Plus » */
  primary: NavItem[];
  secondary: NavItem[];
  logout: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = useIsActive();

  // Le panneau retient la page depuis laquelle il a été ouvert. Dès que l'on
  // navigue, la page courante ne correspond plus et il se referme de lui-même —
  // sans effet de bord, et y compris sur un retour arrière du navigateur.
  const [openedFrom, setOpenedFrom] = useState<string | null>(null);
  const menuOpen = openedFrom !== null && openedFrom === pathname;
  const closeMenu = () => setOpenedFrom(null);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink-950/95 backdrop-blur md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label="Navigation principale"
      >
        <div className="mx-auto grid max-w-md grid-cols-5">
          {primary.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`flex flex-col items-center gap-0.5 py-2.5 text-[0.65rem] font-semibold transition ${
                isActive(item.href) ? "text-brand-300" : "text-white/55"
              }`}
            >
              <span className="text-lg leading-none" aria-hidden>
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}

          <button
            type="button"
            onClick={() => setOpenedFrom(pathname)}
            aria-expanded={menuOpen}
            className="flex flex-col items-center gap-0.5 py-2.5 text-[0.65rem] font-semibold text-white/55"
          >
            <span className="text-lg leading-none" aria-hidden>
              ☰
            </span>
            Plus
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Fermer le menu"
            onClick={closeMenu}
            className="absolute inset-0 bg-ink-950/80"
          />
          <div
            className="absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-white/10 bg-ink-900 p-5"
            style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/20" aria-hidden />
            <ul className="space-y-1">
              {secondary.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-white/5"
                  >
                    <span className="text-lg" aria-hidden>
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="border-t border-white/10 pt-2">{logout}</li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
