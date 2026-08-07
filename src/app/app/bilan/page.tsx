import Link from "next/link";
import type { Metadata } from "next";
import { BilanForm } from "./BilanForm";
import { supprimerBilan } from "./actions";
import { Badge, Button } from "@/components/ui";
import { aiEnabled } from "@/lib/ai";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Plan } from "@/lib/coach";

export const metadata: Metadata = { title: "Mon bilan" };

const KIND_STYLES = {
  seance: "border-brand-400/40 bg-brand-400/10 text-brand-200",
  actif: "border-white/10 bg-white/[0.04] text-white/60",
  repos: "border-white/5 bg-transparent text-white/35",
} as const;

export default async function BilanPage() {
  const user = await requireUser();

  const latest = await db.assessment.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  if (!latest) {
    return (
      <div className="mx-auto max-w-3xl">
        <Header />
        <div className="mt-8">
          <BilanForm />
        </div>
        {!aiEnabled && <AiNotice />}
      </div>
    );
  }

  const plan = JSON.parse(latest.planJson) as Plan;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Mon bilan</h1>
          <p className="mt-1 text-sm text-white/50">
            Établi le{" "}
            {latest.createdAt.toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <form action={supprimerBilan}>
          <input type="hidden" name="id" value={latest.id} />
          <button
            type="submit"
            className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/5"
          >
            Refaire mon bilan
          </button>
        </form>
      </div>

      {/* Programme retenu */}
      <section className="rounded-3xl border border-brand-400/30 bg-brand-400/[0.06] p-7">
        <Badge>Votre programme</Badge>
        <h2 className="mt-3 text-2xl font-extrabold text-white">{plan.programName}</h2>
        <p className="mt-3 leading-relaxed text-white/70">{plan.why}</p>
        <p className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-white/60">
          <span>🗓 {plan.sessionsPerWeek} séances par semaine</span>
          <span>⏱ {plan.minutesPerSession} min par séance</span>
          <span>📅 4 semaines</span>
        </p>
        <Button href={`/app/programmes/${plan.programSlug}`} className="mt-6">
          Ouvrir le programme
        </Button>
      </section>

      {/* Semaine type */}
      <section>
        <h2 className="text-xl font-extrabold text-white">Votre semaine type</h2>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {plan.weeklySchedule.map((slot) => (
            <div
              key={slot.day}
              className={`rounded-2xl border px-3 py-4 text-center ${KIND_STYLES[slot.kind]}`}
            >
              <p className="text-xs font-bold uppercase tracking-wide">{slot.day.slice(0, 3)}</p>
              <p className="mt-2 text-xs leading-tight">{slot.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Objectifs hebdomadaires */}
      <section>
        <h2 className="text-xl font-extrabold text-white">Vos objectifs, semaine par semaine</h2>
        <p className="mt-1 text-sm text-white/50">
          Des objectifs qui dépendent de vous, pas de la balance : ce sont ceux qu&apos;un
          programme peut réellement tenir.
        </p>
        <ol className="mt-5 space-y-3">
          {plan.milestones.map((milestone) => (
            <li
              key={milestone.week}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
            >
              <p className="font-bold text-white">{milestone.title}</p>
              <ul className="mt-2 space-y-1 text-sm text-white/60">
                {milestone.targets.map((target) => (
                  <li key={target}>○ {target}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      {/* Objectif du mois */}
      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-7">
        <Badge tone="dark">Fin du mois</Badge>
        <h2 className="mt-3 text-xl font-extrabold text-white">{plan.monthGoal.title}</h2>
        <ul className="mt-4 space-y-2 text-sm text-white/70">
          {plan.monthGoal.targets.map((target) => (
            <li key={target} className="flex gap-2">
              <span className="text-brand-300">✓</span>
              {target}
            </li>
          ))}
        </ul>
        <p className="mt-5 text-xs leading-relaxed text-white/40">
          Ces objectifs portent sur ce que vous faites, pas sur un chiffre de perte de poids :
          celui-ci dépend de votre alimentation, de votre sommeil et de votre métabolisme, et
          personne ne peut l&apos;annoncer honnêtement à l&apos;avance.
        </p>
      </section>

      {/* Remarques personnalisées */}
      {(plan.aiNotes?.length || plan.advice.length > 0) && (
        <section>
          <h2 className="text-xl font-extrabold text-white">Conseils pour bien démarrer</h2>
          <ul className="mt-4 space-y-3">
            {[...(plan.aiNotes ?? []), ...plan.advice].map((note) => (
              <li
                key={note}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-sm leading-relaxed text-white/70"
              >
                {note}
              </li>
            ))}
          </ul>
          {plan.aiEncouragement && (
            <p className="mt-4 rounded-2xl bg-brand-400/10 px-5 py-4 text-sm font-medium text-brand-200">
              {plan.aiEncouragement}
            </p>
          )}
        </section>
      )}

      {latest.photoDataUrl && (
        <section>
          <h2 className="text-xl font-extrabold text-white">Votre photo de départ</h2>
          <p className="mt-1 text-sm text-white/50">
            Reprenez la même pose et le même cadrage dans quatre semaines pour comparer.
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={latest.photoDataUrl}
            alt="Votre photo de départ"
            className="mt-4 w-48 rounded-2xl object-cover ring-1 ring-white/15"
          />
        </section>
      )}

      <p className="border-t border-white/10 pt-6 text-xs leading-relaxed text-white/40">
        <strong className="text-white/60">Rappel :</strong> ce bilan est un plan
        d&apos;entraînement, pas un avis médical. Demandez l&apos;accord de votre médecin avant
        de reprendre une activité physique, en particulier en cas de problème cardiaque, de
        blessure, de grossesse ou de traitement en cours.{" "}
        <Link href="/app/progression" className="underline">
          Suivez vos mesures ici.
        </Link>
      </p>
    </div>
  );
}

function Header() {
  return (
    <>
      <h1 className="text-3xl font-extrabold tracking-tight text-white">Mon bilan</h1>
      <p className="mt-2 max-w-2xl leading-relaxed text-white/60">
        Quelques questions, une photo si vous le souhaitez, et vous repartez avec le programme
        adapté à votre objectif, votre semaine type et des objectifs mesurables pour chaque
        semaine du mois.
      </p>
    </>
  );
}

function AiNotice() {
  return (
    <p className="mt-8 rounded-2xl bg-amber-400/10 px-5 py-4 text-sm leading-relaxed text-amber-200">
      <strong>Note pour vous, pas pour vos abonnés :</strong> la clé{" "}
      <code>ANTHROPIC_API_KEY</code> n&apos;est pas renseignée dans <code>.env</code>. Le bilan
      fonctionne quand même — le programme, la semaine type et les objectifs sont calculés par le
      moteur du site. Avec la clé, un commentaire personnalisé s&apos;ajoute en plus.
    </p>
  );
}
