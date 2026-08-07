import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Badge } from "@/components/ui";
import { PLANS, TRIAL_DAYS } from "@/config";
import { getProgram } from "@/content/programs";
import { isOwner, requireUser } from "@/lib/auth";
import { euros, getMetrics, type Metrics } from "@/lib/metrics";
import { stripeEnabled } from "@/lib/stripe";

export const metadata: Metadata = { title: "Pilotage" };

/** Tableau de bord de l'exploitant. Réservé à votre compte. */
export default async function PilotagePage() {
  const user = await requireUser();
  if (!isOwner(user.email)) notFound();

  const m = await getMetrics();

  return (
    <div className="space-y-10">
      <header>
        <Badge tone="dark">Réservé à votre compte</Badge>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white">Pilotage</h1>
        <p className="mt-2 max-w-2xl leading-relaxed text-white/55">
          L&apos;état du business en un écran : qui s&apos;abonne, ce que ça rapporte, et si vos
          abonnés s&apos;entraînent vraiment.
        </p>
      </header>

      {/* Les quatre chiffres qui comptent */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          value={euros(m.monthlyCents)}
          label="Revenu mensuel estimé"
          hint={`soit ${euros(m.yearlyCents)} sur un an au rythme actuel`}
          accent
        />
        <Stat
          value={m.byStatus.active}
          label="Abonnés payants"
          hint={m.cancelling > 0 ? `dont ${m.cancelling} en cours de résiliation` : "aucune résiliation en cours"}
        />
        <Stat
          value={m.byStatus.trialing}
          label={`Essais en cours (${TRIAL_DAYS} j)`}
          hint="deviendront payants s'ils ne résilient pas"
        />
        <Stat
          value={m.conversion === null ? "—" : `${m.conversion} %`}
          label="Essai → payant"
          hint={
            m.conversion === null
              ? "aucun essai encore arrivé à terme"
              : `sur ${m.byStatus.active + m.byStatus.canceled} essais terminés`
          }
        />
      </section>

      <p className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-xs leading-relaxed text-white/50">
        <strong className="text-white/70">Sur le revenu :</strong> c&apos;est une estimation
        calculée depuis vos abonnements ({PLANS.mensuel.priceLabel}/mois,{" "}
        {PLANS.annuel.priceLabel}/an ramené au mois). Elle ignore les codes promo, les
        remboursements, les impayés et la TVA.{" "}
        {stripeEnabled
          ? "Pour la comptabilité, faites foi du tableau de bord Stripe."
          : "Stripe n'est pas encore configuré : ces montants proviennent d'abonnements de démonstration et ne correspondent à aucun encaissement réel."}
      </p>

      {/* Acquisition */}
      <section>
        <h2 className="text-xl font-extrabold text-white">Acquisition</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Stat value={m.users} label="Comptes créés" hint={`${m.newUsers30} sur 30 jours`} />
          <Stat value={m.newUsers7} label="Inscrits cette semaine" hint="7 derniers jours" />
          <Stat
            value={m.leads}
            label="Emails captés"
            hint={`${m.newLeads30} sur 30 jours`}
          />
        </div>

        <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-bold text-white">Inscriptions, 30 derniers jours</h3>
            <p className="text-sm text-white/45">
              {m.newUsers30} au total
              {m.newUsers30 > 0 && ` · ${(m.newUsers30 / 30).toFixed(1)} par jour en moyenne`}
            </p>
          </div>
          <SignupChart daily={m.daily} />
        </div>
      </section>

      {/* Usage */}
      <section>
        <h2 className="text-xl font-extrabold text-white">Ce que font vos abonnés</h2>
        <p className="mt-1 text-sm text-white/50">
          Un abonné qui ne s&apos;entraîne pas résilie. C&apos;est l&apos;indicateur qui prédit le
          mieux vos revenus du mois prochain.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Stat
            value={m.completions30}
            label="Séances terminées"
            hint="30 derniers jours"
          />
          <Stat value={m.completionsTotal} label="Séances depuis le début" />
          <Stat
            value={m.assessments}
            label="Bilans réalisés"
            hint={`sur ${m.users} comptes`}
          />
        </div>

        {m.topPrograms.length > 0 && (
          <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <h3 className="font-bold text-white">Programmes les plus suivis</h3>
            <ul className="mt-4 space-y-3">
              {m.topPrograms.map((row) => {
                const share = Math.round((row.count / Math.max(1, m.completionsTotal)) * 100);
                return (
                  <li key={row.slug}>
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="font-semibold text-white">
                        {getProgram(row.slug)?.name ?? row.slug}
                      </span>
                      <span className="shrink-0 tabular-nums text-white/50">
                        {row.count} séance{row.count > 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-brand-400"
                        style={{ width: `${share}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>

      {/* Abonnements par état */}
      <section>
        <h2 className="text-xl font-extrabold text-white">État des abonnements</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat value={m.byStatus.trialing} label="En essai" />
          <Stat value={m.byStatus.active} label="Actifs" />
          <Stat
            value={m.byStatus.past_due}
            label="Paiement en échec"
            hint={m.byStatus.past_due > 0 ? "à relancer" : undefined}
            warn={m.byStatus.past_due > 0}
          />
          <Stat value={m.byStatus.canceled} label="Résiliés" />
        </div>
      </section>
    </div>
  );
}

function Stat({
  value,
  label,
  hint,
  accent,
  warn,
}: {
  value: string | number;
  label: string;
  hint?: string;
  accent?: boolean;
  warn?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        warn
          ? "border-ember-500/40 bg-ember-900/20"
          : accent
            ? "border-brand-400/40 bg-brand-400/[0.07]"
            : "border-white/10 bg-white/[0.03]"
      }`}
    >
      <p
        className={`text-2xl font-extrabold tabular-nums sm:text-3xl ${
          accent ? "text-brand-200" : "text-white"
        }`}
      >
        {value}
      </p>
      <p className="mt-1 text-xs font-semibold text-white/70">{label}</p>
      {hint && <p className="mt-1 text-[0.7rem] leading-snug text-white/40">{hint}</p>}
    </div>
  );
}

/**
 * Histogramme des inscriptions. En SVG, sans librairie : les barres sont
 * dessinées en pourcentage de la largeur, donc il se redimensionne tout seul
 * du téléphone à l'écran large.
 */
function SignupChart({ daily }: { daily: Metrics["daily"] }) {
  const max = Math.max(1, ...daily.map((d) => d.count));

  return (
    <div className="mt-5">
      <div className="flex h-28 items-end gap-[2px]" role="img" aria-label="Inscriptions par jour sur 30 jours">
        {daily.map((day) => (
          <div
            key={day.date.toISOString()}
            className="group relative flex-1 rounded-t bg-brand-400/70 transition hover:bg-brand-300"
            style={{ height: `${Math.max(2, (day.count / max) * 100)}%` }}
          >
            <span className="pointer-events-none absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-ink-800 px-2 py-1 text-[0.65rem] text-white group-hover:block">
              {day.date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} ·{" "}
              {day.count}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[0.7rem] text-white/35">
        <span>{daily[0].date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</span>
        <span>Aujourd&apos;hui</span>
      </div>
    </div>
  );
}
