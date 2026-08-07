import Link from "next/link";
import { SITE } from "@/config";

/**
 * Briques d'interface communes. Le site est entièrement en thème sombre : il
 * n'y a donc plus de variante claire à gérer, une seule déclinaison par
 * composant suffit.
 */

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2 font-extrabold tracking-tight text-white ${className}`}>
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-400 text-ink-950" aria-hidden>
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.4}>
          <path d="M4 9v6M20 9v6M7 7v10M17 7v10M7 12h10" strokeLinecap="round" />
        </svg>
      </span>
      {SITE.name}
    </span>
  );
}

type ButtonProps = {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "dark";
  size?: "md" | "lg";
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const VARIANTS = {
  primary: "bg-ember-500 text-white hover:bg-ember-400 shadow-lg shadow-ember-900/40",
  secondary: "bg-white/10 text-white hover:bg-white/15",
  outline: "border border-white/20 text-white hover:bg-white/5",
  ghost: "text-white/70 hover:bg-white/5 hover:text-white",
  /* À poser sur une surface or, où le rouge et le blanc passeraient mal. */
  dark: "bg-ink-950 text-white hover:bg-ink-800",
};

export function Button({
  children,
  href,
  variant = "primary",
  size = "md",
  className = "",
  ...rest
}: ButtonProps) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-full font-bold transition disabled:opacity-60 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-300 ${
    size === "lg" ? "px-7 py-3.5 text-base" : "px-5 py-2.5 text-sm"
  } ${VARIANTS[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}

export function Badge({
  children,
  tone = "brand",
}: {
  children: React.ReactNode;
  tone?: "brand" | "neutral" | "dark";
}) {
  const tones = {
    brand: "bg-brand-400/15 text-brand-200 ring-1 ring-brand-400/25",
    neutral: "bg-white/8 text-white/70",
    dark: "bg-ink-950/70 text-brand-200 ring-1 ring-white/10",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function Container({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`mx-auto w-full max-w-6xl px-5 ${className}`}>{children}</div>;
}

export function SectionTitle({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      {eyebrow && (
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-300">{eyebrow}</p>
      )}
      <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-4 text-base leading-relaxed text-white/60">{subtitle}</p>}
    </div>
  );
}

/** Halo lumineux décoratif, posé derrière les sections importantes. */
export function Glow({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute rounded-full bg-brand-500/15 blur-[120px] ${className}`}
    />
  );
}
