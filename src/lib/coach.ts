import { getExercise } from "@/content/exercises";
import { PROGRAMS, getProgram, programExerciseSlugs, type Program } from "@/content/programs";

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

export type Level = "debutant" | "intermediaire" | "avance";

export type Profile = {
  age: number;
  heightCm: number;
  weightKg: number;
  goal: "perte-de-poids" | "forme" | "muscle" | "fessiers";
  level: Level;
  daysPerWeek: number;
  constraints?: string;
  /** Minutes réellement disponibles par séance */
  minutesAvailable: 15 | 25 | 40;
  /** Sauts possibles chez soi ? (voisins, articulations) */
  canJump: boolean;
  /** Depuis combien de temps sans entraînement régulier */
  lastActive: "actif" | "quelques-mois" | "plus-un-an" | "jamais";
  /** Ce qui a fait arrêter la dernière fois */
  blocker: "aucun" | "temps" | "motivation" | "douleurs";
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

/** Remplacement d'un mouvement du programme par un autre, sans impact. */
export type Swap = { from: string; to: string; note: string; slug?: string };

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
  /**
   * Ce que chaque réponse a changé dans le plan. Sans cette liste, un
   * questionnaire plus long ressemble à un formulaire administratif : on ne voit
   * pas ce qu'il a servi. Ici, chaque ligne relie une réponse à une décision.
   */
  adjustments: string[];
  /** Mouvements à remplacer quand les sauts sont exclus */
  swaps: Swap[];
  /** Comment tenir dans le temps annoncé */
  formatNote: string;
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

/**
 * Le niveau réellement utilisé pour choisir le programme.
 *
 * Le niveau déclaré est une impression, pas un état. Quelqu'un qui se souvient
 * d'avoir été confirmé il y a trois ans l'est encore dans sa tête, plus dans
 * ses tendons — et c'est exactement le profil qui se blesse la première semaine
 * puis abandonne. La date du dernier entraînement régulier tranche donc.
 */
function effectiveLevel(profile: Profile): Level {
  if (profile.lastActive === "jamais" || profile.lastActive === "plus-un-an") return "debutant";
  if (profile.lastActive === "quelques-mois" && profile.level === "avance") return "intermediaire";
  return profile.level;
}

/**
 * Nombre de jours retenu.
 *
 * On respecte la disponibilité annoncée, sauf dans deux cas : des douleurs
 * signalées, où un jour de récupération de plus vaut mieux qu'une séance de
 * plus ; et un abandon passé par manque de temps, où un plan trop ambitieux
 * reproduirait exactement le scénario de l'échec précédent.
 */
function effectiveDays(profile: Profile, program: Program): number {
  let days = Math.min(profile.daysPerWeek, program.daysPerWeek);
  if (profile.blocker === "douleurs") days = Math.min(days, 3);
  if (profile.blocker === "temps") days = Math.min(days, 3);
  return Math.max(1, days);
}

function pickProgram(profile: Profile): Program {
  const byGoal: Record<Profile["goal"], string> = {
    "perte-de-poids": "brule-graisses-hiit",
    fessiers: "fessiers-jambes",
    muscle: "haut-du-corps-abdos",
    forme: "demarrage-full-body",
  };

  const wanted = getProgram(byGoal[profile.goal]) ?? PROGRAMS[0];
  const level = effectiveLevel(profile);

  // Un débutant complet ne commence pas par du HIIT ou du haut du corps
  // avancé : la technique et l'habitude passent avant l'intensité.
  if (level === "debutant" && wanted.level !== "debutant") {
    return getProgram("demarrage-full-body") ?? PROGRAMS[0];
  }
  // Inversement, un pratiquant confirmé qui vise la forme générale s'ennuierait
  // sur le programme de démarrage.
  if (level === "avance" && wanted.slug === "demarrage-full-body") {
    return getProgram("haut-du-corps-abdos") ?? wanted;
  }
  return wanted;
}

/**
 * Les mouvements du programme à remplacer quand les sauts sont exclus.
 *
 * La liste est calculée depuis le contenu réel du programme, pas écrite à la
 * main : si un programme change, les remplacements suivent.
 */
function buildSwaps(program: Program, profile: Profile): Swap[] {
  if (profile.canJump) return [];

  const swaps: Swap[] = [];
  for (const slug of programExerciseSlugs(program)) {
    const exercise = getExercise(slug);
    if (!exercise?.impact || !exercise.lowImpact) continue;

    const replacement = exercise.lowImpact.slug ? getExercise(exercise.lowImpact.slug) : undefined;
    swaps.push({
      from: exercise.name,
      to: replacement?.name ?? "Version marchée",
      note: exercise.lowImpact.note,
      slug: replacement?.slug,
    });
  }
  return swaps;
}

/** Comment tenir dans le temps annoncé, sans dénaturer la séance. */
function buildFormatNote(program: Program, profile: Profile): string {
  const prevu = program.minutesPerSession;
  if (profile.minutesAvailable >= prevu) {
    return `Les séances durent environ ${prevu} minutes, échauffement et étirements compris. Vous avez annoncé ${profile.minutesAvailable} minutes : la marge vous laisse le temps de bien faire les mouvements plutôt que de les expédier.`;
  }
  if (profile.minutesAvailable <= 15) {
    return `Les séances sont prévues pour ${prevu} minutes et vous en avez ${profile.minutesAvailable}. Faites l'échauffement en entier, puis un tour de circuit au lieu de deux ou trois, et gardez une minute d'étirements. Une séance courte faite vaut mieux qu'une séance complète repoussée.`;
  }
  return `Les séances sont prévues pour ${prevu} minutes et vous en avez ${profile.minutesAvailable}. Retirez un tour de circuit les jours pressés : l'échauffement et les étirements, eux, ne se sautent pas.`;
}

function whyThisProgram(program: Program, profile: Profile): string {
  if (effectiveLevel(profile) === "debutant" && program.slug === "demarrage-full-body") {
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
  const sessions = effectiveDays(profile, program);
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
  const sessions = effectiveDays(profile, program);
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
  const sessions = effectiveDays(profile, program);
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
  if (!profile.canJump) {
    advice.push(
      "Sans saut, la séance reste efficace : c'est l'amplitude et le rythme qui font monter le souffle, pas l'impact. Posez un tapis ou une serviette pliée sous vos pieds pour amortir davantage.",
    );
  }
  if (profile.minutesAvailable <= 15) {
    advice.push(
      "Avec quinze minutes, ne cherchez pas à tout caser : mieux vaut un tour de circuit propre que trois tours bâclés. Le volume viendra quand votre emploi du temps s'allégera.",
    );
  }
  if (profile.blocker === "motivation") {
    advice.push(
      "Fixez-vous un seuil minimal ridiculement bas les mauvais jours — l'échauffement seul compte comme une séance faite. C'est la chaîne de séances qui se casse en premier, pas les muscles.",
    );
  }
  if (profile.blocker === "douleurs") {
    advice.push(
      "Une douleur qui persiste après la séance n'est pas une courbature : arrêtez le mouvement en cause et faites-le voir. Ce plan ne remplace pas un avis médical.",
    );
  }
  if (profile.lastActive === "jamais") {
    advice.push(
      "C'est votre première pratique régulière : les deux premières semaines servent à apprendre les gestes. Ne comparez pas vos chiffres à ceux de quelqu'un d'autre, comparez-les aux vôtres de la semaine passée.",
    );
  }

  return advice;
}

/**
 * Ce que chaque réponse a changé. On n'écrit une ligne que lorsqu'une décision
 * a réellement été prise : mentionner une réponse restée sans effet ferait
 * croire à une personnalisation qui n'a pas eu lieu.
 */
function buildAdjustments(program: Program, profile: Profile): string[] {
  const lines: string[] = [];
  const level = effectiveLevel(profile);
  const days = effectiveDays(profile, program);

  if (level !== profile.level) {
    const raison =
      profile.lastActive === "jamais"
        ? "vous n'avez jamais eu de pratique régulière"
        : profile.lastActive === "plus-un-an"
          ? "votre dernière période régulière remonte à plus d'un an"
          : "votre dernière période régulière remonte à quelques mois";
    lines.push(
      `Vous vous décrivez comme ${LEVEL_LABEL[profile.level]}, mais ${raison} : le plan repart au niveau ${LEVEL_LABEL[level]}. Vous remonterez vite, et sans vous blesser la première semaine.`,
    );
  }

  if (days < Math.min(profile.daysPerWeek, program.daysPerWeek)) {
    const raison =
      profile.blocker === "douleurs"
        ? "vous avez signalé des douleurs par le passé"
        : "le manque de temps vous a déjà fait arrêter";
    lines.push(
      `Vous êtes disponible ${profile.daysPerWeek} jours, le plan n'en programme que ${days} : ${raison}, et un plan tenu vaut mieux qu'un plan abandonné.`,
    );
  } else if (profile.daysPerWeek > program.daysPerWeek) {
    lines.push(
      `Vous êtes disponible ${profile.daysPerWeek} jours et le plan en programme ${days} : le programme est construit ainsi, les jours restants servent à récupérer.`,
    );
  }

  if (profile.minutesAvailable < program.minutesPerSession) {
    lines.push(
      `Vous disposez de ${profile.minutesAvailable} minutes pour des séances prévues en ${program.minutesPerSession} : le format est ajusté plus bas plutôt que de vous laisser déborder.`,
    );
  }

  // Annoncer une liste de remplacements quand le programme n'en demande aucun
  // serait une promesse en l'air. On dit alors l'inverse, qui est un vrai
  // argument : ce programme se fait déjà sans sauter.
  if (!profile.canJump) {
    const swaps = buildSwaps(program, profile);
    lines.push(
      swaps.length > 0
        ? `Vous ne pouvez pas sauter chez vous : ${swaps.length} mouvement${swaps.length > 1 ? "s" : ""} de ce programme ${swaps.length > 1 ? "sont remplacés" : "est remplacé"}, la liste est plus bas.`
        : "Vous ne pouvez pas sauter chez vous : ce programme n'en demande aucun, il se fait en silence et sans impact.",
    );
  }

  if (profile.blocker === "motivation") {
    lines.push(
      "La motivation vous a déjà fait décrocher : les objectifs de ce plan portent sur des séances cochées, pas sur des sensations. On peut vérifier une case, pas une envie.",
    );
  }

  return lines;
}

const LEVEL_LABEL: Record<Level, string> = {
  debutant: "débutant",
  intermediaire: "intermédiaire",
  avance: "confirmé",
};

export function buildPlan(profile: Profile): Plan {
  const program = pickProgram(profile);

  return {
    programSlug: program.slug,
    programName: program.name,
    why: whyThisProgram(program, profile),
    sessionsPerWeek: effectiveDays(profile, program),
    // On annonce le temps que la personne a vraiment, pas celui du programme :
    // c'est ce chiffre qu'elle va comparer à son emploi du temps.
    minutesPerSession: Math.min(program.minutesPerSession, profile.minutesAvailable),
    weeklySchedule: buildSchedule(program, profile),
    milestones: buildMilestones(program, profile),
    monthGoal: buildMonthGoal(program, profile),
    advice: buildAdvice(profile),
    adjustments: buildAdjustments(program, profile),
    swaps: buildSwaps(program, profile),
    formatNote: buildFormatNote(program, profile),
  };
}
