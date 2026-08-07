import "server-only";
import { db } from "@/lib/db";
import { PLANS, type PlanId } from "@/config";
import { ACTIVE_STATUSES } from "@/lib/auth";

/**
 * Chiffres de pilotage du site.
 *
 * Tout est calculé depuis notre propre base. Le revenu affiché est donc une
 * ESTIMATION à partir des abonnements que nous connaissons : il ignore les
 * codes promo, les remboursements, les impayés en cours de recouvrement et la
 * TVA. La source de vérité pour la comptabilité reste le tableau de bord
 * Stripe — c'est écrit sur la page, pour qu'aucun chiffre ne soit pris pour
 * ce qu'il n'est pas.
 */

const DAY = 86_400_000;

/** Retrouve la formule d'un abonnement, y compris en mode démo. */
function planOf(priceId: string | null): PlanId | null {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_PRICE_ANNUEL || priceId === "demo_annuel") return "annuel";
  if (priceId === process.env.STRIPE_PRICE_MENSUEL || priceId === "demo_mensuel") return "mensuel";
  return null;
}

export type Metrics = Awaited<ReturnType<typeof getMetrics>>;

export async function getMetrics() {
  const now = Date.now();
  const since30 = new Date(now - 30 * DAY);
  const since7 = new Date(now - 7 * DAY);

  const [
    users,
    newUsers30,
    subscribers,
    leads,
    newLeads30,
    completionsTotal,
    completions30,
    assessments,
    signupDates,
    completionsByProgram,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { createdAt: { gte: since30 } } }),
    db.user.findMany({
      where: { subscriptionStatus: { not: "none" } },
      select: {
        subscriptionStatus: true,
        stripePriceId: true,
        cancelAtPeriodEnd: true,
        createdAt: true,
      },
    }),
    db.lead.count(),
    db.lead.count({ where: { createdAt: { gte: since30 } } }),
    db.completion.count(),
    db.completion.count({ where: { completedAt: { gte: since30 } } }),
    db.assessment.count(),
    db.user.findMany({
      where: { createdAt: { gte: since30 } },
      select: { createdAt: true },
    }),
    db.completion.groupBy({
      by: ["programSlug"],
      _count: { programSlug: true },
      orderBy: { _count: { programSlug: "desc" } },
      take: 5,
    }),
  ]);

  const byStatus = { trialing: 0, active: 0, past_due: 0, canceled: 0 };
  let monthlyCents = 0;
  let cancelling = 0;

  for (const sub of subscribers) {
    if (sub.subscriptionStatus in byStatus) {
      byStatus[sub.subscriptionStatus as keyof typeof byStatus]++;
    }
    if (!ACTIVE_STATUSES.includes(sub.subscriptionStatus as "active" | "trialing")) continue;
    if (sub.cancelAtPeriodEnd) cancelling++;

    // Un abonnement annuel est ramené au mois pour que le total soit
    // comparable d'une formule à l'autre.
    const plan = planOf(sub.stripePriceId);
    if (plan === "mensuel") monthlyCents += PLANS.mensuel.amountCents;
    if (plan === "annuel") monthlyCents += Math.round(PLANS.annuel.amountCents / 12);
  }

  // Conversion : parmi les comptes qui ont dépassé le stade de l'essai, la part
  // qui est devenue payante. Les essais en cours sont exclus du calcul, sinon
  // le taux plongerait à chaque nouvelle inscription.
  const decided = byStatus.active + byStatus.canceled;
  const conversion = decided > 0 ? Math.round((byStatus.active / decided) * 100) : null;

  // Inscriptions par jour sur 30 jours, pour la courbe.
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const daily = Array.from({ length: 30 }, (_, i) => {
    const dayStart = startOfToday.getTime() - (29 - i) * DAY;
    return {
      date: new Date(dayStart),
      count: signupDates.filter(
        (u) => u.createdAt.getTime() >= dayStart && u.createdAt.getTime() < dayStart + DAY,
      ).length,
    };
  });

  return {
    users,
    newUsers30,
    newUsers7: signupDates.filter((u) => u.createdAt >= since7).length,
    byStatus,
    cancelling,
    monthlyCents,
    yearlyCents: monthlyCents * 12,
    conversion,
    leads,
    newLeads30,
    completionsTotal,
    completions30,
    assessments,
    daily,
    topPrograms: completionsByProgram.map((row) => ({
      slug: row.programSlug,
      count: row._count.programSlug,
    })),
  };
}

export function euros(cents: number): string {
  return (cents / 100).toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
}
