import "server-only";
import Stripe from "stripe";
import { PLANS, type PlanId } from "@/config";

/**
 * Stripe est optionnel au démarrage : tant que les clés ne sont pas
 * renseignées, le site tourne en « mode démo » (l'abonnement est accordé sans
 * paiement) pour qu'on puisse développer et faire tester le produit. Dès que
 * STRIPE_SECRET_KEY est présent, le vrai paiement prend le relais.
 */

export const stripeEnabled = Boolean(process.env.STRIPE_SECRET_KEY);

let client: Stripe | null = null;

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY absent : Stripe n'est pas configuré.");
  }
  client ??= new Stripe(process.env.STRIPE_SECRET_KEY, {
    typescript: true,
  });
  return client;
}

export function priceIdFor(plan: PlanId): string {
  const value = process.env[PLANS[plan].envKey];
  if (!value) {
    throw new Error(
      `${PLANS[plan].envKey} absent : créez le tarif « ${PLANS[plan].name} » dans Stripe et copiez son identifiant (price_…) dans .env`,
    );
  }
  return value;
}

/** Les statuts Stripe qu'on recopie tels quels dans la base. */
export function normalizeStatus(status: Stripe.Subscription.Status): string {
  switch (status) {
    case "active":
    case "trialing":
    case "past_due":
      return status;
    case "canceled":
    case "unpaid":
    case "incomplete_expired":
      return "canceled";
    default:
      return "none";
  }
}
