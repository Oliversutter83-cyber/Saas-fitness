import type { Metadata } from "next";
import { annulerDemo, demarrerAbonnement, ouvrirPortail } from "./actions";
import { Badge } from "@/components/ui";
import { PLANS, TRIAL_DAYS } from "@/config";
import { EXERCISES } from "@/content/exercises";
import { PROGRAMS } from "@/content/programs";
import { hasAccess, isOwnerAccount, requireUser } from "@/lib/auth";
import { stripeEnabled } from "@/lib/stripe";

export const metadata: Metadata = { title: "Abonnement" };

const STATUS_LABELS: Record<string, string> = {
  none: "Aucun abonnement",
  trialing: "Période d'essai",
  active: "Actif",
  past_due: "Paiement en échec",
  canceled: "Résilié",
};

export default async function AbonnementPage({
  searchParams,
}: {
  searchParams: Promise<{ requis?: string; bienvenue?: string; paiement?: string; portail?: string }>;
}) {
  const [user, params] = await Promise.all([requireUser(), searchParams]);
  const active = hasAccess(user);
  const owner = isOwnerAccount(user.email);

  return (
    <div className="mx-auto max-w-3xl">
      {params.requis === "1" && (
        <p className="mb-6 rounded-2xl bg-ink-900 px-5 py-4 text-sm font-medium text-white">
          Cette séance fait partie de l&apos;abonnement. Activez votre accès pour la démarrer.
        </p>
      )}
      {params.bienvenue === "1" && (
        <p className="mb-6 rounded-2xl bg-brand-400/15 px-5 py-4 text-sm font-medium text-brand-100">
          Bienvenue {user.firstName} ! Dernière étape : choisissez votre formule pour lancer vos{" "}
          {TRIAL_DAYS} jours d&apos;essai.
        </p>
      )}
      {params.paiement === "annule" && (
        <p className="mb-6 rounded-2xl bg-white/5 px-5 py-4 text-sm text-white/70">
          Paiement abandonné. Votre compte est conservé, vous pouvez réessayer quand vous voulez.
        </p>
      )}
      {params.portail === "indisponible" && (
        <p className="mb-6 rounded-2xl bg-white/5 px-5 py-4 text-sm text-white/70">
          Le portail de gestion n&apos;est pas disponible : aucun abonnement payant n&apos;est
          rattaché à ce compte.
        </p>
      )}

      <h1 className="text-3xl font-extrabold tracking-tight text-white">Abonnement</h1>

      {owner && (
        <p className="mt-6 rounded-2xl border border-brand-400/30 bg-brand-400/[0.07] px-5 py-4 text-sm leading-relaxed text-brand-100">
          <strong>Compte d&apos;exploitant.</strong> Vous avez accès à tous les programmes en
          permanence, sans abonnement : vous n&apos;avez pas à vous payer vous-même pour vérifier ce
          que vous vendez. Cet accès vient de la variable <code>OWNER_EMAIL</code> et ne concerne
          que votre compte.
        </p>
      )}

      {/* État courant */}
      <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-white/55">Statut</p>
            <p className="mt-1 flex items-center gap-2 text-xl font-extrabold text-white">
              {owner
                ? "Accès permanent"
                : (STATUS_LABELS[user.subscriptionStatus] ?? user.subscriptionStatus)}
              {active && <Badge>Accès ouvert</Badge>}
            </p>
          </div>
          {user.currentPeriodEnd && (
            <div className="text-right">
              <p className="text-sm text-white/55">
                {user.cancelAtPeriodEnd ? "Accès jusqu'au" : "Prochain renouvellement"}
              </p>
              <p className="mt-1 font-bold text-white">
                {user.currentPeriodEnd.toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          )}
        </div>

        {user.subscriptionStatus === "past_due" && (
          <p className="mt-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">
            Le dernier paiement a échoué. Mettez à jour votre moyen de paiement pour conserver
            l&apos;accès.
          </p>
        )}

        {active && (
          <div className="mt-6 flex flex-wrap gap-3">
            {stripeEnabled ? (
              <form action={ouvrirPortail}>
                <button
                  type="submit"
                  className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/5"
                >
                  Gérer / résilier mon abonnement
                </button>
              </form>
            ) : (
              <form action={annulerDemo}>
                <button
                  type="submit"
                  className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/5"
                >
                  Désactiver l&apos;accès démo
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Offres */}
      {!active && (
        <>
          <h2 className="mt-12 text-xl font-extrabold text-white">Choisissez votre formule</h2>
          <p className="mt-1 text-sm text-white/55">
            {TRIAL_DAYS} jours d&apos;essai. Rien n&apos;est prélevé avant la fin de l&apos;essai, et
            vous pouvez résilier à tout moment.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {Object.values(PLANS).map((plan) => {
              const isYearly = plan.id === "annuel";
              return (
                <form
                  key={plan.id}
                  action={demarrerAbonnement}
                  className={`relative rounded-3xl p-7 ${
                    isYearly
                      ? "border border-brand-400/40 bg-brand-400/[0.07] text-white"
                      : "border border-white/10 bg-white/[0.04]"
                  }`}
                >
                  <input type="hidden" name="plan" value={plan.id} />
                  {plan.highlight && (
                    <span className="absolute -top-3 left-7 rounded-full bg-brand-400 px-3 py-1 text-xs font-bold text-ink-950">
                      {plan.highlight}
                    </span>
                  )}
                  <p
                    className={`text-sm font-bold uppercase tracking-wider ${
                      isYearly ? "text-brand-300" : "text-white/55"
                    }`}
                  >
                    {plan.name}
                  </p>
                  <p className="mt-2 flex items-end gap-1.5">
                    <span className="text-4xl font-extrabold tracking-tight">
                      {plan.priceLabel}
                    </span>
                    <span className={`pb-1.5 text-sm ${isYearly ? "text-brand-300" : "text-white/55"}`}>
                      {plan.periodLabel}
                    </span>
                  </p>
                  <ul
                    className="mt-5 space-y-1.5 text-sm text-white/70"
                  >
                    {[
                      `${PROGRAMS.length} programmes complets`,
                      `${EXERCISES.length} exercices illustrés`,
                      ...plan.perks,
                    ].map((perk) => (
                      <li key={perk}>✓ {perk}</li>
                    ))}
                  </ul>
                  <button
                    type="submit"
                    className={`mt-6 w-full rounded-full py-3 font-extrabold transition ${
                      isYearly
                        ? "bg-ember-500 text-white hover:bg-ember-400"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    Démarrer l&apos;essai
                  </button>
                </form>
              );
            })}
          </div>

          {!stripeEnabled && (
            <p className="mt-6 rounded-2xl bg-amber-400/10 px-5 py-4 text-sm leading-relaxed text-amber-200">
              <strong>Mode démo actif.</strong> Stripe n&apos;est pas encore configuré : cliquer sur
              « Démarrer l&apos;essai » ouvre l&apos;accès sans aucun paiement, pour pouvoir tester le
              produit. Renseignez <code>STRIPE_SECRET_KEY</code>, <code>STRIPE_PRICE_MENSUEL</code> et{" "}
              <code>STRIPE_PRICE_ANNUEL</code> dans le fichier <code>.env</code> pour activer le vrai
              paiement.
            </p>
          )}
        </>
      )}
    </div>
  );
}
