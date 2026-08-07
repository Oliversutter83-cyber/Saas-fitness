"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { createSession, destroySession } from "@/lib/session";

export type FormState = { error?: string } | undefined;

const signupSchema = z.object({
  firstName: z.string().trim().min(1, "Indiquez votre prénom.").max(60),
  email: z.string().trim().toLowerCase().email("Cette adresse email n'est pas valide."),
  password: z.string().min(8, "Le mot de passe doit faire au moins 8 caractères."),
  goal: z.enum(["forme", "perte-de-poids", "muscle", "fessiers"]).default("forme"),
  level: z.enum(["debutant", "intermediaire", "avance"]).default("debutant"),
});

export async function inscrire(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = signupSchema.safeParse({
    firstName: formData.get("firstName"),
    email: formData.get("email"),
    password: formData.get("password"),
    goal: formData.get("goal") ?? "forme",
    level: formData.get("level") ?? "debutant",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { firstName, email, password, goal, level } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Un compte existe déjà avec cette adresse. Connectez-vous." };
  }

  const user = await db.user.create({
    data: { firstName, email, passwordHash: await hashPassword(password), goal, level },
  });

  await createSession({ userId: user.id, email: user.email });

  // Nouveau compte : on l'envoie choisir son offre, c'est là que se fait la vente.
  redirect("/app/abonnement?bienvenue=1");
}

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Cette adresse email n'est pas valide."),
  password: z.string().min(1, "Saisissez votre mot de passe."),
});

export async function connecter(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });

  // Message identique que l'email existe ou non : inutile d'indiquer à un
  // inconnu quelles adresses sont inscrites.
  const invalid = { error: "Email ou mot de passe incorrect." };
  if (!user) return invalid;
  if (!(await verifyPassword(parsed.data.password, user.passwordHash))) return invalid;

  await createSession({ userId: user.id, email: user.email });
  redirect("/app");
}

export async function deconnecter() {
  await destroySession();
  redirect("/");
}
