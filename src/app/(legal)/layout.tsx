import Link from "next/link";
import { Container, Logo } from "@/components/ui";
import { LEGAL, SITE } from "@/config";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-ink-950">
      <header className="border-b border-white/10">
        <Container className="flex h-16 items-center justify-between">
          <Link href="/">
            <Logo />
          </Link>
          <nav className="flex gap-4 text-sm font-semibold text-white/55">
            <Link href="/mentions-legales" className="hover:text-white">
              Mentions légales
            </Link>
            <Link href="/cgv" className="hover:text-white">
              CGV
            </Link>
            <Link href="/confidentialite" className="hover:text-white">
              Confidentialité
            </Link>
          </nav>
        </Container>
      </header>

      <Container className="max-w-3xl py-14">
        <article
          className="
            [&_h1]:text-4xl [&_h1]:font-extrabold [&_h1]:tracking-tight [&_h1]:text-white
            [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-extrabold [&_h2]:text-white
            [&_p]:mt-3 [&_p]:leading-relaxed [&_p]:text-white/70
            [&_ul]:mt-3 [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_li]:list-disc [&_li]:text-white/70
            [&_a]:font-semibold [&_a]:text-brand-300 [&_a]:underline
          "
        >
          {children}
        </article>

        <p className="mt-14 border-t border-white/10 pt-6 text-xs text-white/55">
          {SITE.name} — dernière mise à jour : {LEGAL.updatedAt}.
        </p>
      </Container>
    </div>
  );
}
