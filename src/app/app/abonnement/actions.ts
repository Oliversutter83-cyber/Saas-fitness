"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { PLANS, SITE, TRIAL_DAYS, type PlanId } from "@/config";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getStripe, priceIdFor, stripeEnabled } from "@/lib/stripe";

function planFromForm(formData: FormData): PlanId {
  const value = String(formData.get("plan") ?? "mensuel");
  return value in PLANS ? (value as PlanId) : "mensuel";
}

export async function demarrerAbonnement(formData: FormData) {
  const user = await requireUser();
  const plan = planFromForm(formData);

  // Mode démo : sans clés Stripe, on ouvre l'accès pour pouvoir tester le
  // produit de bout en bout. Aucun paiement n'est encaissé.
  if (!stripeEnabled) {
    await db.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: "trialing",
        stripePriceId: `demo_${plan}`,
        currentPeriodEnd: new Date(Date.now() + TRIAL_DAYS * 86_400_000),
      },
    });
    revalidatePath("/app", "layout");
    redirect("/app?demo=1");
  }

  const stripe = getStripe();

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.firstName,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await db.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceIdFor(plan), quantity: 1 }],
    subscription_data: {
      trial_period_days: TRIAL_DAYS,
      metadata: { userId: user.id },
    },
    // L'identifiant utilisateur voyage aussi ici : c'est le filet de sécurité
    // si le webhook arrive avant que le client Stripe soit relié au compte.
    metadata: { userId: user.id },
    locale: "fr",
    allow_promotion_codes: true,
    success_url: `${SITE.url}/app?paiement=ok`,
    cancel_url: `${SITE.url}/app/abonnement?paiement=annule`,
  });

  if (!session.url) throw new Error("Stripe n'a pas renvoyé d'URL de paiement.");
  redirect(session.url);
}

export async function ouvrirPortail() {
  const user = await requireUser();

  if (!stripeEnabled || !user.stripeCustomerId) {
    redirect("/app/abonnement?portail=indisponible");
  }

  const session = await getStripe().billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${SITE.url}/app/abonnement`,
    locale: "fr",
  });

  redirect(session.url);
}

/** Résiliation du faux abonnement, utilisable uniquement en mode démo. */
export async function annulerDemo() {
  const user = await requireUser();
  if (stripeEnabled) redirect("/app/abonnement");

  await db.user.update({
    where: { id: user.id },
    data: { subscriptionStatus: "canceled", currentPeriodEnd: null, stripePriceId: null },
  });
  revalidatePath("/app", "layout");
  redirect("/app/abonnement");
}
