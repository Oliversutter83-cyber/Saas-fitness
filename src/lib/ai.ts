import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type { Plan, Profile } from "@/lib/coach";

/**
 * Commentaire personnalisé du bilan.
 *
 * Le plan lui-même (programme, planning, objectifs) est décidé par le moteur de
 * règles. L'IA n'intervient que par-dessus, pour commenter et encourager. Ce
 * découpage est volontaire : le contenu qui engage l'abonné reste déterministe
 * et vérifiable, et une panne d'API ne prive personne de son bilan.
 *
 * Ce que la photo sert : repérer si le plan doit être adapté (mouvements au sol
 * praticables, place disponible) et donner un point de départ visuel à comparer
 * plus tard. Le modèle a l'interdiction explicite d'estimer un taux de masse
 * grasse, de commenter le physique ou de faire la moindre prédiction de perte
 * de poids : ce sont des allégations de santé que ni ce produit ni un modèle ne
 * sont en droit de faire.
 */

export const aiEnabled = Boolean(process.env.ANTHROPIC_API_KEY);

const AnalysisSchema = z.object({
  notes: z
    .array(z.string())
    .describe(
      "2 à 4 remarques utiles et concrètes sur la façon d'aborder ce programme, adressées à la personne au vouvoiement.",
    ),
  encouragement: z
    .string()
    .describe(
      "Une phrase d'encouragement sobre et crédible, sans promesse de résultat.",
    ),
});

const SYSTEM = `Vous rédigez le commentaire d'accompagnement d'un bilan de remise en forme, pour un site d'entraînement à la maison. Vous écrivez en français, au vouvoiement, sur un ton sobre et direct — jamais publicitaire.

Le programme, le planning et les objectifs sont DÉJÀ décidés et vous sont fournis. Vous ne les modifiez pas et vous ne proposez pas d'autre programme. Votre travail est d'ajouter des remarques pratiques qui aident cette personne précise à bien démarrer.

Interdictions absolues, sans exception :
- Ne jamais estimer un taux de masse grasse, un poids idéal, un âge métabolique ou toute mesure corporelle à partir d'une photo. C'est impossible de façon fiable et ce serait trompeur.
- Ne jamais commenter l'apparence physique, la silhouette ou la corpulence de la personne, ni en bien ni en mal.
- Ne jamais prédire une perte de poids, un gain de muscle ou un délai de résultat, même prudemment.
- Ne jamais poser de diagnostic ni donner de conseil médical, nutritionnel ou thérapeutique. Renvoyez vers un professionnel de santé si le sujet se présente.

Ce que vous pouvez tirer d'une photo, et rien de plus : l'environnement (place disponible, sol praticable, présence d'une chaise ou d'un mur utilisable) et la faisabilité pratique des mouvements. Si la photo ne montre rien d'exploitable, ignorez-la simplement sans le signaler.

Vos remarques doivent être concrètes et actionnables : quoi faire, quand, comment adapter. Pas de généralités motivationnelles.`;

let client: Anthropic | null = null;

function getClient(): Anthropic {
  client ??= new Anthropic();
  return client;
}

export type PhotoInput = { mediaType: "image/jpeg" | "image/png" | "image/webp"; base64: string };

/**
 * Renvoie les commentaires, ou `null` si l'IA n'est pas configurée, refuse la
 * demande, ou échoue. L'appelant garde son plan dans tous les cas.
 */
export async function analyseProfile(
  profile: Profile,
  plan: Plan,
  photo?: PhotoInput,
): Promise<{ notes: string[]; encouragement: string } | null> {
  if (!aiEnabled) return null;

  const brief = [
    `Âge : ${profile.age} ans`,
    `Taille : ${profile.heightCm} cm`,
    `Poids déclaré : ${profile.weightKg} kg`,
    `Objectif : ${profile.goal}`,
    `Niveau déclaré : ${profile.level}`,
    `Disponibilité : ${profile.daysPerWeek} jours par semaine, ${profile.minutesAvailable} minutes par séance`,
    `Dernière pratique régulière : ${profile.lastActive}`,
    `Sauts possibles à domicile : ${profile.canJump ? "oui" : "non"}`,
    `Ce qui a fait arrêter la dernière fois : ${profile.blocker}`,
    profile.constraints?.trim()
      ? `Contraintes signalées : ${profile.constraints.trim()}`
      : "Aucune contrainte signalée",
    "",
    `Programme retenu : ${plan.programName} (${plan.sessionsPerWeek} séances par semaine, ${plan.minutesPerSession} minutes)`,
    `Raison : ${plan.why}`,
    `Objectif du mois : ${plan.monthGoal.targets.join(" ; ")}`,
  ].join("\n");

  const content: Anthropic.ContentBlockParam[] = [];
  if (photo) {
    content.push({
      type: "image",
      source: { type: "base64", media_type: photo.mediaType, data: photo.base64 },
    });
  }
  content.push({
    type: "text",
    text: photo
      ? `Voici la photo de départ de la personne, puis son profil.\n\n${brief}`
      : `Profil de la personne (pas de photo fournie).\n\n${brief}`,
  });

  try {
    const response = await getClient().messages.parse({
      model: "claude-opus-5",
      max_tokens: 4000,
      system: SYSTEM,
      output_config: {
        effort: "low",
        format: zodOutputFormat(AnalysisSchema),
      },
      messages: [{ role: "user", content }],
    });

    // Les classificateurs peuvent décliner une demande : la réponse arrive en
    // HTTP 200 avec ce motif d'arrêt et un contenu vide ou partiel.
    if (response.stop_reason === "refusal") {
      console.warn("[ia] demande déclinée par les classificateurs");
      return null;
    }

    return response.parsed_output ?? null;
  } catch (error) {
    // Le bilan n'a pas besoin de l'IA pour être complet : on n'échoue jamais
    // la génération à cause d'elle.
    console.error("[ia] analyse indisponible", error);
    return null;
  }
}
