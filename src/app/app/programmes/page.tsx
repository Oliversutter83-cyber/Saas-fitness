import Link from "next/link";
import type { Metadata } from "next";
import { Badge } from "@/components/ui";
import { PROGRAMS } from "@/content/programs";
import { requireUser } from "@/lib/auth";
import { getCompletionKeys, progressOf } from "@/lib/progress";

export const metadata: Metadata = { title: "Programmes" };

const LEVELS: Record<string, string> = {
  debutant: "Débutant",
  intermediaire: "Intermédiaire",
  avance: "Confirmé",
};

export default async function ProgrammesPage() {
  const user = await requireUser();
  const done = await getCompletionKeys(user.id);

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight text-white">Programmes</h1>
      <p className="mt-2 text-white/55">
        Suivez-en un du début à la fin avant d&apos;en changer : c&apos;est la progression sur les 4
        semaines qui produit les résultats.
      </p>

      <div className="mt-8 space-y-4">
        {PROGRAMS.map((program) => {
          const stats = progressOf(program, done);
          return (
            <Link
              key={program.slug}
              href={`/app/programmes/${program.slug}`}
              className="block rounded-3xl border border-white/10 bg-white/[0.04] p-7 transition hover:border-brand-400"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-extrabold text-white">{program.name}</h2>
                    <Badge tone="neutral">{LEVELS[program.level]}</Badge>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">{program.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-extrabold tabular-nums text-brand-300">
                    {stats.percent}%
                  </p>
                  <p className="text-xs text-white/55">
                    {stats.completed}/{stats.total} séances
                  </p>
                </div>
              </div>

              <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-brand-400"
                  style={{ width: `${stats.percent}%` }}
                />
              </div>

              <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-2 text-sm text-white/55">
                <div>
                  <dt className="inline font-semibold text-white/80">{program.weeks} semaines</dt>
                </div>
                <div>
                  <dt className="inline font-semibold text-white/80">
                    {program.daysPerWeek} séances
                  </dt>{" "}
                  par semaine
                </div>
                <div>
                  <dt className="inline font-semibold text-white/80">
                    ~{program.minutesPerSession} min
                  </dt>{" "}
                  par séance
                </div>
                <div>Matériel : {program.equipment.join(", ").toLowerCase()}</div>
              </dl>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
