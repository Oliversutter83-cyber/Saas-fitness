import "server-only";
import bcrypt from "bcryptjs";
import { cache } from "react";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { readSession } from "@/lib/session";
import type { User } from "@/generated/prisma/client";

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 11);
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

// `cache` déduplique l'appel sur une même requête : la mise en page, la page
// et les composants peuvent tous demander l'utilisateur sans multiplier les requêtes SQL.
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const session = await readSession();
  if (!session) return null;
  const user = await db.user.findUnique({ where: { id: session.userId } });
  return user;
});

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");
  return user;
}

/**
 * Correspondance stricte avec OWNER_EMAIL, sans passe-droit de développement.
 * C'est cette version qui décide de l'accès au produit : sinon, en local,
 * chaque compte deviendrait abonné et le mur de paiement serait intestable.
 */
export function isOwnerAccount(email: string): boolean {
  const owner = process.env.OWNER_EMAIL?.trim().toLowerCase();
  return Boolean(owner) && email.trim().toLowerCase() === owner;
}

/**
 * Est-ce VOTRE compte ? Sert à réserver les outils et les messages internes
 * (pilotage, kit publicité) à l'exploitant du site.
 *
 * En production, la réponse est non tant qu'OWNER_EMAIL n'est pas renseigné :
 * mieux vaut un outil interne inaccessible qu'un outil interne ouvert à tous
 * les abonnés. En développement, tout est ouvert pour pouvoir travailler.
 */
export function isOwner(email: string): boolean {
  if (process.env.NODE_ENV === "development") return true;
  return isOwnerAccount(email);
}

export const ACTIVE_STATUSES = ["active", "trialing"] as const;

/** L'utilisateur a-t-il un accès valide au produit ? */
export function hasAccess(
  user: Pick<User, "email" | "subscriptionStatus" | "currentPeriodEnd">,
) {
  // Le compte de l'exploitant accède toujours au produit. Sans cela, il devrait
  // s'abonner et se payer lui-même — frais Stripe compris — pour vérifier les
  // séances qu'il vend.
  if (isOwnerAccount(user.email)) return true;

  if (!ACTIVE_STATUSES.includes(user.subscriptionStatus as "active" | "trialing")) {
    return false;
  }
  // Filet de sécurité si un webhook a été manqué : on refuse l'accès une fois
  // la période payée terminée depuis plus d'un jour.
  if (user.currentPeriodEnd && user.currentPeriodEnd.getTime() < Date.now() - 86_400_000) {
    return false;
  }
  return true;
}

export async function requireSubscriber(): Promise<User> {
  const user = await requireUser();
  if (!hasAccess(user)) redirect("/app/abonnement?requis=1");
  return user;
}
