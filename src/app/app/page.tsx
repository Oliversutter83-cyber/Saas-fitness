import Link from "next/link";
import { Badge, Button } from "@/components/ui";
import { Figure } from "@/components/Figure";
import { PROGRAMS, weekLabel } from "@/content/programs";
import { getExercise, keyPoseOf } from "@/content/exercises";
import { hasAccess, requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  getCompletionKeys,
  nextSessionOf,
  progressOf,
  recommendedProgram,
  weeklyStreak,
} from "@/lib/progress";
import { TRIAL_DAYS } from "@/config";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ paiement?: string; demo?: string }>;
}) {
  const [user, params] = await Promise.all([requireUser(), searchParams]);
  const active = hasAccess(user);

  const [done, completions] = await Promise.all([
    getCompletionKeys(user.id),
    db.completion.findMany({
      where: { userId: user.id },
      orderBy: { completedAt: "desc" },
      take: 60,
    }),
  ]);

  const program = recommendedProgram(user.goal);
  const { session, finished } = nextSessionOf(program, done);
  const streak = weeklyStreak(completions.map((c) => c.completedAt));
  const totalMinutes = Math.round(
    completions.reduce((sum, c) => sum + c.durationSec, 0) / 60,
  );

  return (
    <div className="space-y-8">
      {params.paiement === "ok" && (
        <Notice tone="success">
          Paiement confirmé, votre abonnement est actif. Bon entraînement !
        </Notice>
      )}
      {params.demo === "1" && (
        <Notice tone="info">
          Accès ouvert en <strong>mode démo</strong> (Stripe n&apos;est pas encore configuré). Aucun
          paiement n&apos;a été encaissé.
        </Notice>
      )}

      <div>
        <p className="text-sm font-semibold text-brand-300">Bonjour {user.firstName} 👋</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-white">
          {finished ? "Programme terminé, bravo !" : "Prêt pour votre séance ?"}
        </h1>
      </div>

      {!active && (
        <div className="rounded-2xl border border-ember-500/40 bg-ember-900/20 p-6 text-white">
          <p className="font-bold">Votre accès n&apos;est pas encore activé</p>
          <p className="mt-1 text-sm text-white/60">
            Lancez vos {TRIAL_DAYS} jours d&apos;essai pour débloquer les {PROGRAMS.length}{" "}
            programmes et le suivi de progression.
          </p>
          <Button href="/app/abonnement" className="mt-4">
            Activer mon accès
          </Button>
        </div>
      )}

      {/* Prochaine séance */}
      <section className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] text-white">
        <div className="flex flex-col gap-6 p-7 sm:flex-row sm:items-center">
          <div className="flex-1">
            <Badge tone="dark">
              {program.name} · Semaine {session.week} — {weekLabel(session.week)}
            </Badge>
            <h2 className="mt-3 text-2xl font-extrabold">
              Séance {session.day} — {session.title}
            </h2>
            <p className="mt-1 text-sm text-white/55">{session.focus}</p>
            <p className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-white/70">
              <span>⏱ {session.estimatedMin} min</span>
              <span>🔁 {session.blocks[1].rounds} tours</span>
              <span>💥 {session.blocks[1].items.length} exercices</span>
            </p>
            <Button
              href={`/seance/${program.slug}/${session.week}/${session.day}`}
              size="lg"
              className="mt-6"
            >
              {finished ? "Refaire cette séance" : "Commencer la séance"}
            </Button>
          </div>

          <div className="hidden w-40 shrink-0 sm:block">
            <Figure
              pose={keyPoseOf(getExercise(session.blocks[1].items[0].exercise))}
              className="h-40 w-full"
            />
          </div>
        </div>

        <ol className="flex gap-2 overflow-x-auto border-t border-white/10 px-7 py-4 no-scrollbar">
          {session.blocks[1].items.map((item, i) => {
            const ex = getExercise(item.exercise);
            return (
              <li
                key={i}
                className="shrink-0 rounded-xl bg-white/5 px-3 py-2 text-xs font-medium text-white/70"
              >
                {ex.name}
                <span className="ml-1.5 text-white/40">
                  {item.reps ? `×${item.reps}` : `${item.seconds}s`}
                </span>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Chiffres */}
      <section className="grid grid-cols-3 gap-3">
        <Stat value={completions.length} label="séances terminées" />
        <Stat value={streak} label={streak > 1 ? "semaines de suite" : "semaine de suite"} />
        <Stat value={`${totalMinutes}`} label="minutes d'effort" />
      </section>

      {/* Programmes */}
      <section>
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-extrabold text-white">Vos programmes</h2>
          <Link href="/app/programmes" className="text-sm font-bold text-brand-300 hover:underline">
            Tout voir
          </Link>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {PROGRAMS.map((p) => {
            const stats = progressOf(p, done);
            return (
              <Link
                key={p.slug}
                href={`/app/programmes/${p.slug}`}
                className="group rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-brand-400"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-white">{p.name}</h3>
                    <p className="mt-0.5 text-xs text-white/55">{p.tagline}</p>
                  </div>
                  <span className="text-sm font-extrabold tabular-nums text-brand-300">
                    {stats.percent}%
                  </span>
                </div>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-brand-400 transition-all"
                    style={{ width: `${stats.percent}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-white/55">
                  {stats.completed} / {stats.total} séances
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-2xl bg-white/[0.04] p-5 text-center ring-1 ring-white/10">
      <p className="text-3xl font-extrabold tabular-nums text-white">{value}</p>
      <p className="mt-1 text-xs font-medium text-white/55">{label}</p>
    </div>
  );
}

function Notice({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "success" | "info";
}) {
  return (
    <p
      className={`rounded-2xl px-5 py-4 text-sm font-medium ${
        tone === "success" ? "bg-brand-400/15 text-brand-100" : "bg-sky-400/10 text-sky-200"
      }`}
    >
      {children}
    </p>
  );
}
