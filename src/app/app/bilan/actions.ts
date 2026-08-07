"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { analyseProfile, type PhotoInput } from "@/lib/ai";
import { buildPlan, type Profile } from "@/lib/coach";

const schema = z.object({
  age: z.coerce.number().int().min(14).max(100),
  heightCm: z.coerce.number().int().min(120).max(230),
  weightKg: z.coerce.number().min(30).max(300),
  goal: z.enum(["perte-de-poids", "forme", "muscle", "fessiers"]),
  level: z.enum(["debutant", "intermediaire", "avance"]),
  daysPerWeek: z.coerce.number().int().min(1).max(7),
  constraints: z.string().trim().max(400).optional(),
  /** Data URL produite par le navigateur, déjà réduite */
  photo: z.string().optional(),
  /** L'abonné a coché « garder ma photo de départ » */
  keepPhoto: z.coerce.boolean().default(false),
});

export type BilanState = { error?: string; ok?: boolean } | undefined;

/** Découpe une data URL en type MIME + base64, en refusant tout format inattendu. */
function parsePhoto(dataUrl: string | undefined): PhotoInput | null {
  if (!dataUrl) return null;
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!match) return null;

  // Garde-fou : au-delà de ~4 Mo la réduction côté navigateur a échoué.
  if (match[2].length > 4_000_000) return null;

  return { mediaType: match[1] as PhotoInput["mediaType"], base64: match[2] };
}

export async function genererBilan(
  _prev: BilanState,
  formData: FormData,
): Promise<BilanState> {
  const user = await requireUser();

  const parsed = schema.safeParse({
    age: formData.get("age"),
    heightCm: formData.get("heightCm"),
    weightKg: formData.get("weightKg"),
    goal: formData.get("goal"),
    level: formData.get("level"),
    daysPerWeek: formData.get("daysPerWeek"),
    constraints: formData.get("constraints") || undefined,
    photo: formData.get("photo") || undefined,
    keepPhoto: formData.get("keepPhoto") === "on",
  });

  if (!parsed.success) {
    return { error: "Vérifiez votre saisie : certaines valeurs sont hors limites." };
  }

  const { photo, keepPhoto, ...rest } = parsed.data;
  const profile: Profile = rest;

  // Le plan est produit avant tout appel externe : c'est lui le livrable.
  const plan = buildPlan(profile);

  const photoInput = parsePhoto(photo);
  const analysis = await analyseProfile(profile, plan, photoInput ?? undefined);

  if (analysis) {
    plan.aiNotes = analysis.notes;
    plan.aiEncouragement = analysis.encouragement;
  }

  await db.assessment.create({
    data: {
      userId: user.id,
      age: profile.age,
      heightCm: profile.heightCm,
      weightKg: profile.weightKg,
      goal: profile.goal,
      level: profile.level,
      daysPerWeek: profile.daysPerWeek,
      constraints: profile.constraints ?? null,
      programSlug: plan.programSlug,
      planJson: JSON.stringify(plan),
      source: analysis ? "ia" : "regles",
      // La photo n'est conservée que si l'abonné l'a explicitement demandé.
      photoDataUrl: keepPhoto && photo ? photo : null,
    },
  });

  // L'objectif déclaré pilote le programme conseillé sur le tableau de bord.
  if (user.goal !== profile.goal || user.level !== profile.level) {
    await db.user.update({
      where: { id: user.id },
      data: { goal: profile.goal, level: profile.level },
    });
  }

  // Le poids saisi alimente la courbe de progression, sans double saisie.
  await db.bodyMetric.create({
    data: { userId: user.id, weightKg: profile.weightKg, note: "Bilan de départ" },
  });

  revalidatePath("/app", "layout");
  return { ok: true };
}

export async function supprimerBilan(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");

  // `deleteMany` filtré sur userId : un identifiant appartenant à quelqu'un
  // d'autre ne supprime rien, au lieu de lever une erreur exploitable.
  await db.assessment.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/app/bilan");
}
