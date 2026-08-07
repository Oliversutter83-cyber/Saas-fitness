import Link from "next/link";
import type { Metadata } from "next";
import { Figure } from "@/components/Figure";
import { Button, Container, Logo } from "@/components/ui";
import { CATEGORIES, EXERCISES, keyPoseOf, type Category } from "@/content/exercises";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Tous les exercices à faire à la maison",
  description:
    "La bibliothèque complète des exercices sans matériel : chaque mouvement est décomposé en étapes illustrées, avec les points de technique et les erreurs à éviter.",
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
        <h1 className="text-4xl font-extrabold tracking-tight text-white">
          {EXERCISES.length} exercices, expliqués étape par étape
        </h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-white/55">
          Tous réalisables chez vous. Aucun matériel, hors une chaise et un mur. Chaque fiche montre
          le mouvement en carrousel, les consignes qui protègent le dos et les genoux, et les erreurs
          classiques.
        </p>

        <nav className="mt-8 flex flex-wrap gap-2">
          <FilterLink href="/exercices" label="Tous" active={!active} />
          {(Object.keys(CATEGORIES) as Category[]).map((key) => (
            <FilterLink
              key={key}
              href={`/exercices?categorie=${key}`}
              label={`${CATEGORIES[key].emoji} ${CATEGORIES[key].label}`}
              active={active === key}
            />
          ))}
        </nav>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((exercise) => (
            <Link
              key={exercise.slug}
              href={`/exercices/${exercise.slug}`}
              className="group rounded-3xl border border-white/10 p-5 transition hover:border-brand-400 hover:shadow-sm"
            >
              <div className="rounded-2xl bg-white/5 py-2">
                <Figure
                  pose={keyPoseOf(exercise)}
                  className="h-36 w-full"
                />
              </div>
              <div className="mt-4 flex items-start justify-between gap-3">
                <h2 className="font-bold text-white">{exercise.name}</h2>
                <span className="shrink-0 rounded-full bg-white/5 px-2 py-0.5 text-[0.7rem] font-semibold text-white/55">
                  {LEVEL_LABELS[exercise.level]}
                </span>
              </div>
              <p className="mt-1 text-xs text-white/55">{exercise.muscles.join(" · ")}</p>
            </Link>
          ))}
        </div>
      </Container>

      <section className="bg-ink-950 py-16">
        <Container className="text-center">
          <h2 className="text-3xl font-extrabold text-white">
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
        active ? "bg-white/10 text-white" : "bg-white/5 text-white/70 hover:bg-white/10"
      }`}
    >
      {label}
    </Link>
  );
}
