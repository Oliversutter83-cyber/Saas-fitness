"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

const schema = z.object({
  weightKg: z.coerce.number().min(25).max(300).optional(),
  waistCm: z.coerce.number().min(40).max(200).optional(),
  note: z.string().trim().max(200).optional(),
});

export type MetricState = { error?: string; ok?: boolean } | undefined;

export async function enregistrerMesure(
  _prev: MetricState,
  formData: FormData,
): Promise<MetricState> {
  const user = await requireUser();

  const raw = {
    weightKg: formData.get("weightKg") || undefined,
    waistCm: formData.get("waistCm") || undefined,
    note: formData.get("note") || undefined,
  };

  if (!raw.weightKg && !raw.waistCm) {
    return { error: "Renseignez au moins un poids ou un tour de taille." };
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Ces valeurs ne semblent pas correctes. Vérifiez votre saisie." };
  }

  await db.bodyMetric.create({
    data: {
      userId: user.id,
      weightKg: parsed.data.weightKg ?? null,
      waistCm: parsed.data.waistCm ?? null,
      note: parsed.data.note ?? null,
    },
  });

  revalidatePath("/app/progression");
  return { ok: true };
}
