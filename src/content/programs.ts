import { getExercise } from "@/content/exercises";

/**
 * Programmes d'entraînement.
 *
 * Les séances ne sont pas écrites une par une : on décrit un modèle de séance
 * par jour de la semaine, puis on applique une progression de volume semaine
 * après semaine (plus de tours, plus de répétitions, moins de repos). C'est la
 * façon dont un coach construit réellement un cycle, et ça garantit une
 * progression cohérente sur les 4 semaines.
 */

export type Item = {
  exercise: string;
  reps?: number;
  seconds?: number;
  restSec: number;
  /** Consigne propre à cette séance, en plus des conseils de l'exercice */
  note?: string;
};

export type Block = {
  kind: "echauffement" | "circuit" | "etirements";
  title: string;
  rounds: number;
  restBetweenRoundsSec: number;
  items: Item[];
};

export type Session = {
  week: number;
  day: number;
  title: string;
  focus: string;
  estimatedMin: number;
  blocks: Block[];
};

export type Program = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  goal: "forme" | "perte-de-poids" | "muscle" | "fessiers";
  level: "debutant" | "intermediaire" | "avance";
  weeks: number;
  daysPerWeek: number;
  minutesPerSession: number;
  equipment: string[];
  color: string;
  sessions: Session[];
};

// --------------------------------------------------------------------------
// Progression sur 4 semaines
// --------------------------------------------------------------------------

const WEEK_PLAN = [
  { rounds: 2, volume: 1.0, rest: 45, label: "Prise en main" },
  { rounds: 3, volume: 1.0, rest: 40, label: "Montée en volume" },
  { rounds: 3, volume: 1.2, rest: 35, label: "Intensification" },
  { rounds: 4, volume: 1.2, rest: 30, label: "Semaine record" },
];

type DayTemplate = {
  title: string;
  focus: string;
  warmup: { exercise: string; seconds: number }[];
  main: { exercise: string; reps?: number; seconds?: number; note?: string }[];
  cooldown: { exercise: string; seconds: number }[];
};

function scale(value: number, factor: number, step: number) {
  return Math.max(step, Math.round((value * factor) / step) * step);
}

function buildSessions(days: DayTemplate[], weeks: number): Session[] {
  const sessions: Session[] = [];

  for (let w = 0; w < weeks; w++) {
    const plan = WEEK_PLAN[Math.min(w, WEEK_PLAN.length - 1)];

    days.forEach((day, dIndex) => {
      const blocks: Block[] = [
        {
          kind: "echauffement",
          title: "Échauffement",
          rounds: 1,
          restBetweenRoundsSec: 20,
          items: day.warmup.map((item) => ({
            exercise: item.exercise,
            seconds: item.seconds,
            restSec: 10,
          })),
        },
        {
          kind: "circuit",
          title: `Circuit principal — ${plan.rounds} tours`,
          rounds: plan.rounds,
          restBetweenRoundsSec: plan.rest + 15,
          items: day.main.map((item) => ({
            exercise: item.exercise,
            reps: item.reps ? scale(item.reps, plan.volume, 2) : undefined,
            seconds: item.seconds ? scale(item.seconds, plan.volume, 5) : undefined,
            restSec: plan.rest,
            note: item.note,
          })),
        },
        {
          kind: "etirements",
          title: "Retour au calme",
          rounds: 1,
          restBetweenRoundsSec: 0,
          items: day.cooldown.map((item) => ({
            exercise: item.exercise,
            seconds: item.seconds,
            restSec: 5,
          })),
        },
      ];

      sessions.push({
        week: w + 1,
        day: dIndex + 1,
        title: day.title,
        focus: day.focus,
        estimatedMin: estimateMinutes(blocks),
        blocks,
      });
    });
  }

  return sessions;
}

/** Durée d'un exercice quand il est compté en répétitions (≈3 s par rep). */
const SECONDS_PER_REP = 3;

export function itemDurationSec(item: Item) {
  return item.seconds ?? (item.reps ?? 0) * SECONDS_PER_REP;
}

export function estimateMinutes(blocks: Block[]) {
  let total = 0;
  for (const block of blocks) {
    const perRound = block.items.reduce(
      (sum, item) => sum + itemDurationSec(item) + item.restSec,
      0,
    );
    total += perRound * block.rounds + block.restBetweenRoundsSec * (block.rounds - 1);
  }
  return Math.max(1, Math.round(total / 60));
}

// --------------------------------------------------------------------------
// Les programmes
// --------------------------------------------------------------------------

const fullBodyDays: DayTemplate[] = [
  {
    title: "Bas du corps",
    focus: "Jambes, fessiers et gainage",
    warmup: [
      { exercise: "jack-sans-saut", seconds: 40 },
      { exercise: "chat-vache", seconds: 40 },
      { exercise: "cercles-epaules", seconds: 30 },
    ],
    main: [
      { exercise: "squat", reps: 12, note: "Prenez 3 secondes pour descendre." },
      { exercise: "fente-arriere", reps: 10, note: "10 répétitions par jambe." },
      { exercise: "pont-fessier", reps: 14 },
      { exercise: "chaise-mur", seconds: 30 },
      { exercise: "planche-genoux", seconds: 25 },
    ],
    cooldown: [
      { exercise: "etirement-quadriceps", seconds: 40 },
      { exercise: "etirement-ischios", seconds: 40 },
      { exercise: "posture-enfant", seconds: 45 },
    ],
  },
  {
    title: "Haut du corps",
    focus: "Pectoraux, bras, dos et abdos",
    warmup: [
      { exercise: "jack-sans-saut", seconds: 40 },
      { exercise: "cercles-epaules", seconds: 35 },
      { exercise: "chat-vache", seconds: 40 },
    ],
    main: [
      { exercise: "pompes-murales", reps: 12, note: "Reculez les pieds de deux centimètres dès que 12 deviennent faciles." },
      { exercise: "dips-sol", reps: 10 },
      { exercise: "superman-alterne", reps: 12, note: "12 par côté." },
      { exercise: "chien-oiseau", seconds: 30, note: "15 secondes de chaque côté." },
      { exercise: "crunch", reps: 14 },
    ],
    cooldown: [
      { exercise: "etirement-pectoraux", seconds: 40 },
      { exercise: "chat-vache", seconds: 40 },
      { exercise: "posture-enfant", seconds: 45 },
    ],
  },
  {
    title: "Corps entier",
    focus: "Circuit complet, rythme soutenu",
    warmup: [
      { exercise: "jack-sans-saut", seconds: 45 },
      { exercise: "genoux-croises", seconds: 30 },
      { exercise: "chat-vache", seconds: 30 },
    ],
    main: [
      { exercise: "squat", reps: 12 },
      { exercise: "pompes-genoux", reps: 10 },
      { exercise: "pont-fessier", reps: 14 },
      { exercise: "marche-pointes", seconds: 30 },
      { exercise: "planche-genoux", seconds: 25 },
    ],
    cooldown: [
      { exercise: "etirement-mollets", seconds: 40 },
      { exercise: "etirement-ischios", seconds: 40 },
      { exercise: "posture-enfant", seconds: 45 },
    ],
  },
];

const hiitDays: DayTemplate[] = [
  {
    title: "HIIT corps entier",
    focus: "Dépense maximale en 20 minutes",
    warmup: [
      { exercise: "jumping-jack", seconds: 45 },
      { exercise: "montees-genoux", seconds: 30 },
      { exercise: "chat-vache", seconds: 30 },
    ],
    main: [
      { exercise: "burpee", reps: 8, note: "Enlevez le saut si le rythme s'effondre." },
      { exercise: "squat-saute", reps: 10 },
      { exercise: "grimpeur", seconds: 30 },
      { exercise: "pompes", reps: 10, note: "Sur les genoux dès que la forme se dégrade." },
      { exercise: "corde-a-sauter", seconds: 40 },
    ],
    cooldown: [
      { exercise: "etirement-quadriceps", seconds: 40 },
      { exercise: "etirement-mollets", seconds: 40 },
      { exercise: "posture-enfant", seconds: 45 },
    ],
  },
  {
    title: "Cardio & jambes",
    focus: "Bas du corps sous rythme cardio",
    warmup: [
      { exercise: "jumping-jack", seconds: 45 },
      { exercise: "talons-fesses", seconds: 30 },
      { exercise: "cercles-epaules", seconds: 30 },
    ],
    main: [
      { exercise: "squat-jack", seconds: 35 },
      { exercise: "fente-laterale", reps: 10, note: "10 par jambe." },
      { exercise: "patineur", seconds: 30 },
      { exercise: "squat-sumo", reps: 16 },
      { exercise: "chaise-mur", seconds: 35 },
    ],
    cooldown: [
      { exercise: "etirement-ischios", seconds: 45 },
      { exercise: "etirement-quadriceps", seconds: 40 },
    ],
  },
  {
    title: "HIIT haut du corps",
    focus: "Bras, épaules et cardio",
    warmup: [
      { exercise: "jumping-jack", seconds: 45 },
      { exercise: "boxe-sur-place", seconds: 40 },
      { exercise: "chat-vache", seconds: 30 },
    ],
    main: [
      { exercise: "pompes", reps: 8 },
      { exercise: "dips-chaise", reps: 10 },
      { exercise: "planche-touche-epaule", reps: 12, note: "12 touches au total, 6 par bras." },
      { exercise: "nage-dos", seconds: 30 },
      { exercise: "corde-a-sauter", seconds: 40 },
    ],
    cooldown: [
      { exercise: "etirement-pectoraux", seconds: 40 },
      { exercise: "posture-enfant", seconds: 50 },
    ],
  },
  {
    title: "Abdos & finisher",
    focus: "Ceinture abdominale et cardio final",
    warmup: [
      { exercise: "jumping-jack", seconds: 40 },
      { exercise: "genoux-croises", seconds: 30 },
      { exercise: "chat-vache", seconds: 40 },
    ],
    main: [
      { exercise: "crunch-velo", reps: 16, note: "16 au total, 8 par côté." },
      { exercise: "releve-jambes", reps: 12 },
      { exercise: "ciseaux", seconds: 30 },
      { exercise: "planche", seconds: 35 },
      { exercise: "burpee", reps: 8 },
    ],
    cooldown: [
      { exercise: "rotation-thoracique", seconds: 40 },
      { exercise: "posture-enfant", seconds: 50 },
    ],
  },
];

const glutesDays: DayTemplate[] = [
  {
    title: "Fessiers — volume",
    focus: "Muscler et galber les fessiers",
    warmup: [
      { exercise: "jack-sans-saut", seconds: 40 },
      { exercise: "fire-hydrant", seconds: 35 },
      { exercise: "chat-vache", seconds: 40 },
    ],
    main: [
      { exercise: "hip-thrust", reps: 14, note: "2 secondes de contraction en haut." },
      { exercise: "pont-une-jambe", reps: 10, note: "10 par jambe." },
      { exercise: "squat-sumo", reps: 15 },
      { exercise: "fente-croisee", reps: 10, note: "10 par jambe." },
      { exercise: "donkey-kick", reps: 14, note: "14 par jambe." },
    ],
    cooldown: [
      { exercise: "etirement-fessier", seconds: 45 },
      { exercise: "etirement-ischios", seconds: 45 },
      { exercise: "posture-enfant", seconds: 45 },
    ],
  },
  {
    title: "Cuisses & mollets",
    focus: "Quadriceps, ischios et mollets",
    warmup: [
      { exercise: "genoux-croises", seconds: 35 },
      { exercise: "chat-vache", seconds: 35 },
      { exercise: "marche-pointes", seconds: 30 },
    ],
    main: [
      { exercise: "squat-tempo", reps: 10, note: "Quatre temps pour descendre, deux pour remonter." },
      { exercise: "fente-avant", reps: 10, note: "10 par jambe." },
      { exercise: "chaise-mur", seconds: 45 },
      { exercise: "mollets-une-jambe", reps: 12, note: "12 par jambe." },
      { exercise: "planche-genoux", seconds: 30 },
    ],
    cooldown: [
      { exercise: "etirement-quadriceps", seconds: 45 },
      { exercise: "etirement-mollets", seconds: 45 },
    ],
  },
  {
    title: "Fessiers — unilatéral",
    focus: "Travail jambe par jambe, sans déséquilibre",
    warmup: [
      { exercise: "jack-sans-saut", seconds: 40 },
      { exercise: "pont-fessier", seconds: 35 },
      { exercise: "fire-hydrant", seconds: 30 },
    ],
    main: [
      { exercise: "fente-bulgare", reps: 8, note: "8 par jambe. Appuyez-vous au mur si besoin." },
      { exercise: "pont-une-jambe", reps: 12, note: "12 par jambe." },
      { exercise: "fente-laterale", reps: 10, note: "10 par jambe." },
      { exercise: "donkey-kick", reps: 14, note: "14 par jambe." },
      { exercise: "planche-laterale", seconds: 20, note: "20 secondes de chaque côté." },
    ],
    cooldown: [
      { exercise: "etirement-fessier", seconds: 45 },
      { exercise: "etirement-quadriceps", seconds: 45 },
    ],
  },
];

const upperDays: DayTemplate[] = [
  {
    title: "Pectoraux & triceps",
    focus: "Poussée : poitrine, triceps, épaules",
    warmup: [
      { exercise: "jumping-jack", seconds: 40 },
      { exercise: "cercles-epaules", seconds: 35 },
      { exercise: "pompes-inclinees", seconds: 30 },
    ],
    main: [
      { exercise: "pompes", reps: 8 },
      { exercise: "pompes-larges", reps: 10 },
      { exercise: "dips-chaise", reps: 10 },
      { exercise: "pompes-diamant", reps: 6, note: "Sur les genoux si les coudes s'ouvrent." },
      { exercise: "planche-bras-tendus", seconds: 30 },
    ],
    cooldown: [
      { exercise: "etirement-pectoraux", seconds: 40 },
      { exercise: "chat-vache", seconds: 40 },
      { exercise: "posture-enfant", seconds: 45 },
    ],
  },
  {
    title: "Dos & abdos",
    focus: "Chaîne postérieure et ceinture abdominale",
    warmup: [
      { exercise: "jumping-jack", seconds: 40 },
      { exercise: "chat-vache", seconds: 45 },
      { exercise: "rotation-thoracique", seconds: 30 },
    ],
    main: [
      { exercise: "nage-dos", seconds: 30 },
      { exercise: "superman", reps: 14 },
      { exercise: "dead-bug", reps: 10, note: "10 par côté." },
      { exercise: "sit-up", reps: 12 },
      { exercise: "hollow-hold", seconds: 20 },
    ],
    cooldown: [
      { exercise: "rotation-thoracique", seconds: 40 },
      { exercise: "posture-enfant", seconds: 50 },
    ],
  },
  {
    title: "Haut du corps complet",
    focus: "Tout le haut du corps en circuit",
    warmup: [
      { exercise: "jumping-jack", seconds: 45 },
      { exercise: "boxe-sur-place", seconds: 40 },
      { exercise: "cercles-epaules", seconds: 30 },
    ],
    main: [
      { exercise: "pompes-lentes", reps: 6, note: "Six lentes valent quinze rapides." },
      { exercise: "dips-jambes-tendues", reps: 8, note: "Genoux pliés si les épaules tirent." },
      { exercise: "pompes-piquees", reps: 6 },
      { exercise: "planche-dynamique", reps: 10 },
      { exercise: "rotation-russe", reps: 16, note: "16 au total, 8 par côté." },
    ],
    cooldown: [
      { exercise: "etirement-pectoraux", seconds: 40 },
      { exercise: "chat-vache", seconds: 40 },
      { exercise: "posture-enfant", seconds: 50 },
    ],
  },
];

export const PROGRAMS: Program[] = [
  {
    slug: "demarrage-full-body",
    name: "Démarrage Full Body",
    tagline: "4 semaines pour installer l'habitude",
    description:
      "Le programme à faire si vous repartez de zéro ou après une longue pause. Trois séances par semaine, tout le corps, une progression douce mais réelle. Aucun saut, aucun bruit, pas même une chaise : conçu pour un appartement et des voisins en dessous.",
    goal: "forme",
    level: "debutant",
    weeks: 4,
    daysPerWeek: 3,
    minutesPerSession: 25,
    equipment: ["Un mur", "De quoi s'allonger"],
    color: "emerald",
    sessions: buildSessions(fullBodyDays, 4),
  },
  {
    slug: "brule-graisses-hiit",
    name: "Brûle-graisses HIIT",
    tagline: "4 séances par semaine, 20 minutes chrono",
    description:
      "Des circuits courts et intenses pour augmenter la dépense énergétique et améliorer le souffle. Fait pour les emplois du temps serrés : c'est court, mais il faut y aller.",
    goal: "perte-de-poids",
    level: "intermediaire",
    weeks: 4,
    daysPerWeek: 4,
    minutesPerSession: 24,
    equipment: ["Une chaise", "Un mur", "De quoi s'allonger"],
    color: "orange",
    sessions: buildSessions(hiitDays, 4),
  },
  {
    slug: "fessiers-jambes",
    name: "Fessiers & Jambes",
    tagline: "Le bas du corps, 3 fois par semaine",
    description:
      "Un cycle centré sur les fessiers, les cuisses et les mollets, avec du travail jambe par jambe pour corriger les déséquilibres. Sans matériel, sans sauts bruyants sur la plupart des séances.",
    goal: "fessiers",
    level: "debutant",
    weeks: 4,
    daysPerWeek: 3,
    minutesPerSession: 24,
    equipment: ["Une chaise", "Un mur", "De quoi s'allonger"],
    color: "violet",
    sessions: buildSessions(glutesDays, 4),
  },
  {
    slug: "haut-du-corps-abdos",
    name: "Haut du corps & Abdos",
    tagline: "Bras, épaules, dos et ceinture abdominale",
    description:
      "Pour construire du muscle sur le haut du corps au poids de corps, avec une vraie progression des pompes et un bloc abdos complet à chaque séance.",
    goal: "muscle",
    level: "intermediaire",
    weeks: 4,
    daysPerWeek: 3,
    minutesPerSession: 23,
    equipment: ["Une chaise", "Un mur", "De quoi s'allonger"],
    color: "sky",
    sessions: buildSessions(upperDays, 4),
  },
];

export const PROGRAM_BY_SLUG = new Map(PROGRAMS.map((p) => [p.slug, p]));

export function getProgram(slug: string): Program | undefined {
  return PROGRAM_BY_SLUG.get(slug);
}

export function getSession(programSlug: string, week: number, day: number): Session | undefined {
  return getProgram(programSlug)?.sessions.find((s) => s.week === week && s.day === day);
}

/** Tous les exercices d'un programme, sans doublon, dans l'ordre d'apparition. */
export function programExerciseSlugs(program: Program): string[] {
  const seen = new Set<string>();
  for (const session of program.sessions) {
    for (const block of session.blocks) {
      for (const item of block.items) seen.add(item.exercise);
    }
  }
  return [...seen];
}

export function weekLabel(week: number) {
  return WEEK_PLAN[Math.min(week - 1, WEEK_PLAN.length - 1)].label;
}

/** Séance offerte : elle sert d'aperçu public depuis la landing page. */
export const FREE_SESSION = { programSlug: "demarrage-full-body", week: 1, day: 1 };

export function isFreeSession(programSlug: string, week: number, day: number) {
  return (
    programSlug === FREE_SESSION.programSlug &&
    week === FREE_SESSION.week &&
    day === FREE_SESSION.day
  );
}

/**
 * Vérifie au démarrage que tous les exercices référencés existent vraiment.
 * Une faute de frappe dans un slug casserait une séance en pleine utilisation :
 * autant s'en apercevoir au build.
 */
for (const program of PROGRAMS) {
  for (const session of program.sessions) {
    for (const block of session.blocks) {
      for (const item of block.items) getExercise(item.exercise);
    }
  }
}
