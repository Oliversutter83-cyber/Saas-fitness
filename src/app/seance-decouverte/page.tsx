import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { SessionPlayer } from "@/components/SessionPlayer";
import { buildPlaylist } from "@/content/playlist";
import { FREE_SESSION, getProgram, getSession } from "@/content/programs";

export const metadata: Metadata = {
  title: "Séance découverte gratuite, sans inscription",
  description:
    "Testez une vraie séance complète : échauffement, circuit et étirements, avec le minuteur et les mouvements expliqués en carrousel. Aucun compte nécessaire.",
};

/**
 * La séance offerte, accessible sans compte : c'est la page d'atterrissage
 * idéale pour un lien Instagram ou TikTok. Le visiteur essaie le produit
 * avant qu'on lui demande quoi que ce soit.
 */
export default function SeanceDecouvertePage() {
  const program = getProgram(FREE_SESSION.programSlug);
  const session = getSession(FREE_SESSION.programSlug, FREE_SESSION.week, FREE_SESSION.day);
  if (!program || !session) notFound();

  async function versInscription() {
    "use server";
    redirect("/inscription?depuis=decouverte");
  }

  return (
    <SessionPlayer
      entries={buildPlaylist(session)}
      sessionTitle={`Séance découverte — ${session.title}`}
      backHref="/"
      onFinish={versInscription}
    />
  );
}
