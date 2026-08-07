import type { Metadata } from "next";
import { MetricForm } from "./MetricForm";
import { getProgram } from "@/content/programs";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { weeklyStreak } from "@/lib/progress";

export const metadata: Metadata = { title: "Progression" };

const FEELINGS: Record<number, string> = {
  1: "😵",
  2: "😮‍💨",
  3: "🙂",
  4: "😃",
  5: "🦾",
};

export default async function ProgressionPage() {
  const user = await requireUser();

  const [completions, metrics] = await Promise.all([
    db.completion.findMany({
      where: { userId: user.id },
      orderBy: { completedAt: "desc" },
      take: 100,
    }),
    db.bodyMetric.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      take: 40,
    }),
  ]);

  const streak = weeklyStreak(completions.map((c) => c.completedAt));
  const totalMinutes = Math.round(completions.reduce((s, c) => s + c.durationSec, 0) / 60);
  const weights = metrics.filter((m) => m.weightKg != null);
  const weightDelta =
    weights.length >= 2
      ? (weights[0].weightKg as number) - (weights[weights.length - 1].weightKg as number)
      : null;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-extrabold tracking-tight text-white">Ma progression</h1>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat value={completions.length} label="séances" />
        <Stat value={streak} label={streak > 1 ? "semaines de suite" : "semaine de suite"} />
        <Stat value={totalMinutes} label="minutes" />
        <Stat
          value={
            weightDelta == null
              ? "—"
              : `${weightDelta > 0 ? "+" : ""}${weightDelta.toFixed(1)} kg`
          }
          label="depuis le début"
        />
      </section>

      <MetricForm />

      {/* Courbe de poids : un graphique SVG maison, sans librairie */}
      {weights.length >= 2 && <WeightChart points={weights.map((m) => m.weightKg as number)} />}

      <section>
        <h2 className="text-xl font-extrabold text-white">Historique des séances</h2>
        {completions.length === 0 ? (
          <p className="mt-3 rounded-2xl bg-white/[0.04] p-6 text-sm text-white/55 ring-1 ring-white/10">
            Aucune séance enregistrée pour l&apos;instant. Elle apparaîtra ici dès que vous en
            terminerez une.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-white/10 overflow-hidden rounded-2xl bg-white/[0.04] ring-1 ring-white/10">
            {completions.map((c) => {
              const program = getProgram(c.programSlug);
              return (
                <li key={c.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-white">
                      {program?.name ?? c.programSlug}
                    </p>
                    <p className="text-xs text-white/55">
                      Semaine {c.week} · Séance {c.day} ·{" "}
                      {c.completedAt.toLocaleDateString("fr-FR", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-sm text-white/70">
                    <span className="tabular-nums">{Math.round(c.durationSec / 60)} min</span>
                    {c.feeling && <span aria-label={`ressenti ${c.feeling}/5`}>{FEELINGS[c.feeling]}</span>}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-2xl bg-white/[0.04] p-5 text-center ring-1 ring-white/10">
      <p className="text-2xl font-extrabold tabular-nums text-white">{value}</p>
      <p className="mt-1 text-xs font-medium text-white/55">{label}</p>
    </div>
  );
}

function WeightChart({ points }: { points: number[] }) {
  // Les mesures arrivent de la plus récente à la plus ancienne : on remet dans
  // l'ordre du temps pour tracer la courbe de gauche à droite.
  const values = [...points].reverse();
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const width = 600;
  const height = 160;

  const coords = values.map((value, i) => {
    const x = values.length === 1 ? width / 2 : (i / (values.length - 1)) * width;
    const y = height - ((value - min) / span) * (height - 24) - 12;
    return [x, y] as const;
  });

  const line = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x} ${y}`).join(" ");
  const area = `${line} L${width} ${height} L0 ${height} Z`;

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
      <div className="flex items-baseline justify-between">
        <h2 className="font-extrabold text-white">Évolution du poids</h2>
        <p className="text-sm text-white/55 tabular-nums">
          {min.toFixed(1)} – {max.toFixed(1)} kg
        </p>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="mt-4 w-full"
        role="img"
        aria-label={`Courbe de poids, de ${values[0]} à ${values[values.length - 1]} kilos`}
        preserveAspectRatio="none"
      >
        <path d={area} className="fill-brand-100" />
        <path
          d={line}
          className="stroke-brand-500"
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {coords.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={4} className="fill-brand-600" />
        ))}
      </svg>
    </section>
  );
}
