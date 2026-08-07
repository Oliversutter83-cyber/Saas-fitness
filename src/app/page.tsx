import Link from "next/link";
import { ExerciseCarousel } from "@/components/ExerciseCarousel";
import { Figure } from "@/components/Figure";
import { LeadForm } from "@/components/LeadForm";
import { Badge, Button, Container, Logo, SectionTitle } from "@/components/ui";
import { PLANS, SITE, TRIAL_DAYS } from "@/config";
import { EXERCISES, getExercise, keyPoseOf } from "@/content/exercises";
import { FAQ, FEATURES, HOW_IT_WORKS, PAIN_POINTS, TESTIMONIALS } from "@/content/marketing";
import { FREE_SESSION, PROGRAMS } from "@/content/programs";
import { getCurrentUser } from "@/lib/auth";

const PROGRAM_COLORS: Record<string, string> = {
  emerald: "from-emerald-500/20 to-emerald-500/0 text-emerald-300",
  orange: "from-orange-500/20 to-orange-500/0 text-orange-300",
  violet: "from-violet-500/20 to-violet-500/0 text-violet-300",
  sky: "from-sky-500/20 to-sky-500/0 text-sky-300",
};

export default async function LandingPage() {
  const user = await getCurrentUser();
  const heroExercise = getExercise("squat");
  const showcase = ["pompes", "fente-avant", "planche", "burpee", "pont-fessier", "grimpeur"].map(
    getExercise,
  );

  return (
    <div className="bg-ink-950">
      {/* ------------------------------------------------------------ NAV */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-ink-950/85 backdrop-blur">
        <Container className="flex h-16 items-center justify-between">
          <Logo />
          <nav className="hidden items-center gap-7 text-sm font-medium text-white/60 md:flex">
            <a href="#methode" className="transition hover:text-white">
              La méthode
            </a>
            <a href="#programmes" className="transition hover:text-white">
              Programmes
            </a>
            <a href="#tarifs" className="transition hover:text-white">
              Tarifs
            </a>
            <a href="#faq" className="transition hover:text-white">
              Questions
            </a>
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <Button href="/app" size="md">
                Mon espace
              </Button>
            ) : (
              <>
                <Link
                  href="/connexion"
                  className="hidden rounded-full px-4 py-2 text-sm font-semibold text-white/70 transition hover:text-white sm:block"
                >
                  Connexion
                </Link>
                <Button href="/inscription">Commencer</Button>
              </>
            )}
          </div>
        </Container>
      </header>

      {/* ----------------------------------------------------------- HERO */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute -top-40 left-1/2 h-[36rem] w-[52rem] -translate-x-1/2 rounded-full bg-brand-500/12 blur-[120px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -top-20 right-0 h-[26rem] w-[26rem] rounded-full bg-ember-700/25 blur-[130px]"
          aria-hidden
        />
        <Container className="relative grid items-center gap-14 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div className="animate-rise">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-400/25 bg-brand-400/10 px-3 py-1.5 text-xs font-bold text-brand-300">
              ● {TRIAL_DAYS} jours d&apos;essai — sans engagement
            </span>

            <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Votre salon devient
              <br />
              <span className="text-brand-300">votre salle de sport.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/65">
              Des programmes de 4 semaines à faire chez vous, sans matériel, en 25 minutes. Chaque
              exercice est expliqué étape par étape en carrousel&nbsp;: vous savez exactement quoi
              faire, et surtout comment le faire sans vous blesser.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="/inscription" size="lg">
                Démarrer mes {TRIAL_DAYS} jours d&apos;essai
              </Button>
              <Button href="/seance-decouverte" size="lg" variant="secondary">
                Essayer une séance gratuite
              </Button>
            </div>

            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/50">
              {["Aucun matériel", "25 min par séance", "Résiliable en 2 clics", "Sur téléphone"].map(
                (item) => (
                  <li key={item} className="flex items-center gap-1.5">
                    <span className="text-brand-400">✓</span> {item}
                  </li>
                ),
              )}
            </ul>
          </div>

          {/* Aperçu produit : un vrai carrousel interactif, pas une capture */}
          <div className="animate-rise">
            <div className="mx-auto w-full max-w-sm rounded-[2rem] border border-white/10 bg-white/5 p-3 shadow-2xl shadow-black/40">
              <div className="rounded-[1.6rem] bg-ink-900 p-5 ring-1 ring-white/10">
                <div className="flex items-center justify-between">
                  <Badge tone="neutral">Séance 1 · Bas du corps</Badge>
                  <span className="text-xs font-bold text-white/50 tabular-nums">02:14</span>
                </div>
                <h2 className="mt-3 text-xl font-extrabold text-white">{heroExercise.name}</h2>
                <ExerciseCarousel exercise={heroExercise} compact className="mt-3" />
              </div>
              <p className="px-4 py-3 text-center text-xs font-medium text-white/40">
                Faites glisser — c&apos;est exactement l&apos;écran de l&apos;abonné
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* -------------------------------------------------------- DOULEURS */}
      <section className="border-y border-white/5 bg-ink-900 py-20">
        <Container>
          <SectionTitle
            eyebrow="Le vrai problème"
            title="Ce n'est pas la motivation qui manque"
            subtitle="C'est un cadre. Voici ce qui bloque presque tout le monde, et ce qu'on y change."
          />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {PAIN_POINTS.map((p) => (
              <div
                key={p.title}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 transition hover:border-brand-400/30"
              >
                <span className="text-3xl" aria-hidden>
                  {p.icon}
                </span>
                <h3 className="mt-4 text-lg font-bold text-white">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{p.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* --------------------------------------------------------- MÉTHODE */}
      <section id="methode" className="relative bg-ink-900 py-24">
        <Container>
          <SectionTitle
            eyebrow="La méthode"
            title="Trois étapes, et vous vous entraînez"
            subtitle="Pas de coach à contacter, pas de créneau à réserver. Vous ouvrez, vous suivez, vous cochez."
          />

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {HOW_IT_WORKS.map((s) => (
              <div key={s.step} className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 transition hover:border-brand-400/40">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-ink-900 text-base font-extrabold text-brand-300">
                  {s.step}
                </span>
                <h3 className="mt-5 text-lg font-bold text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{s.text}</p>
              </div>
            ))}
          </div>

          {/* Démonstration du carrousel sur un exercice complet */}
          <div className="mt-20 grid items-center gap-12 rounded-3xl border border-white/10 bg-ink-950 p-8 lg:grid-cols-2 lg:p-14">
            <div>
              <Badge tone="dark">Le cœur du produit</Badge>
              <h3 className="mt-5 text-3xl font-extrabold tracking-tight text-white">
                Chaque mouvement, décomposé
              </h3>
              <p className="mt-4 leading-relaxed text-white/60">
                Position de départ, descente, remontée&nbsp;: vous faites défiler les étapes à votre
                rythme, ou vous appuyez sur «&nbsp;Animer&nbsp;» pour voir le geste s&apos;enchaîner.
                Sous le carrousel, les points de technique et les erreurs qui font mal.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Les consignes qui protègent le dos et les genoux",
                  "Les erreurs classiques, listées pour chaque exercice",
                  "Une version plus facile et une version plus dure",
                ].map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-white/75">
                    <span className="text-brand-400">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Button href="/exercices" variant="secondary" className="mt-8">
                Voir les {EXERCISES.length} exercices
              </Button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h4 className="text-lg font-extrabold text-white">{getExercise("pompes").name}</h4>
              <ExerciseCarousel exercise={getExercise("pompes")} className="mt-3" />
              <div className="mt-4 grid gap-3 border-t border-white/10 pt-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-brand-300">
                    À faire
                  </p>
                  <ul className="mt-1.5 space-y-1 text-xs text-white/55">
                    {getExercise("pompes").cues.slice(0, 2).map((c) => (
                      <li key={c}>• {c}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-red-400">À éviter</p>
                  <ul className="mt-1.5 space-y-1 text-xs text-white/55">
                    {getExercise("pompes").mistakes.slice(0, 2).map((c) => (
                      <li key={c}>• {c}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Vitrine d'exercices */}
          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {showcase.map((ex) => (
              <Link
                key={ex.slug}
                href={`/exercices/${ex.slug}`}
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-3 transition hover:border-brand-400/50 hover:bg-white/[0.06]"
              >
                <Figure pose={keyPoseOf(ex)} className="h-24 w-full" />
                <p className="mt-1 text-center text-xs font-bold text-white/70 group-hover:text-white">
                  {ex.name}
                </p>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------------ PROGRAMMES */}
      <section id="programmes" className="bg-ink-900 py-24">
        <Container>
          <SectionTitle
            eyebrow="Les programmes"
            title="Quatre cycles de 4 semaines"
            subtitle="Chacun avec sa progression : plus de tours, plus de répétitions, moins de repos, semaine après semaine."
          />

          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {PROGRAMS.map((program) => (
              <div
                key={program.slug}
                className={`relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br p-8 ${
                  PROGRAM_COLORS[program.color] ?? PROGRAM_COLORS.emerald
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-extrabold text-white">{program.name}</h3>
                    <p className="mt-1 text-sm font-semibold">{program.tagline}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/80">
                    {program.level === "debutant" ? "Débutant" : "Intermédiaire"}
                  </span>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-white/60">{program.description}</p>

                <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-white/10 pt-5 text-white">
                  {[
                    [program.sessions.length, "séances"],
                    [`${program.daysPerWeek}×`, "par semaine"],
                    [`${program.minutesPerSession} min`, "par séance"],
                  ].map(([value, label]) => (
                    <div key={label as string}>
                      <dt className="text-xl font-extrabold">{value}</dt>
                      <dd className="text-xs text-white/45">{label}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* --------------------------------------------------- CE QUI EST INCLUS */}
      <section className="bg-ink-900 py-24">
        <Container>
          <SectionTitle
            eyebrow="Inclus dans l'abonnement"
            title="Tout ce qu'il faut, rien de plus"
          />
          <div className="mt-14 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="border-t-2 border-brand-400/60 pt-5">
                <h3 className="font-bold text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{f.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------------ TÉMOIGNAGES */}
      {TESTIMONIALS.length > 0 && (
        <section className="bg-ink-900 py-24">
          <Container>
            <SectionTitle eyebrow="Ils s'entraînent avec nous" title="Ce que disent les abonnés" />
            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {TESTIMONIALS.map((t) => (
                <figure key={t.name} className="rounded-2xl border border-white/10 bg-white/[0.03] p-7">
                  <blockquote className="text-sm leading-relaxed text-white/75">
                    « {t.quote} »
                  </blockquote>
                  <figcaption className="mt-5 text-sm font-bold text-white">
                    {t.name}
                    <span className="block text-xs font-normal text-white/50">{t.detail}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ----------------------------------------------------------- TARIFS */}
      <section id="tarifs" className="bg-ink-950 py-24">
        <Container>
          <SectionTitle
            eyebrow="Tarifs"
            title="Moins cher qu'une séance de coaching"
            subtitle={`${TRIAL_DAYS} jours d'essai. Vous n'êtes débité qu'à la fin de l'essai, et vous pouvez arrêter avant sans rien payer.`}
          />

          <div className="mx-auto mt-14 grid max-w-3xl gap-6 sm:grid-cols-2">
            {Object.values(PLANS).map((plan) => {
              const isYearly = plan.id === "annuel";
              return (
                <div
                  key={plan.id}
                  className={`relative rounded-3xl p-8 ${
                    isYearly
                      ? "bg-brand-400 text-ink-950 ring-4 ring-brand-400/20"
                      : "border border-white/10 bg-white/[0.03] text-white"
                  }`}
                >
                  {plan.highlight && (
                    <span className="absolute -top-3 left-8 rounded-full bg-ink-950 px-3 py-1 text-xs font-bold text-brand-300">
                      {plan.highlight}
                    </span>
                  )}
                  <h3 className="text-sm font-bold uppercase tracking-wider opacity-70">
                    {plan.name}
                  </h3>
                  <p className="mt-3 flex items-end gap-1.5">
                    <span className="text-5xl font-extrabold tracking-tight">
                      {plan.priceLabel}
                    </span>
                    <span className="pb-2 text-sm opacity-60">{plan.periodLabel}</span>
                  </p>
                  <ul className="mt-6 space-y-2 text-sm">
                    {[
                      "Les 4 programmes complets",
                      `${EXERCISES.length} exercices illustrés`,
                      "Minuteur et suivi de progression",
                      ...plan.perks,
                    ].map((perk) => (
                      <li key={perk} className="flex gap-2">
                        <span className={isYearly ? "text-ink-950" : "text-brand-400"}>✓</span>
                        <span className={isYearly ? "" : "text-white/70"}>{perk}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    href={`/inscription?offre=${plan.id}`}
                    size="lg"
                    variant={isYearly ? "dark" : "primary"}
                    className="mt-8 w-full"
                  >
                    Commencer l&apos;essai
                  </Button>
                </div>
              );
            })}
          </div>

          <p className="mt-8 text-center text-sm text-white/40">
            Paiement sécurisé par Stripe · Aucune donnée bancaire ne transite par nos serveurs
          </p>
        </Container>
      </section>

      {/* -------------------------------------------------------------- FAQ */}
      <section id="faq" className="bg-ink-900 py-24">
        <Container>
          <SectionTitle eyebrow="Questions fréquentes" title="Vous vous demandez sûrement…" />
          <div className="mx-auto mt-12 max-w-2xl divide-y divide-white/10">
            {FAQ.map((item) => (
              <details key={item.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-white">
                  {item.q}
                  <span
                    className="shrink-0 text-xl text-brand-400 transition group-open:rotate-45"
                    aria-hidden
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-white/60">{item.a}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      {/* -------------------------------------------------------- CTA FINAL */}
      <section className="relative overflow-hidden bg-ink-900 py-24">
        <div
          className="pointer-events-none absolute bottom-0 left-1/2 h-96 w-[48rem] -translate-x-1/2 rounded-full bg-ember-700/25 blur-[110px]"
          aria-hidden
        />
        <Container className="relative text-center">
          <h2 className="mx-auto max-w-2xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            La première séance est offerte.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-white/60">
            Testez-la maintenant, sans créer de compte. Si ça vous plaît, l&apos;essai de{" "}
            {TRIAL_DAYS} jours vous ouvre les 4 programmes.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Button href="/seance-decouverte" size="lg">
              Faire la séance offerte
            </Button>
            <Button href="/inscription" size="lg" variant="secondary">
              Créer mon compte
            </Button>
          </div>

          <div className="mx-auto mt-16 max-w-lg rounded-3xl border border-white/10 bg-white/[0.03] p-8">
            <p className="font-bold text-white">Pas prêt tout de suite ?</p>
            <p className="mt-1 text-sm text-white/50">
              Laissez votre email, on vous envoie la séance découverte à faire quand vous voulez.
            </p>
            <div className="mt-5">
              <LeadForm />
            </div>
          </div>
        </Container>
      </section>

      {/* ----------------------------------------------------------- FOOTER */}
      <footer className="border-t border-white/5 bg-ink-950 py-14">
        <Container>
          <div className="flex flex-col justify-between gap-8 sm:flex-row">
            <div>
              <Logo />
              <p className="mt-3 max-w-xs text-sm text-white/40">{SITE.tagline}</p>
              <div className="mt-4 flex gap-2">
                <a
                  href={SITE.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/60 transition hover:border-brand-400/40 hover:text-white"
                >
                  Instagram
                </a>
                <a
                  href={SITE.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/60 transition hover:border-brand-400/40 hover:text-white"
                >
                  TikTok
                </a>
              </div>
            </div>
            <nav className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm text-white/50">
              <Link href="/exercices" className="hover:text-white">
                Exercices
              </Link>
              <Link href="/mentions-legales" className="hover:text-white">
                Mentions légales
              </Link>
              <Link href="/seance-decouverte" className="hover:text-white">
                Séance offerte
              </Link>
              <Link href="/cgv" className="hover:text-white">
                CGV
              </Link>
              <Link href="/connexion" className="hover:text-white">
                Connexion
              </Link>
              <Link href="/confidentialite" className="hover:text-white">
                Confidentialité
              </Link>
            </nav>
          </div>

          <p className="mt-12 border-t border-white/5 pt-6 text-xs leading-relaxed text-white/30">
            <strong className="text-white/50">Avertissement santé :</strong> les contenus de{" "}
            {SITE.name} sont fournis à titre informatif et ne remplacent pas un avis médical.
            Demandez l&apos;accord de votre médecin avant de reprendre une activité physique, en
            particulier en cas de problème cardiaque, de blessure, de grossesse ou de traitement en
            cours. Arrêtez immédiatement en cas de douleur.
          </p>
          <p className="mt-4 text-xs text-white/30">
            © {new Date().getFullYear()} {SITE.name}. Séance découverte :{" "}
            <Link href="/seance-decouverte" className="underline">
              programme {FREE_SESSION.programSlug}
            </Link>
            .
          </p>
        </Container>
      </footer>
    </div>
  );
}
