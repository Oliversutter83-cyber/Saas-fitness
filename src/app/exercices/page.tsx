import Link from "next/link";
import type { Metadata } from "next";
import { Figure } from "@/components/Figure";
import { Button, Container, Logo } from "@/components/ui";
import {
  CATEGORIES,
  EXERCISES,
  exercisesByFamily,
  keyPoseOf,
  type Category,
  type Exercise,
} from "@/content/exercises";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Tous les exercices à faire à la maison",
  description:
    "La bibliothèque complète des exercices sans matériel, rangée par famille de mouvement : toutes les pompes ensemble, tous les squats ensemble, de la variante la plus facile à la plus difficile.",
};

const LEVEL_LABELS = ["", "Facile", "Intermédiaire", "Difficile"];

export default async function ExercicesPage({
  searchParams,
}: {
  searchParams: Promise<{ categorie?: string }>;
}) {
  const [{ categorie }, user] = await Promise.all([searchParams, getCurrentUser()]);
  const active = (categorie ?? "") as Category | "";
  const list = active ? EXERCISES.filter((e) => e.category === active) : EXERCISES;
  const groups = exercisesByFamily(list);

  return (
    <div className="min-h-dvh bg-ink-950">
      <header className="border-b border-white/10">
        <Container className="flex h-16 items-center justify-between">
          <Link href="/">
            <Logo />
          </Link>
          <Button href={user ? "/app" : "/inscription"}>
            {user ? "Mon espace" : "Commencer"}
          </Button>
        </Container>
      </header>

      <Container className="py-14">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          {EXERCISES.length} exercices, rangés par famille
        </h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-white/60">
          Toutes les variantes d&apos;un même mouvement sont regroupées et classées de la plus
          accessible à la plus exigeante. Vous voyez d&apos;un coup d&apos;œil par où commencer et
          quelle est l&apos;étape suivante.
        </p>

        <nav className="mt-8 flex flex-wrap gap-2">
          <FilterLink href="/exercices" label="Tout" active={!active} />
          {(Object.keys(CATEGORIES) as Category[]).map((key) => (
            <FilterLink
              key={key}
              href={`/exercices?categorie=${key}`}
              label={`${CATEGORIES[key].emoji} ${CATEGORIES[key].label}`}
              active={active === key}
            />
          ))}
        </nav>

        {/* Sommaire : sur téléphone, il évite de faire défiler toute la page */}
        <div className="mt-6 flex flex-wrap gap-2">
          {groups.map((group) => (
            <a
              key={group.family}
              href={`#${group.family}`}
              className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/60 transition hover:border-brand-400/40 hover:text-white"
            >
              {group.label}
              <span className="ml-1.5 text-white/35">{group.exercises.length}</span>
            </a>
          ))}
        </div>

        <div className="mt-12 space-y-14">
          {groups.map((group) => (
            <section key={group.family} id={group.family} className="scroll-mt-20">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h2 className="text-2xl font-extrabold text-white">
                  <span className="mr-2" aria-hidden>
                    {group.emoji}
                  </span>
                  {group.label}
                </h2>
                <span className="text-sm text-white/40">
                  {group.exercises.length} variante{group.exercises.length > 1 ? "s" : ""}
                </span>
              </div>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/55">{group.blurb}</p>

              {group.exercises.length > 1 && (
                <p className="mt-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-300">
                  <span aria-hidden>→</span> De la plus facile à la plus difficile
                </p>
              )}

              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.exercises.map((exercise, index) => (
                  <ExerciseCard
                    key={exercise.slug}
                    exercise={exercise}
                    step={group.exercises.length > 1 ? index + 1 : undefined}
                    total={group.exercises.length}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </Container>

      <section className="bg-ink-900 py-16">
        <Container className="text-center">
          <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
            Les exercices, c&apos;est bien. Un programme, c&apos;est mieux.
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-white/55">
            Savoir faire un squat ne suffit pas : il faut savoir combien, à quel rythme, et quand
            augmenter. C&apos;est le rôle des programmes.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button href="/seance-decouverte" size="lg">
              Faire la séance offerte
            </Button>
            <Button href="/inscription" size="lg" variant="secondary">
              Voir les programmes
            </Button>
          </div>
        </Container>
      </section>
    </div>
  );
}

function ExerciseCard({
  exercise,
  step,
  total,
}: {
  exercise: Exercise;
  step?: number;
  total: number;
}) {
  return (
    <Link
      href={`/exercices/${exercise.slug}`}
      className="group rounded-3xl border border-white/10 p-5 transition hover:border-brand-400/50 hover:bg-white/[0.03]"
    >
      <div className="relative rounded-2xl bg-white/5 py-2">
        <Figure pose={keyPoseOf(exercise)} className="h-36 w-full" />
        {step && (
          <span className="absolute left-3 top-3 rounded-full bg-ink-950/80 px-2 py-0.5 text-[0.7rem] font-bold text-brand-300 tabular-nums">
            {step}/{total}
          </span>
        )}
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <h3 className="font-bold text-white">{exercise.name}</h3>
        <span className="shrink-0 rounded-full bg-white/8 px-2 py-0.5 text-[0.7rem] font-semibold text-white/60">
          {LEVEL_LABELS[exercise.level]}
        </span>
      </div>
      <p className="mt-1 text-xs text-white/50">{exercise.muscles.join(" · ")}</p>
    </Link>
  );
}

function FilterLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
        active ? "bg-brand-400 text-ink-950" : "bg-white/5 text-white/70 hover:bg-white/10"
      }`}
    >
      {label}
    </Link>
  );
}
