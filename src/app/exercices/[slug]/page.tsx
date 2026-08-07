import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ExerciseCarousel } from "@/components/ExerciseCarousel";
import { Badge, Button, Container, Logo } from "@/components/ui";
import { CATEGORIES, EXERCISES, EXERCISE_BY_SLUG } from "@/content/exercises";
import { getCurrentUser } from "@/lib/auth";

export function generateStaticParams() {
  return EXERCISES.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const exercise = EXERCISE_BY_SLUG.get((await params).slug);
  if (!exercise) return { title: "Exercice introuvable" };
  return {
    title: `${exercise.name} : technique, étapes et erreurs à éviter`,
    description: `Comment faire ${exercise.name.toLowerCase()} à la maison : ${exercise.steps.length} étapes illustrées, les muscles travaillés (${exercise.muscles.join(", ")}) et les erreurs à ne pas commettre.`,
  };
}

const EQUIPMENT_LABELS = {
  aucun: "Aucun matériel",
  chaise: "Une chaise",
  mur: "Un mur",
};

export default async function ExercicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const exercise = EXERCISE_BY_SLUG.get(slug);
  if (!exercise) notFound();

  const user = await getCurrentUser();
  const related = EXERCISES.filter(
    (e) => e.category === exercise.category && e.slug !== exercise.slug,
  ).slice(0, 4);

  const variants = [
    exercise.easier ? { label: "Version plus facile", slug: exercise.easier } : null,
    exercise.harder ? { label: "Version plus dure", slug: exercise.harder } : null,
  ].filter((v): v is { label: string; slug: string } => v !== null);

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

      <Container className="py-10">
        <Link href="/exercices" className="text-sm font-semibold text-white/55 hover:underline">
          ← Tous les exercices
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge>{CATEGORIES[exercise.category].label}</Badge>
              <Badge tone="neutral">{EQUIPMENT_LABELS[exercise.equipment]}</Badge>
              <Badge tone="neutral">
                {exercise.mode === "reps" ? "En répétitions" : "En durée"}
              </Badge>
            </div>

            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white">
              {exercise.name}
            </h1>
            <p className="mt-2 text-white/55">Muscles sollicités : {exercise.muscles.join(", ")}</p>

            <div className="mt-8 space-y-6">
              <Panel title="Les points clés" tone="brand">
                <ul className="space-y-1.5">
                  {exercise.cues.map((c) => (
                    <li key={c}>✓ {c}</li>
                  ))}
                </ul>
              </Panel>

              <Panel title="Les erreurs à éviter" tone="red">
                <ul className="space-y-1.5">
                  {exercise.mistakes.map((c) => (
                    <li key={c}>✕ {c}</li>
                  ))}
                </ul>
              </Panel>

              <Panel title="Respiration" tone="neutral">
                <p>{exercise.breathing}</p>
              </Panel>
            </div>

            {variants.length > 0 && (
              <div className="mt-8">
                <h2 className="text-sm font-bold uppercase tracking-wide text-white/55">
                  Adapter la difficulté
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {variants.map((v) => {
                    const target = EXERCISE_BY_SLUG.get(v.slug);
                    if (!target) return null;
                    return (
                      <Link
                        key={v.slug}
                        href={`/exercices/${v.slug}`}
                        className="rounded-2xl border border-white/10 px-4 py-3 text-sm transition hover:border-brand-400"
                      >
                        <span className="block text-xs text-white/55">{v.label}</span>
                        <span className="font-bold text-white">{target.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="lg:sticky lg:top-8 lg:self-start">
            <div className="rounded-3xl border border-white/10 p-6">
              <h2 className="text-sm font-bold uppercase tracking-wide text-white/55">
                Le mouvement, étape par étape
              </h2>
              <ExerciseCarousel exercise={exercise} className="mt-4" />
            </div>

            <div className="mt-6 rounded-3xl border border-brand-400/30 bg-brand-400/[0.06] p-7 text-white">
              <p className="font-bold">Intégrez-le à un vrai programme</p>
              <p className="mt-1 text-sm text-white/55">
                Cet exercice fait partie de séances complètes, avec le nombre de séries, les temps de
                repos et une progression sur 4 semaines.
              </p>
              <Button href="/inscription" className="mt-5">
                Commencer l&apos;essai gratuit
              </Button>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-xl font-extrabold text-white">Dans la même catégorie</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((e) => (
                <Link
                  key={e.slug}
                  href={`/exercices/${e.slug}`}
                  className="rounded-2xl border border-white/10 px-5 py-4 font-bold text-white transition hover:border-brand-400"
                >
                  {e.name}
                </Link>
              ))}
            </div>
          </section>
        )}
      </Container>
    </div>
  );
}

function Panel({
  title,
  tone,
  children,
}: {
  title: string;
  tone: "brand" | "red" | "neutral";
  children: React.ReactNode;
}) {
  const tones = {
    brand: "bg-white/5 text-brand-100",
    red: "bg-red-500/10 text-red-200",
    neutral: "bg-white/5 text-white/80",
  };
  return (
    <div className={`rounded-2xl p-5 ${tones[tone]}`}>
      <h2 className="text-sm font-bold uppercase tracking-wide">{title}</h2>
      <div className="mt-2 text-sm leading-relaxed">{children}</div>
    </div>
  );
}
