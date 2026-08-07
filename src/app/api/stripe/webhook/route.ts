import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { db } from "@/lib/db";
import { getStripe, normalizeStatus } from "@/lib/stripe";

/**
 * Webhook Stripe : c'est LUI qui fait autorité sur l'état de l'abonnement.
 * La page de retour après paiement n'est qu'un affichage — un utilisateur peut
 * fermer l'onglet avant d'y revenir, l'abonnement doit quand même être activé.
 *
 * Configuration : Stripe → Développeurs → Webhooks → ajouter
 * {votre-domaine}/api/stripe/webhook, puis copier le secret dans
 * STRIPE_WEBHOOK_SECRET.
 */

const HANDLED: Stripe.Event.Type[] = [
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.payment_failed",
];

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");

  if (!secret || !signature) {
    return NextResponse.json({ error: "Webhook non configuré." }, { status: 400 });
  }

  // La signature se vérifie sur le corps brut : ne pas parser en JSON avant.
  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(payload, signature, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "signature invalide";
    return NextResponse.json({ error: `Signature refusée : ${message}` }, { status: 400 });
  }

  if (!HANDLED.includes(event.type)) {
    return NextResponse.json({ received: true, ignored: event.type });
  }

  try {
    await handle(event);
  } catch (err) {
    console.error(`[stripe] échec du traitement de ${event.type}`, err);
    // Un 500 demande à Stripe de réessayer : c'est ce qu'on veut si la base
    // était momentanément indisponible.
    return NextResponse.json({ error: "Traitement impossible." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handle(event: Stripe.Event) {
  const stripe = getStripe();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const customerId =
        typeof session.customer === "string" ? session.customer : session.customer?.id;

      // On relie définitivement le client Stripe au compte, puis l'abonnement
      // lui-même sera synchronisé par l'événement customer.subscription.*.
      if (userId && customerId) {
        await db.user.update({
          where: { id: userId },
          data: { stripeCustomerId: customerId },
        });
      }

      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id;
      if (subscriptionId) {
        await syncSubscription(await stripe.subscriptions.retrieve(subscriptionId));
      }
      return;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await syncSubscription(event.data.object);
      return;

    case "invoice.payment_failed": {
      const invoice = event.data.object;
      const customerId =
        typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
      if (customerId) {
        await db.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: { subscriptionStatus: "past_due" },
        });
      }
      return;
    }
  }
}

async function syncSubscription(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  // La fin de période vit sur la ligne d'abonnement depuis l'API 2025+ ;
  // on prend la plus lointaine, qui correspond à l'accès réellement payé.
  const periodEnd = subscription.items.data.reduce<number | null>((latest, item) => {
    const end = item.current_period_end;
    return end && (!latest || end > latest) ? end : latest;
  }, null);

  const data = {
    stripeSubscriptionId: subscription.id,
    stripePriceId: subscription.items.data[0]?.price.id ?? null,
    subscriptionStatus:
      subscription.status === "canceled" ? "canceled" : normalizeStatus(subscription.status),
    currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  };

  const updated = await db.user.updateMany({
    where: { stripeCustomerId: customerId },
    data,
  });

  // Course possible : l'abonnement peut arriver avant que le compte porte
  // l'identifiant client. Les métadonnées permettent de retomber sur ses pieds.
  if (updated.count === 0) {
    const userId = subscription.metadata?.userId;
    if (userId) {
      await db.user.update({
        where: { id: userId },
        data: { ...data, stripeCustomerId: customerId },
      });
    } else {
      console.warn(`[stripe] aucun compte pour le client ${customerId}`);
    }
  }
}
