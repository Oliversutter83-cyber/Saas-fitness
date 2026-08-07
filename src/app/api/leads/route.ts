import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const schema = z.object({
  email: z.string().trim().toLowerCase().email(),
  source: z.string().max(60).default("landing"),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
  }

  const { email, source } = parsed.data;

  // Une deuxième inscription avec le même email n'est pas une erreur côté
  // visiteur : on renvoie le même succès.
  await db.lead.upsert({
    where: { email },
    update: {},
    create: { email, source },
  });

  return NextResponse.json({ ok: true });
}
