import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Badge, Button } from "@/components/ui";
import { getExercise } from "@/content/exercises";
import { PROGRAMS, getProgram, weekLabel } from "@/content/programs";
import { requireUser } from "@/lib/auth";
import { getCompletionKeys, keyOf, nextSessionOf, progressOf } from "@/lib/progress";

export function generateStaticParams() {
  return PROGRAMS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const program = getProgram((await params).slug);
  return { title: program?.name ?? "Programme" };
}

export default async function ProgrammePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const program = getProgram(slug);
  if (!program) notFound();

  const user = await requireUser();
  const done = await getCompletionKeys(user.id);
  const stats = progressOf(program, done);
  const { session: next } = nextSessionOf(program, done);

  const weeks = Array.from({ length: program.weeks }, (_, i) => i + 1);

  return (
    <div>
      <Link href="/app/programmes" className="text-sm font-semibold text-white/55 hover:underline">
        ← Tous les programmes
      </Link>

      <header className="mt-4 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-8 text-white">
        <h1 className="text-3xl font-extrabold tracking-tight">{program.name}</h1>
        <p className="mt-1 font-semibold text-brand-300">{program.tagline}</p>
        <p className="mt-4 max-w-2xl leading-relaxed text-white/60">{program.description}</p>

        <div className="mt-6 h-2 max-w-md overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-brand-400 transition-all"
            style={{ width: `${stats.percent}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-white/50">
          {stats.completed} séances terminées sur {stats.total}
        </p>

        <Button
          href={`/seance/${program.slug}/${next.week}/${next.day}`}
          size="lg"
          className="mt-6"
        >
          Reprendre : semaine {next.week}, séance {next.day}
        </Button>
      </header>

      <div className="mt-10 space-y-10">
        {weeks.map((week) => {
          const sessions = program.sessions.filter((s) => s.week === week);
          const weekDone = sessions.every((s) => done.has(keyOf(program.slug, s.week, s.day)));

          return (
            <section key={week}>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-extrabold text-white">Semaine {week}</h2>
                <Badge tone={weekDone ? "brand" : "neutral"}>
                  {weekDone ? "✓ Terminée" : weekLabel(week)}
                </Badge>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {sessions.map((s) => {
                  const isDone = done.has(keyOf(program.slug, s.week, s.day));
                  return (
                    <Link
                      key={s.day}
                      href={`/seance/${program.slug}/${s.week}/${s.day}`}
                      className={`rounded-2xl border p-5 transition ${
                        isDone
                          ? "border-brand-300 bg-white/5"
                          : "border-white/10 bg-white/[0.04] hover:border-brand-400"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-bold uppercase tracking-wide text-white/55">
                          Séance {s.day}
                        </p>
                        {isDone && <span className="text-brand-600">✓</span>}
                      </div>
                      <h3 className="mt-1 font-bold text-white">{s.title}</h3>
                      <p className="mt-1 text-xs text-white/55">{s.focus}</p>
                      <p className="mt-3 text-xs font-semibold text-white/70">
                        ⏱ {s.estimatedMin} min · {s.blocks[1].rounds} tours
                      </p>
                      <p className="mt-2 line-clamp-2 text-xs text-white/55">
                        {s.blocks[1].items.map((i) => getExercise(i.exercise).name).join(" · ")}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
