import "server-only";
import { db } from "@/lib/db";
import { PROGRAMS, getProgram, type Program, type Session } from "@/content/programs";

export type CompletionKey = `${string}:${number}:${number}`;

export function keyOf(programSlug: string, week: number, day: number): CompletionKey {
  return `${programSlug}:${week}:${day}`;
}

export async function getCompletionKeys(userId: string): Promise<Set<CompletionKey>> {
  const rows = await db.completion.findMany({
    where: { userId },
    select: { programSlug: true, week: true, day: true },
  });
  return new Set(rows.map((r) => keyOf(r.programSlug, r.week, r.day)));
}

/**
 * La prochaine séance à faire dans un programme : la première non terminée,
 * en suivant l'ordre semaine puis jour. Si tout est terminé, on renvoie la
 * dernière pour permettre de la refaire.
 */
export function nextSessionOf(program: Program, done: Set<CompletionKey>) {
  const pending = program.sessions.find((s) => !done.has(keyOf(program.slug, s.week, s.day)));
  return { session: pending ?? program.sessions[program.sessions.length - 1], finished: !pending };
}

export function progressOf(program: Program, done: Set<CompletionKey>) {
  const total = program.sessions.length;
  const completed = program.sessions.filter((s) =>
    done.has(keyOf(program.slug, s.week, s.day)),
  ).length;
  return { total, completed, percent: total ? Math.round((completed / total) * 100) : 0 };
}

/** Programme conseillé selon l'objectif choisi à l'inscription. */
export function recommendedProgram(goal: string): Program {
  const byGoal: Record<string, string> = {
    "perte-de-poids": "brule-graisses-hiit",
    fessiers: "fessiers-jambes",
    muscle: "haut-du-corps-abdos",
    forme: "demarrage-full-body",
  };
  return getProgram(byGoal[goal] ?? "demarrage-full-body") ?? PROGRAMS[0];
}

/**
 * Série en cours : nombre de semaines consécutives (en remontant depuis cette
 * semaine) où au moins une séance a été terminée. Compter en semaines plutôt
 * qu'en jours évite de casser la série pour un jour de repos.
 */
export function weeklyStreak(dates: Date[]): number {
  if (dates.length === 0) return 0;

  const weeks = new Set(dates.map(startOfWeek));
  const thisWeek = startOfWeek(new Date());
  const WEEK_MS = 7 * 86_400_000;

  // Une semaine encore vierge ne casse pas la série : on part de la semaine
  // précédente si celle en cours ne compte aucune séance.
  let cursor = weeks.has(thisWeek) ? thisWeek : thisWeek - WEEK_MS;
  let streak = 0;
  while (weeks.has(cursor)) {
    streak++;
    cursor -= WEEK_MS;
  }
  return streak;
}

function startOfWeek(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = (d.getDay() + 6) % 7; // lundi = 0
  d.setDate(d.getDate() - day);
  return d.getTime();
}

export function sessionDurationLabel(session: Session) {
  return `${session.estimatedMin} min`;
}
