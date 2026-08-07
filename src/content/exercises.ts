import type { PoseName } from "@/content/poses";

/**
 * Catalogue d'exercices réalisables à la maison.
 *
 * `steps` alimente le carrousel : une vignette par temps du mouvement, que
 * l'abonné fait défiler. Aucune vidéo à tourner, aucun média à héberger.
 */

export type Category = "jambes" | "haut" | "gainage" | "cardio" | "mobilite";

/**
 * Famille de mouvement : elle rassemble les variantes d'un même geste, de la
 * plus accessible à la plus exigeante. C'est ce qui permet de dire « voilà
 * toutes les pompes, et voilà dans quel ordre les aborder » — l'information
 * qu'un pratiquant cherche vraiment quand il regarde une bibliothèque
 * d'exercices.
 */
export type FamilySlug =
  | "pompes"
  | "squats"
  | "fentes"
  | "fessiers"
  | "triceps"
  | "dos"
  | "mollets"
  | "gainage"
  | "abdos"
  | "cardio"
  | "mobilite";

export const FAMILIES: Record<
  FamilySlug,
  { label: string; emoji: string; blurb: string }
> = {
  pompes: {
    label: "Pompes",
    emoji: "🙌",
    blurb: "La poussée du haut du corps. Montez l'appui pour alléger, descendez-le pour corser.",
  },
  squats: {
    label: "Squats",
    emoji: "🦵",
    blurb: "Le mouvement de base des jambes. On travaille d'abord la profondeur, puis l'explosivité.",
  },
  fentes: {
    label: "Fentes",
    emoji: "🚶",
    blurb: "Une jambe à la fois : c'est ce qui corrige les déséquilibres entre la droite et la gauche.",
  },
  fessiers: {
    label: "Fessiers",
    emoji: "🍑",
    blurb: "Le travail direct des fessiers, sans charge et sans impact.",
  },
  triceps: {
    label: "Triceps",
    emoji: "💪",
    blurb: "L'arrière du bras, avec une simple chaise.",
  },
  dos: {
    label: "Dos & lombaires",
    emoji: "🔙",
    blurb: "La chaîne arrière, celle qui tient la posture. Difficile à travailler sans matériel : d'où sa place à part.",
  },
  mollets: {
    label: "Mollets",
    emoji: "🦶",
    blurb: "Petit muscle, grosse endurance : on cherche l'amplitude et la lenteur.",
  },
  gainage: {
    label: "Gainage",
    emoji: "🧱",
    blurb: "Tenir la position sans bouger. C'est ce qui protège le bas du dos sur tous les autres exercices.",
  },
  abdos: {
    label: "Abdominaux",
    emoji: "🔥",
    blurb: "Le travail dynamique de la sangle abdominale, du plus simple au plus exigeant.",
  },
  cardio: {
    label: "Cardio",
    emoji: "⚡",
    blurb: "Faire monter le souffle. Certains sont silencieux, d'autres non : c'est indiqué sur chaque fiche.",
  },
  mobilite: {
    label: "Mobilité & étirements",
    emoji: "🧘",
    blurb: "Avant pour préparer, après pour récupérer.",
  },
};

export type Exercise = {
  slug: string;
  name: string;
  category: Category;
  /** Famille de mouvement : regroupe les variantes d'un même geste */
  family: FamilySlug;
  /** 1 = accessible à tous, 3 = demande déjà du niveau */
  level: 1 | 2 | 3;
  muscles: string[];
  equipment: "aucun" | "chaise" | "mur";
  /** "reps" = compter des répétitions, "time" = tenir un temps */
  mode: "reps" | "time";
  steps: { pose: PoseName; title: string; detail: string }[];
  cues: string[];
  mistakes: string[];
  breathing: string;
  easier?: string;
  harder?: string;
};

export const CATEGORIES: Record<Category, { label: string; emoji: string }> = {
  jambes: { label: "Jambes & fessiers", emoji: "🦵" },
  haut: { label: "Haut du corps", emoji: "💪" },
  gainage: { label: "Gainage & abdos", emoji: "🔥" },
  cardio: { label: "Cardio", emoji: "⚡" },
  mobilite: { label: "Mobilité & étirements", emoji: "🧘" },
};

export const EXERCISES: Exercise[] = [
  // ============================================================== JAMBES
  {
    slug: "squat",
    name: "Squat",
    category: "jambes",
    family: "squats",
    level: 1,
    muscles: ["Quadriceps", "Fessiers", "Ischio-jambiers"],
    equipment: "aucun",
    mode: "reps",
    steps: [
      {
        pose: "squatHaut",
        title: "Position de départ",
        detail:
          "Debout, pieds écartés de la largeur des épaules, pointes légèrement vers l'extérieur. Bras tendus devant vous pour l'équilibre.",
      },
      {
        pose: "squatBas",
        title: "Descente",
        detail:
          "Poussez les hanches vers l'arrière comme pour vous asseoir, puis pliez les genoux. Descendez jusqu'à ce que les cuisses soient parallèles au sol.",
      },
      {
        pose: "squatHaut",
        title: "Remontée",
        detail:
          "Poussez fort dans les talons pour revenir debout. Serrez les fessiers en haut du mouvement.",
      },
    ],
    cues: [
      "Le poids reste dans les talons et le milieu du pied",
      "Le buste reste fier, regard droit devant",
      "Les genoux suivent la direction des pointes de pieds",
    ],
    mistakes: [
      "Décoller les talons du sol",
      "Arrondir le bas du dos en bas du mouvement",
      "Laisser les genoux rentrer vers l'intérieur",
    ],
    breathing: "Inspirez en descendant, soufflez en remontant.",
    easier: "chaise-mur",
    harder: "squat-saute",
  },
  {
    slug: "fente-avant",
    name: "Fente avant",
    category: "jambes",
    family: "fentes",
    level: 2,
    muscles: ["Quadriceps", "Fessiers"],
    equipment: "aucun",
    mode: "reps",
    steps: [
      {
        pose: "debout",
        title: "Position de départ",
        detail: "Debout, pieds joints, buste droit, mains sur les hanches.",
      },
      {
        pose: "fenteBas",
        title: "Le pas",
        detail:
          "Faites un grand pas en avant et descendez jusqu'à former deux angles droits. Le genou arrière frôle le sol sans le toucher.",
      },
      {
        pose: "debout",
        title: "Retour",
        detail:
          "Poussez sur le talon de la jambe avant pour revenir à la position de départ. Alternez les jambes.",
      },
    ],
    cues: [
      "Buste vertical pendant toute la descente",
      "Grand pas : le genou avant ne dépasse pas la pointe du pied",
      "Contractez les abdos pour ne pas vaciller",
    ],
    mistakes: ["Faire un pas trop court", "Se pencher en avant", "Poser le genou arrière brutalement"],
    breathing: "Inspirez en descendant, soufflez en poussant pour remonter.",
    easier: "squat",
    harder: "fente-bulgare",
  },
  {
    slug: "fente-arriere",
    name: "Fente arrière",
    category: "jambes",
    family: "fentes",
    level: 1,
    muscles: ["Fessiers", "Quadriceps"],
    equipment: "aucun",
    mode: "reps",
    steps: [
      {
        pose: "debout",
        title: "Position de départ",
        detail: "Debout, pieds joints, abdos engagés.",
      },
      {
        pose: "fentePasArriere",
        title: "Le pas en arrière",
        detail: "Reculez une jambe loin derrière vous, la pointe du pied touche le sol en premier.",
      },
      {
        pose: "fenteBas",
        title: "Descente",
        detail:
          "Pliez les deux genoux jusqu'à 90°. Le poids reste majoritairement sur la jambe avant.",
      },
    ],
    cues: [
      "Plus douce pour les genoux que la fente avant : idéale pour débuter",
      "Le buste reste droit, les épaules basses",
      "Poussez dans le talon avant pour remonter",
    ],
    mistakes: ["Reculer trop peu", "Basculer le buste en avant"],
    breathing: "Inspirez en reculant, soufflez en revenant.",
    harder: "fente-avant",
  },
  {
    slug: "squat-saute",
    name: "Squat sauté",
    category: "jambes",
    family: "squats",
    level: 3,
    muscles: ["Quadriceps", "Fessiers", "Mollets"],
    equipment: "aucun",
    mode: "reps",
    steps: [
      {
        pose: "squatBas",
        title: "Armez",
        detail: "Descendez en squat, bras en arrière, prêt à exploser vers le haut.",
      },
      {
        pose: "squatSaut",
        title: "Le saut",
        detail: "Poussez violemment dans les jambes et décollez. Tendez tout le corps en l'air.",
      },
      {
        pose: "squatBas",
        title: "Réception",
        detail:
          "Atterrissez sur l'avant du pied puis déroulez, genoux fléchis pour amortir. Enchaînez sans marquer d'arrêt.",
      },
    ],
    cues: [
      "Réception silencieuse = réception bien amortie",
      "Enchaînez les répétitions sans temps mort",
      "Arrêtez la série dès que la réception devient bruyante",
    ],
    mistakes: [
      "Atterrir jambes tendues (très traumatisant pour les genoux)",
      "Sauter en arrondissant le dos",
    ],
    breathing: "Soufflez au moment du saut.",
    easier: "squat",
  },
  {
    slug: "pont-fessier",
    name: "Pont fessier",
    category: "jambes",
    family: "fessiers",
    level: 1,
    muscles: ["Fessiers", "Ischio-jambiers", "Lombaires"],
    equipment: "aucun",
    mode: "reps",
    steps: [
      {
        pose: "pontBas",
        title: "Position de départ",
        detail:
          "Allongé sur le dos, genoux pliés, pieds à plat près des fessiers, bras le long du corps.",
      },
      {
        pose: "pontHaut",
        title: "Montée",
        detail:
          "Poussez dans les talons et décollez le bassin jusqu'à aligner genoux, hanches et épaules. Serrez fort les fessiers en haut.",
      },
      {
        pose: "pontBas",
        title: "Descente contrôlée",
        detail: "Redescendez lentement sans poser complètement le bassin entre les répétitions.",
      },
    ],
    cues: [
      "La poussée vient des fessiers, pas du bas du dos",
      "Marquez 1 seconde de contraction en haut",
      "Gardez les côtes basses, ne cambrez pas",
    ],
    mistakes: ["Monter trop haut en cambrant", "Pousser sur les pointes de pieds"],
    breathing: "Soufflez en montant, inspirez en descendant.",
  },
  {
    slug: "chaise-mur",
    name: "Chaise contre le mur",
    category: "jambes",
    family: "squats",
    level: 1,
    muscles: ["Quadriceps", "Fessiers"],
    equipment: "mur",
    mode: "time",
    steps: [
      {
        pose: "chaiseMur",
        title: "Position à tenir",
        detail:
          "Dos plaqué contre le mur, glissez jusqu'à ce que les cuisses soient parallèles au sol. Genoux à 90°, au-dessus des chevilles.",
      },
      {
        pose: "debout",
        title: "Sortie",
        detail: "Poussez dans les talons et remontez le long du mur pour vous relever.",
      },
    ],
    cues: [
      "Tout le dos reste en contact avec le mur",
      "Respirez normalement, ne bloquez pas",
      "Si ça brûle, c'est normal : c'est l'exercice qui travaille",
    ],
    mistakes: ["Poser les mains sur les cuisses pour tricher", "Descendre trop peu"],
    breathing: "Respiration continue et calme pendant tout le maintien.",
    harder: "squat",
  },
  {
    slug: "fente-bulgare",
    name: "Fente bulgare",
    category: "jambes",
    family: "fentes",
    level: 3,
    muscles: ["Quadriceps", "Fessiers"],
    equipment: "chaise",
    mode: "reps",
    steps: [
      {
        pose: "bulgareHaut",
        title: "Installation",
        detail:
          "Dos à une chaise, posez le dessus du pied arrière sur l'assise. Avancez suffisamment la jambe avant.",
      },
      {
        pose: "bulgareBas",
        title: "Descente",
        detail:
          "Descendez à la verticale jusqu'à ce que la cuisse avant soit parallèle au sol. Le buste s'incline très légèrement.",
      },
      {
        pose: "bulgareHaut",
        title: "Remontée",
        detail: "Poussez dans le talon avant pour remonter. Terminez toutes les reps d'un côté avant de changer.",
      },
    ],
    cues: [
      "Toute la charge est sur la jambe avant",
      "Cherchez la stabilité avant de chercher la profondeur",
      "Utilisez un mur du bout des doigts si vous perdez l'équilibre",
    ],
    mistakes: ["Jambe avant trop près de la chaise", "Pousser sur le pied arrière"],
    breathing: "Inspirez en descendant, soufflez en remontant.",
    easier: "fente-avant",
  },
  {
    slug: "mollets",
    name: "Extensions mollets",
    category: "jambes",
    family: "mollets",
    level: 1,
    muscles: ["Mollets"],
    equipment: "aucun",
    mode: "reps",
    steps: [
      {
        pose: "debout",
        title: "Position de départ",
        detail: "Debout, pieds écartés de la largeur des hanches, corps gainé.",
      },
      {
        pose: "molletsHaut",
        title: "Montée",
        detail: "Montez le plus haut possible sur la pointe des pieds. Marquez 1 seconde en haut.",
      },
      {
        pose: "debout",
        title: "Descente",
        detail: "Redescendez très lentement, en 3 secondes, jusqu'à poser les talons.",
      },
    ],
    cues: ["Amplitude maximale en haut", "Descente lente : c'est là que ça travaille"],
    mistakes: ["Rebondir sans contrôle", "Amplitude trop courte"],
    breathing: "Soufflez en montant.",
  },

  // ========================================================== HAUT DU CORPS
  {
    slug: "pompes",
    name: "Pompes",
    category: "haut",
    family: "pompes",
    level: 2,
    muscles: ["Pectoraux", "Triceps", "Épaules"],
    equipment: "aucun",
    mode: "reps",
    steps: [
      {
        pose: "plancheHaute",
        title: "Position de départ",
        detail:
          "Mains au sol un peu plus larges que les épaules, corps parfaitement aligné de la tête aux talons.",
      },
      {
        pose: "pompeBasse",
        title: "Descente",
        detail:
          "Pliez les coudes à 45° du corps et descendez la poitrine près du sol. Le corps reste une planche rigide.",
      },
      {
        pose: "plancheHaute",
        title: "Poussée",
        detail: "Poussez dans les mains pour revenir bras tendus, sans casser l'alignement.",
      },
    ],
    cues: [
      "Serrez les fessiers et les abdos pendant tout le mouvement",
      "Coudes à 45°, pas écartés à 90°",
      "Le corps monte et descend d'un seul bloc",
    ],
    mistakes: [
      "Laisser le bassin s'affaisser",
      "Ne descendre qu'à moitié",
      "Tendre le cou vers le sol au lieu de descendre la poitrine",
    ],
    breathing: "Inspirez en descendant, soufflez en poussant.",
    easier: "pompes-inclinees",
    harder: "pompes-piquees",
  },
  {
    slug: "pompes-genoux",
    name: "Pompes sur les genoux",
    category: "haut",
    family: "pompes",
    level: 1,
    muscles: ["Pectoraux", "Triceps"],
    equipment: "aucun",
    mode: "reps",
    steps: [
      {
        pose: "pompeGenouxHaute",
        title: "Position de départ",
        detail: "Genoux au sol, chevilles croisées, corps aligné des genoux aux épaules.",
      },
      {
        pose: "pompeGenouxBasse",
        title: "Descente",
        detail: "Descendez la poitrine vers le sol en gardant les coudes proches du corps.",
      },
      {
        pose: "pompeGenouxHaute",
        title: "Poussée",
        detail: "Repoussez le sol jusqu'à tendre les bras.",
      },
    ],
    cues: ["Hanches basses : ne cassez pas la ligne genoux-épaules", "Mettez un coussin sous les genoux si besoin"],
    mistakes: ["Fesses en l'air", "Amplitude trop courte"],
    breathing: "Inspirez en descendant, soufflez en poussant.",
    harder: "pompes",
  },
  {
    slug: "pompes-inclinees",
    name: "Pompes inclinées",
    category: "haut",
    family: "pompes",
    level: 1,
    muscles: ["Pectoraux", "Triceps", "Épaules"],
    equipment: "chaise",
    mode: "reps",
    steps: [
      {
        pose: "pompeInclineeHaute",
        title: "Position de départ",
        detail:
          "Mains sur une chaise stable, un plan de travail ou un rebord de fenêtre. Corps aligné, pieds au sol.",
      },
      {
        pose: "pompeInclineeBasse",
        title: "Descente",
        detail: "Descendez la poitrine vers l'appui en contrôlant.",
      },
      {
        pose: "pompeInclineeHaute",
        title: "Poussée",
        detail:
          "Repoussez. Plus l'appui est haut, plus c'est facile : baissez l'appui au fil des semaines.",
      },
    ],
    cues: [
      "Le meilleur moyen de progresser vers les vraies pompes",
      "Vérifiez que l'appui ne glisse pas",
    ],
    mistakes: ["Utiliser un appui instable", "Laisser le bassin tomber"],
    breathing: "Inspirez en descendant, soufflez en poussant.",
    harder: "pompes",
  },
  {
    slug: "dips-chaise",
    name: "Dips sur chaise",
    category: "haut",
    family: "triceps",
    level: 2,
    muscles: ["Triceps", "Épaules", "Pectoraux"],
    equipment: "chaise",
    mode: "reps",
    steps: [
      {
        pose: "dipsHaut",
        title: "Position de départ",
        detail:
          "Dos à une chaise stable, mains sur le bord de l'assise, doigts vers l'avant. Bassin décollé du siège.",
      },
      {
        pose: "dipsBas",
        title: "Descente",
        detail:
          "Pliez les coudes vers l'arrière et descendez le bassin jusqu'à 90° au coude. Restez près de la chaise.",
      },
      {
        pose: "dipsHaut",
        title: "Poussée",
        detail: "Poussez dans les paumes pour remonter jusqu'à tendre les bras.",
      },
    ],
    cues: [
      "Épaules basses, loin des oreilles",
      "Plus les pieds sont loin, plus c'est dur",
      "Calez la chaise contre un mur",
    ],
    mistakes: ["Descendre trop bas (douleur aux épaules)", "S'éloigner de la chaise"],
    breathing: "Inspirez en descendant, soufflez en poussant.",
  },
  {
    slug: "pompes-piquees",
    name: "Pompes piquées",
    category: "haut",
    family: "pompes",
    level: 3,
    muscles: ["Épaules", "Triceps"],
    equipment: "aucun",
    mode: "reps",
    steps: [
      {
        pose: "piqueHaut",
        title: "Position de départ",
        detail: "Depuis la planche, marchez avec les pieds vers les mains pour former un V inversé, fesses haut.",
      },
      {
        pose: "piqueBas",
        title: "Descente",
        detail: "Pliez les coudes et amenez le sommet du crâne vers le sol, entre les mains.",
      },
      {
        pose: "piqueHaut",
        title: "Poussée",
        detail: "Repoussez le sol jusqu'à tendre les bras, en gardant le V.",
      },
    ],
    cues: ["Gardez les hanches hautes", "Regard vers vos pieds", "L'exercice roi pour les épaules sans matériel"],
    mistakes: ["Laisser les hanches descendre (ça redevient une pompe)", "Descendre le front au lieu du sommet du crâne"],
    breathing: "Inspirez en descendant, soufflez en poussant.",
    easier: "pompes",
  },
  {
    slug: "superman",
    name: "Superman",
    category: "haut",
    family: "dos",
    level: 1,
    muscles: ["Lombaires", "Fessiers", "Dos"],
    equipment: "aucun",
    mode: "reps",
    steps: [
      {
        pose: "supermanBas",
        title: "Position de départ",
        detail: "Allongé sur le ventre, bras tendus devant, jambes tendues, front au sol.",
      },
      {
        pose: "supermanHaut",
        title: "Extension",
        detail:
          "Décollez simultanément la poitrine, les bras et les jambes. Tenez 2 secondes en haut.",
      },
      {
        pose: "supermanBas",
        title: "Retour",
        detail: "Redescendez lentement sans relâcher complètement.",
      },
    ],
    cues: [
      "Le mouvement est court : cherchez la contraction, pas l'amplitude",
      "Regard vers le sol pour protéger la nuque",
      "Le seul exercice de dos vraiment efficace sans matériel",
    ],
    mistakes: ["Lever la tête et casser la nuque", "Aller trop haut et forcer sur les lombaires"],
    breathing: "Soufflez en montant.",
  },

  // ========================================================= GAINAGE & ABDOS
  {
    slug: "planche",
    name: "Planche (gainage)",
    category: "gainage",
    family: "gainage",
    level: 1,
    muscles: ["Abdominaux", "Lombaires", "Épaules"],
    equipment: "aucun",
    mode: "time",
    steps: [
      {
        pose: "plancheAvantBras",
        title: "Position à tenir",
        detail:
          "Sur les avant-bras, coudes sous les épaules, corps aligné de la tête aux talons. Serrez fessiers et abdos.",
      },
      {
        pose: "plancheHaute",
        title: "Variante bras tendus",
        detail: "Sur les mains si les coudes sont sensibles : même alignement, même gainage.",
      },
    ],
    cues: [
      "Rentrez légèrement le bassin pour effacer la cambrure",
      "Poussez le sol avec les avant-bras",
      "Mieux vaut 20 secondes parfaites que 60 secondes affaissées",
    ],
    mistakes: ["Fesses trop hautes", "Bassin qui s'affaisse", "Bloquer sa respiration"],
    breathing: "Respirez de façon continue, sans jamais bloquer.",
    harder: "planche-laterale",
  },
  {
    slug: "planche-laterale",
    name: "Planche latérale",
    category: "gainage",
    family: "gainage",
    level: 2,
    muscles: ["Obliques", "Abdominaux"],
    equipment: "aucun",
    mode: "time",
    steps: [
      {
        pose: "plancheLaterale",
        title: "Position à tenir",
        detail:
          "Sur un avant-bras, coude sous l'épaule, corps en ligne. Bassin haut, bras libre tendu vers le plafond.",
      },
      {
        pose: "plancheAvantBras",
        title: "Changement de côté",
        detail: "Repassez par la planche classique pour changer de côté proprement.",
      },
    ],
    cues: ["Poussez la hanche vers le plafond", "Alignez épaule, hanche et cheville"],
    mistakes: ["Laisser le bassin tomber vers le sol", "Basculer vers l'avant"],
    breathing: "Respiration continue.",
    easier: "planche",
  },
  {
    slug: "grimpeur",
    name: "Grimpeur (mountain climber)",
    category: "gainage",
    family: "gainage",
    level: 2,
    muscles: ["Abdominaux", "Épaules", "Cardio"],
    equipment: "aucun",
    mode: "time",
    steps: [
      {
        pose: "plancheHaute",
        title: "Position de départ",
        detail: "En planche bras tendus, mains sous les épaules, corps gainé.",
      },
      {
        pose: "grimpeurA",
        title: "Genou vers la poitrine",
        detail: "Ramenez un genou vers la poitrine sans bouger le bassin.",
      },
      {
        pose: "grimpeurB",
        title: "Alternez vite",
        detail: "Changez de jambe en rythme, comme une course au sol. Les épaules restent au-dessus des mains.",
      },
    ],
    cues: ["Le bassin ne monte pas et ne descend pas", "Cherchez la vitesse une fois la technique acquise"],
    mistakes: ["Fesses qui montent", "Épaules qui reculent derrière les mains"],
    breathing: "Respiration rapide et régulière.",
  },
  {
    slug: "crunch",
    name: "Crunch",
    category: "gainage",
    family: "abdos",
    level: 1,
    muscles: ["Grand droit"],
    equipment: "aucun",
    mode: "reps",
    steps: [
      {
        pose: "crunchBas",
        title: "Position de départ",
        detail: "Sur le dos, genoux pliés, pieds au sol, mains aux tempes (sans tirer sur la nuque).",
      },
      {
        pose: "crunchHaut",
        title: "Enroulement",
        detail:
          "Décollez les omoplates en enroulant le buste. Le bas du dos reste plaqué au sol.",
      },
      {
        pose: "crunchBas",
        title: "Retour",
        detail: "Redescendez lentement sans poser complètement la tête.",
      },
    ],
    cues: ["Gardez le menton à distance d'un poing de la poitrine", "Petit mouvement, grosse contraction"],
    mistakes: ["Tirer sur la nuque avec les mains", "Prendre de l'élan"],
    breathing: "Soufflez en montant.",
    harder: "releve-jambes",
  },
  {
    slug: "releve-jambes",
    name: "Relevé de jambes",
    category: "gainage",
    family: "abdos",
    level: 2,
    muscles: ["Abdominaux bas"],
    equipment: "aucun",
    mode: "reps",
    steps: [
      {
        pose: "jambesBas",
        title: "Position de départ",
        detail: "Sur le dos, jambes tendues légèrement décollées, mains sous les fessiers.",
      },
      {
        pose: "jambesHaut",
        title: "Montée",
        detail: "Montez les jambes tendues à la verticale, sans décoller le bas du dos.",
      },
      {
        pose: "jambesBas",
        title: "Descente contrôlée",
        detail: "Redescendez très lentement. Arrêtez-vous dès que le bas du dos se décolle.",
      },
    ],
    cues: [
      "Le bas du dos reste collé au sol : c'est la règle absolue",
      "Pliez les genoux si c'est trop dur",
    ],
    mistakes: ["Cambrer le bas du dos", "Descendre trop bas trop tôt"],
    breathing: "Soufflez en montant, inspirez en descendant.",
    easier: "crunch",
  },
  {
    slug: "dead-bug",
    name: "Dead bug",
    category: "gainage",
    family: "abdos",
    level: 1,
    muscles: ["Abdominaux profonds", "Coordination"],
    equipment: "aucun",
    mode: "reps",
    steps: [
      {
        pose: "deadbugDepart",
        title: "Position de départ",
        detail: "Sur le dos, bras tendus vers le plafond, hanches et genoux à 90°.",
      },
      {
        pose: "deadbugTendu",
        title: "Extension croisée",
        detail:
          "Tendez lentement le bras droit derrière la tête et la jambe gauche vers le sol, en même temps.",
      },
      {
        pose: "deadbugDepart",
        title: "Retour",
        detail: "Revenez au centre, puis alternez avec l'autre diagonale.",
      },
    ],
    cues: [
      "Le bas du dos reste plaqué au sol du début à la fin",
      "Lent et contrôlé : ce n'est pas un exercice de vitesse",
    ],
    mistakes: ["Cambrer quand les membres s'éloignent", "Aller trop vite"],
    breathing: "Soufflez pendant l'extension.",
  },
  {
    slug: "hollow-hold",
    name: "Hollow hold",
    category: "gainage",
    family: "abdos",
    level: 3,
    muscles: ["Abdominaux", "Fléchisseurs de hanche"],
    equipment: "aucun",
    mode: "time",
    steps: [
      {
        pose: "hollow",
        title: "Position à tenir",
        detail:
          "Sur le dos, bras et jambes tendus, épaules et talons décollés. Le bas du dos écrase le sol.",
      },
      {
        pose: "deadbugDepart",
        title: "Version facile",
        detail: "Pliez les genoux et rapprochez les bras du corps pour réduire le levier.",
      },
    ],
    cues: ["Si le dos se creuse, remontez les bras et les jambes", "Forme de banane, pas de planche"],
    mistakes: ["Laisser un espace entre le bas du dos et le sol"],
    breathing: "Respiration courte et continue.",
    easier: "dead-bug",
  },

  // ================================================================= CARDIO
  {
    slug: "jumping-jack",
    name: "Jumping jack",
    category: "cardio",
    family: "cardio",
    level: 1,
    muscles: ["Cardio", "Épaules", "Mollets"],
    equipment: "aucun",
    mode: "time",
    steps: [
      {
        pose: "debout",
        title: "Position fermée",
        detail: "Debout, pieds joints, bras le long du corps.",
      },
      {
        pose: "brasEnCroix",
        title: "Position ouverte",
        detail: "Sautez en écartant les jambes et en levant les bras au-dessus de la tête.",
      },
      {
        pose: "debout",
        title: "Retour",
        detail: "Sautez à nouveau pour refermer. Enchaînez à un rythme régulier.",
      },
    ],
    cues: [
      "Réception souple, genoux légèrement fléchis",
      "L'échauffement le plus simple qui existe",
    ],
    mistakes: ["Réception jambes raides", "Bras qui ne montent pas assez haut"],
    breathing: "Respiration rythmée et continue.",
  },
  {
    slug: "montees-genoux",
    name: "Montées de genoux",
    category: "cardio",
    family: "cardio",
    level: 1,
    muscles: ["Cardio", "Abdominaux", "Quadriceps"],
    equipment: "aucun",
    mode: "time",
    steps: [
      {
        pose: "genouxHautsA",
        title: "Genou droit",
        detail: "Courez sur place en montant le genou à hauteur de hanche.",
      },
      {
        pose: "genouxHautsB",
        title: "Genou gauche",
        detail: "Alternez rapidement. Les bras accompagnent le mouvement comme à la course.",
      },
    ],
    cues: ["Restez sur l'avant du pied", "Buste droit, abdos serrés"],
    mistakes: ["Se pencher en arrière", "Genoux qui ne montent pas assez haut"],
    breathing: "Respiration rythmée.",
  },
  {
    slug: "talons-fesses",
    name: "Talons-fesses",
    category: "cardio",
    family: "cardio",
    level: 1,
    muscles: ["Cardio", "Ischio-jambiers"],
    equipment: "aucun",
    mode: "time",
    steps: [
      {
        pose: "talonsFessesA",
        title: "Talon droit",
        detail: "Sur place, ramenez le talon vers la fesse.",
      },
      {
        pose: "talonsFessesB",
        title: "Talon gauche",
        detail: "Alternez rapidement en restant sur l'avant des pieds.",
      },
    ],
    cues: ["Le bassin ne bouge pas", "Excellent pour finir un échauffement"],
    mistakes: ["Se pencher en avant"],
    breathing: "Respiration rythmée.",
  },
  {
    slug: "corde-a-sauter",
    name: "Corde à sauter (sans corde)",
    category: "cardio",
    family: "cardio",
    level: 1,
    muscles: ["Cardio", "Mollets"],
    equipment: "aucun",
    mode: "time",
    steps: [
      {
        pose: "cordeBas",
        title: "Position de départ",
        detail: "Coudes près du corps, avant-bras vers l'avant, comme si vous teniez une corde.",
      },
      {
        pose: "cordeHaut",
        title: "Le saut",
        detail: "Petits sauts sur place, à peine décollés, en tournant les poignets.",
      },
    ],
    cues: ["Sauts minuscules : 2 à 3 cm suffisent", "Silencieux et sans matériel : parfait en appartement"],
    mistakes: ["Sauter trop haut", "Retomber sur les talons"],
    breathing: "Respiration régulière.",
  },
  {
    slug: "patineur",
    name: "Patineur",
    category: "cardio",
    family: "cardio",
    level: 2,
    muscles: ["Fessiers", "Cardio", "Équilibre"],
    equipment: "aucun",
    mode: "time",
    steps: [
      {
        pose: "patineurGauche",
        title: "Saut à gauche",
        detail:
          "Sautez latéralement sur la jambe gauche, la jambe droite passe croisée derrière.",
      },
      {
        pose: "patineurDroit",
        title: "Saut à droite",
        detail: "Rebondissez de l'autre côté, comme un patineur de vitesse.",
      },
    ],
    cues: ["Amortissez sur la jambe d'appui", "Amplitude latérale plutôt que vitesse au début"],
    mistakes: ["Réception raide", "Buste qui s'effondre vers l'avant"],
    breathing: "Respiration rythmée.",
  },
  {
    slug: "burpee",
    name: "Burpee",
    category: "cardio",
    family: "cardio",
    level: 3,
    muscles: ["Corps entier", "Cardio"],
    equipment: "aucun",
    mode: "reps",
    steps: [
      {
        pose: "debout",
        title: "Debout",
        detail: "Départ debout, corps gainé.",
      },
      {
        pose: "squatBas",
        title: "Accroupi",
        detail: "Descendez en posant les mains au sol devant les pieds.",
      },
      {
        pose: "plancheHaute",
        title: "Planche",
        detail: "Envoyez les pieds en arrière pour arriver en position de planche.",
      },
      {
        pose: "squatBas",
        title: "Retour",
        detail: "Ramenez les pieds vers les mains d'un saut.",
      },
      {
        pose: "squatSaut",
        title: "Saut final",
        detail: "Explosez vers le haut, bras au-dessus de la tête.",
      },
    ],
    cues: [
      "Ajoutez une pompe en position planche pour corser",
      "Enlevez le saut final pour une version douce",
      "Gardez un rythme régulier plutôt que de partir trop vite",
    ],
    mistakes: ["Dos creusé en position planche", "Réception non amortie"],
    breathing: "Soufflez au saut, inspirez en descendant.",
    easier: "grimpeur",
  },

  // ============================================================== MOBILITÉ
  {
    slug: "etirement-ischios",
    name: "Étirement ischio-jambiers",
    category: "mobilite",
    family: "mobilite",
    level: 1,
    muscles: ["Ischio-jambiers", "Bas du dos"],
    equipment: "aucun",
    mode: "time",
    steps: [
      {
        pose: "etirementIschios",
        title: "Position à tenir",
        detail:
          "Debout, jambes tendues, penchez-vous en avant depuis les hanches et laissez les bras descendre.",
      },
      {
        pose: "debout",
        title: "Sortie",
        detail: "Remontez lentement en déroulant le dos vertèbre par vertèbre.",
      },
    ],
    cues: ["Genoux très légèrement fléchis", "Relâchez la nuque", "Ne cherchez pas la douleur"],
    mistakes: ["Forcer par à-coups", "Bloquer la respiration"],
    breathing: "Respiration lente ; relâchez un peu plus à chaque expiration.",
  },
  {
    slug: "etirement-quadriceps",
    name: "Étirement quadriceps",
    category: "mobilite",
    family: "mobilite",
    level: 1,
    muscles: ["Quadriceps", "Fléchisseurs de hanche"],
    equipment: "aucun",
    mode: "time",
    steps: [
      {
        pose: "etirementQuadriceps",
        title: "Position à tenir",
        detail:
          "Debout, attrapez une cheville et ramenez le talon vers la fesse. Genoux serrés l'un contre l'autre.",
      },
      {
        pose: "debout",
        title: "Changement de côté",
        detail: "Reposez le pied et faites l'autre jambe pour la même durée.",
      },
    ],
    cues: ["Poussez le bassin vers l'avant", "Appuyez-vous à un mur pour l'équilibre"],
    mistakes: ["Cambrer le bas du dos", "Écarter le genou vers l'extérieur"],
    breathing: "Respiration lente et profonde.",
  },
  {
    slug: "posture-enfant",
    name: "Posture de l'enfant",
    category: "mobilite",
    family: "mobilite",
    level: 1,
    muscles: ["Dos", "Hanches", "Épaules"],
    equipment: "aucun",
    mode: "time",
    steps: [
      {
        pose: "etirementEnfant",
        title: "Position à tenir",
        detail:
          "À genoux, fessiers sur les talons, bras tendus loin devant, front vers le sol.",
      },
    ],
    cues: ["Écartez les genoux pour respirer plus librement", "La meilleure façon de terminer une séance"],
    mistakes: ["Contracter les épaules"],
    breathing: "Respirations profondes dans le ventre.",
  },
  {
    slug: "chat-vache",
    name: "Chat-vache",
    category: "mobilite",
    family: "mobilite",
    level: 1,
    muscles: ["Colonne vertébrale", "Abdominaux"],
    equipment: "aucun",
    mode: "time",
    steps: [
      {
        pose: "etirementChat",
        title: "Le chat",
        detail: "À quatre pattes, arrondissez le dos vers le plafond en rentrant le menton.",
      },
      {
        pose: "supermanBas",
        title: "La vache",
        detail: "Creusez le dos, ouvrez la poitrine et regardez légèrement vers l'avant.",
      },
    ],
    cues: ["Mouvement lent, synchronisé avec la respiration", "Idéal en échauffement et après une journée assise"],
    mistakes: ["Aller trop vite", "Forcer dans les extrêmes"],
    breathing: "Soufflez sur le chat, inspirez sur la vache.",
  },
];

export const EXERCISE_BY_SLUG = new Map(EXERCISES.map((e) => [e.slug, e]));

/**
 * Les familles, chacune avec ses variantes classées de la plus accessible à la
 * plus exigeante. Le classement suit le niveau déclaré, puis la chaîne
 * easier/harder pour départager deux exercices de même niveau.
 */
export function exercisesByFamily(list: Exercise[] = EXERCISES) {
  const order = (Object.keys(FAMILIES) as FamilySlug[]);

  return order
    .map((family) => ({
      family,
      ...FAMILIES[family],
      exercises: list
        .filter((e) => e.family === family)
        .sort((a, b) => {
          if (a.level !== b.level) return a.level - b.level;
          // À niveau égal, celui qui est désigné comme « version plus facile »
          // de l'autre passe devant.
          if (b.easier === a.slug || a.harder === b.slug) return -1;
          if (a.easier === b.slug || b.harder === a.slug) return 1;
          return a.name.localeCompare(b.name, "fr");
        }),
    }))
    .filter((group) => group.exercises.length > 0);
}


/**
 * La posture qui représente le mieux l'exercice sur une vignette.
 *
 * Pour un exercice compté en répétitions, c'est la deuxième étape : la position
 * basse ou l'effort, pas le simple « debout » de départ. Pour un exercice tenu
 * en durée, c'est au contraire la première : la position à maintenir, la suite
 * ne décrivant que la sortie du mouvement.
 */
export function keyPoseOf(exercise: Exercise) {
  const index = exercise.mode === "time" ? 0 : Math.min(1, exercise.steps.length - 1);
  return exercise.steps[index].pose;
}

export function getExercise(slug: string): Exercise {
  const found = EXERCISE_BY_SLUG.get(slug);
  if (!found) throw new Error(`Exercice inconnu : ${slug}`);
  return found;
}
