import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CarouselStudio } from "@/components/CarouselStudio";
import { SITE } from "@/config";
import { EXERCISES } from "@/content/exercises";
import { isOwner, requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Kit publicité" };

/**
 * Outil interne : il sert à VOUS, pas aux abonnés. L'accès passe par isOwner,
 * qui refuse en production tant qu'OWNER_EMAIL n'est pas renseigné — un outil
 * interne inaccessible vaut mieux qu'un outil interne ouvert aux abonnés.
 */
export default async function KitPubPage() {
  const user = await requireUser();
  if (!isOwner(user.email)) notFound();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Kit publicité — carrousels
        </h1>
        <p className="mt-2 max-w-2xl leading-relaxed text-white/55">
          Fabriquez vos publications carrousel pour Instagram et TikTok à partir des exercices du
          site. Réglez le format, l&apos;accroche et les exercices, puis téléchargez les slides en
          PNG. Rien à filmer, rien à monter.
        </p>
      </header>

      <CarouselStudio exercises={EXERCISES} siteName={SITE.name} handle={SITE.handle} />

      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
        <h2 className="font-extrabold text-white">Comment s&apos;en servir</h2>
        <ol className="mt-3 space-y-2 text-sm leading-relaxed text-white/70">
          <li>
            <strong>1.</strong> Choisissez le format : carré ou portrait pour un carrousel
            Instagram, vertical pour TikTok et les stories.
          </li>
          <li>
            <strong>2.</strong> Écrivez une accroche qui promet un résultat précis (« 5 exercices
            pour le dos sans matériel ») plutôt qu&apos;une phrase vague.
          </li>
          <li>
            <strong>3.</strong> Téléchargez les slides, publiez-les dans l&apos;ordre, collez la
            légende générée.
          </li>
          <li>
            <strong>4.</strong> Mettez le lien vers <code>/seance-decouverte</code> en bio : le
            visiteur essaie une vraie séance avant qu&apos;on lui demande de créer un compte.
          </li>
        </ol>
      </div>
    </div>
  );
}
