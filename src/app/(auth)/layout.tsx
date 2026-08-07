import Link from "next/link";
import { Logo } from "@/components/ui";
import { SITE } from "@/config";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col px-5 py-8 sm:px-10">
        <Link href="/" className="inline-flex">
          <Logo />
        </Link>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>

      <aside className="relative hidden overflow-hidden bg-ink-950 lg:block">
        <div
          className="pointer-events-none absolute left-1/2 top-1/4 h-96 w-96 -translate-x-1/2 rounded-full bg-white/50/20 blur-[100px]"
          aria-hidden
        />
        <div className="relative flex h-full flex-col justify-center px-14">
          <p className="text-4xl font-extrabold leading-tight tracking-tight text-white">
            25 minutes.
            <br />
            <span className="text-brand-300">Chez vous.</span>
            <br />
            Sans matériel.
          </p>
          <p className="mt-6 max-w-sm leading-relaxed text-white/50">{SITE.description}</p>
          <ul className="mt-10 space-y-3 text-sm text-white/70">
            {[
              "4 programmes de 4 semaines",
              "30 exercices expliqués en carrousel",
              "Minuteur et suivi de progression",
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <span className="text-brand-400">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
