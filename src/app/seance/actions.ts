"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSession } from "@/content/programs";
import { requireSubscriber } from "@/lib/auth";
import { db } from "@/lib/db";

export async function terminerSeance(
  programSlug: string,
  week: number,
  day: number,
  durationSec: number,
  feeling: number | null,
) {
  const user = await requireSubscriber();

  // On refuse d'enregistrer une séance qui n'existe pas : les paramètres
  // viennent de l'URL et peuvent être bricolés.
  if (!getSession(programSlug, week, day)) {
    throw new Error("Séance introuvable.");
  }

  const data = {
    durationSec: Math.max(0, Math.min(durationSec, 4 * 3600)),
    feeling: feeling && feeling >= 1 && feeling <= 5 ? feeling : null,
    completedAt: new Date(),
  };

  // Refaire une séance met à jour la précédente plutôt que d'en créer une
  // deuxième : la progression reste lisible.
  await db.completion.upsert({
    where: { userId_programSlug_week_day: { userId: user.id, programSlug, week, day } },
    update: data,
    create: { userId: user.id, programSlug, week, day, ...data },
  });

  revalidatePath("/app", "layout");
  redirect(`/app/programmes/${programSlug}?termine=${week}-${day}`);
}
