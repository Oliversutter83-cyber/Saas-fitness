import { PROGRAMS, getProgram, type Program } from "@/content/programs";

/**
 * Moteur de plan personnalisé.
 *
 * Il produit toujours un résultat, sans appel externe : c'est lui qui décide du
 * programme, du planning et des objectifs. L'IA (src/lib/ai.ts) ne fait
 * qu'ajouter des commentaires par-dessus — si elle est indisponible, le bilan
 * reste complet et cohérent.
 *
 * Parti pris sur les objectifs : ils portent sur ce qu'un programme peut
 * réellement garantir — des séances faites, des répétitions atteintes, un temps
 * de gainage tenu. Promettre « −4 kg en un mois » serait une promesse qu'aucun
 * programme ne peut tenir, et une allégation de santé que nous ne sommes pas en
 * droit de faire.
 */

export type Profile = {
  age: number;
  heightCm: number;
  weightKg: number;
  goal: "perte-de-poids" | "forme" | "muscle" | "fessiers";
  level: "debutant" | "intermediaire" | "avance";
  daysPerWeek: number;
  constraints?: string;
};

export type Milestone = {
  /** 1 à 4, ou 0 pour l'objectif du mois complet */
  week: number;
  title: string;
  targets: string[];
};

export type DaySlot = {
  day: string;
  kind: "seance" | "repos" | "actif";
  label: string;
};

export type Plan = {
  programSlug: string;
  programName: string;
  why: string;
  sessionsPerWeek: number;
  minutesPerSession: number;
  weeklySchedule: DaySlot[];
  milestones: Milestone[];
  monthGoal: Milestone;
  advice: string[];
  /** Rempli par l'IA quand elle est disponible */
  aiNotes?: string[];
  aiEncouragement?: string;
};

const JOURS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

/** Répartit N séances dans la semaine en évitant deux jours d'affilée. */
function spreadDays(count: number): number[] {
  const n = Math.max(1, Math.min(6, count));
  // 7 jours pour n séances : on prend un pas régulier, ce qui laisse
  // naturellement au moins un jour de repos entre deux séances jusqu'à 3/semaine.
  const step = 7 / n;
  return Array.from({ length: n }, (_, i) => Math.round(i * step) % 7);
}

function pickProgram(profile: Profile): Program {
  const byGoal: Record<Profile["goal"], string> = {
    "perte-de-poids": "brule-graisses-hiit",
    fessiers: "fessiers-jambes",
    muscle: "haut-du-corps-abdos",
    forme: "demarrage-full-body",
  };

  const wanted = getProgram(byGoal[profile.goal]) ?? PROGRAMS[0];

  // Un débutant complet ne commence pas par du HIIT ou du haut du corps
  // avancé : la technique et l'habitude passent avant l'intensité.
  if (profile.level === "debutant" && wanted.level !== "debutant") {
    return getProgram("demarrage-full-body") ?? PROGRAMS[0];
  }
  // Inversement, un pratiquant confirmé qui vise la forme générale s'ennuierait
  // sur le programme de démarrage.
  if (profile.level === "avance" && wanted.slug === "demarrage-full-body") {
    return getProgram("haut-du-corps-abdos") ?? wanted;
  }
  return wanted;
}

function whyThisProgram(program: Program, profile: Profile): string {
  if (profile.level === "debutant" && program.slug === "demarrage-full-body") {
    return "Vous partez de zéro ou de loin : on installe d'abord l'habitude et la technique, avec tout le corps et une progression douce. Les programmes plus intenses viendront après ces 4 semaines.";
  }
  const parGoal: Record<Profile["goal"], string> = {
    "perte-de-poids":
      "Des circuits courts et intenses pour augmenter la dépense énergétique, avec un format qui tient dans un emploi du temps serré.",
    fessiers:
      "Un cycle centré sur le bas du corps, avec du travail jambe par jambe pour corriger les déséquilibres.",
    muscle:
      "Un travail de poussée et de tirage au poids de corps, avec une progression nette des pompes et un bloc abdos à chaque séance.",
    forme:
      "Tout le corps, trois fois par semaine, avec une montée en charge progressive : le meilleur rapport résultat/contrainte pour se remettre en route.",
  };
  return parGoal[profile.goal];
}

function buildSchedule(program: Program, profile: Profile): DaySlot[] {
  // On ne programme jamais plus de séances que le programme n'en contient,
  // même si la personne se dit disponible tous les jours : la récupération
  // fait partie de l'entraînement.
  const sessions = Math.min(profile.daysPerWeek, program.daysPerWeek);
  const slots = new Set(spreadDays(sessions));

  return JOURS.map((day, i) => {
    if (slots.has(i)) {
      return { day, kind: "seance" as const, label: `Séance ${[...slots].indexOf(i) + 1}` };
    }
    // Un jour actif entre deux séances vaut mieux qu'un repos complet.
    const nextIsSession = slots.has((i + 1) % 7);
    return nextIsSession
      ? { day, kind: "actif" as const, label: "Marche ou étirements" }
      : { day, kind: "repos" as const, label: "Repos" };
  });
}

/**
 * Jalons hebdomadaires. Les cibles chiffrées viennent du contenu réel du
 * programme, pas d'une promesse : la semaine 4 correspond bien au volume que
 * le programme atteint à ce moment-là.
 */
function buildMilestones(program: Program, profile: Profile): Milestone[] {
  const sessions = Math.min(profile.daysPerWeek, program.daysPerWeek);
  const plancheTenue = [20, 30, 35, 45];
  const labels = [
    "Prendre le pli",
    "Tenir le rythme",
    "Monter d'un cran",
    "Semaine record",
  ];

  return [1, 2, 3, 4].map((week) => {
    const targets = [
      `${sessions} séance${sessions > 1 ? "s" : ""} terminée${sessions > 1 ? "s" : ""} et cochée${sessions > 1 ? "s" : ""}`,
    ];

    if (week === 1) {
      targets.push("Faire les mouvements en cherchant la forme, pas la vitesse");
      targets.push("Noter votre poids de départ dans Progression");
    }
    if (week === 2) {
      targets.push("Enchaîner le circuit sans allonger les temps de repos");
      targets.push(`Tenir la planche ${plancheTenue[1]} secondes`);
    }
    if (week === 3) {
      targets.push("Faire toutes les répétitions prévues sans version allégée");
      targets.push("Descendre plus bas sur les squats et les fentes");
    }
    if (week === 4) {
      targets.push(`Tenir la planche ${plancheTenue[3]} secondes`);
      targets.push("Terminer le dernier tour sans pause supplémentaire");
    }

    return { week, title: `Semaine ${week} — ${labels[week - 1]}`, targets };
  });
}

function buildMonthGoal(program: Program, profile: Profile): Milestone {
  const sessions = Math.min(profile.daysPerWeek, program.daysPerWeek);
  const total = sessions * 4;

  const targets = [
    `${total} séances terminées sur les 4 semaines`,
    "Le programme bouclé du début à la fin, sans sauter de semaine",
    "Une progression visible sur au moins un exercice (répétitions ou temps de maintien)",
  ];

  if (profile.goal === "perte-de-poids") {
    targets.push(
      "Un poids et un tour de taille relevés chaque semaine, dans les mêmes conditions",
    );
  }
  if (profile.goal === "muscle" || profile.goal === "fessiers") {
    targets.push("Passer à la version plus difficile d'au moins deux exercices");
  }

  return { week: 0, title: `Objectif du mois — ${program.name}`, targets };
}

function buildAdvice(profile: Profile): string[] {
  const advice = [
    "Posez vos séances dans votre agenda comme des rendez-vous. C'est la régularité qui décide du résultat, pas l'intensité d'une séance isolée.",
    "Une séance écourtée vaut infiniment mieux qu'une séance annulée. En cas de journée difficile, faites l'échauffement et un seul tour.",
  ];

  if (profile.goal === "perte-de-poids") {
    advice.push(
      "L'entraînement seul déplace peu la balance : c'est l'alimentation qui pèse le plus lourd. Pour un accompagnement nutritionnel, adressez-vous à un diététicien-nutritionniste.",
    );
  }
  if (profile.daysPerWeek >= 5) {
    advice.push(
      "Vous avez indiqué beaucoup de disponibilité, mais le plan reste volontairement en dessous : les muscles se construisent pendant le repos, pas pendant la séance.",
    );
  }
  if (profile.age >= 50) {
    advice.push(
      "Allongez l'échauffement d'une minute ou deux et privilégiez les versions sans saut, indiquées sur chaque exercice.",
    );
  }
  if (profile.constraints?.trim()) {
    advice.push(
      "Vous avez signalé une contrainte : remplacez tout mouvement douloureux par sa version allégée, et demandez l'avis d'un professionnel de santé avant de forcer.",
    );
  }

  return advice;
}

export function buildPlan(profile: Profile): Plan {
  const program = pickProgram(profile);

  return {
    programSlug: program.slug,
    programName: program.name,
    why: whyThisProgram(program, profile),
    sessionsPerWeek: Math.min(profile.daysPerWeek, program.daysPerWeek),
    minutesPerSession: program.minutesPerSession,
    weeklySchedule: buildSchedule(program, profile),
    milestones: buildMilestones(program, profile),
    monthGoal: buildMonthGoal(program, profile),
    advice: buildAdvice(profile),
  };
}
