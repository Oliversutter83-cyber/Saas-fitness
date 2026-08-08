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
  /**
   * Mouvement avec impact : les deux pieds quittent le sol, ou la course sur
   * place fait vibrer le plancher. C'est ce qui pose problème en appartement et
   * sur des articulations sensibles — d'où la question posée dans le bilan.
   */
  impact?: "saut";
  /**
   * Quoi faire quand les sauts sont exclus. Soit un autre exercice du
   * catalogue, soit une simple consigne quand le geste reste le même et que
   * seule la vitesse change.
   */
  lowImpact?: { slug?: string; note: string };
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
    impact: "saut",
    lowImpact: { slug: "squat", note: "Squat classique, en montant vite sans décoller." },
    easier: "squat",
  },
  {
    slug: "squat-sumo",
    name: "Squat sumo",
    category: "jambes",
    family: "squats",
    level: 1,
    muscles: ["Adducteurs", "Fessiers", "Quadriceps"],
    equipment: "aucun",
    mode: "reps",
    steps: [
      {
        pose: "squatSumoHaut",
        title: "Position de départ",
        detail:
          "Pieds nettement plus larges que les épaules, pointes ouvertes à 45 degrés vers l'extérieur.",
      },
      {
        pose: "squatSumoBas",
        title: "Descente",
        detail:
          "Descendez droit entre vos pieds, buste vertical. Les genoux poussent vers l'extérieur, dans l'axe des pointes.",
      },
      {
        pose: "squatSumoHaut",
        title: "Remontée",
        detail:
          "Poussez dans les talons et serrez les fessiers en haut.",
      },
    ],
    cues: ["L'écart des pieds déplace le travail vers l'intérieur des cuisses et les fessiers", "Buste plus vertical que sur un squat classique : c'est normal", "Genoux vers l'extérieur pendant toute la descente"],
    mistakes: ["Genoux qui rentrent vers l'intérieur", "Pointes de pieds droit devant au lieu d'ouvertes"],
    breathing: "Inspirez en descendant, soufflez en remontant.",
    easier: "chaise-mur",
    harder: "squat",
  },
  {
    slug: "squat-tempo",
    name: "Squat lent",
    category: "jambes",
    family: "squats",
    level: 2,
    muscles: ["Quadriceps", "Fessiers"],
    equipment: "aucun",
    mode: "reps",
    steps: [
      {
        pose: "squatHaut",
        title: "Position de départ",
        detail:
          "Position de squat classique, pieds à la largeur des épaules.",
      },
      {
        pose: "squatBas",
        title: "Descente en quatre temps",
        detail:
          "Descendez en comptant jusqu'à quatre, puis restez deux secondes en bas sans relâcher.",
      },
      {
        pose: "squatHaut",
        title: "Remontée",
        detail:
          "Remontez en deux temps, sans rebond et sans bloquer les genoux en haut.",
      },
    ],
    cues: ["Le temps sous tension remplace la charge que vous n'avez pas", "Huit squats lents valent vingt squats rapides", "L'arrêt en bas supprime le rebond qui triche"],
    mistakes: ["Rebondir en bas", "Accélérer la descente quand ça brûle"],
    breathing: "Inspirez pendant la descente, soufflez en remontant.",
    easier: "squat",
    harder: "squat-une-jambe",
  },
  {
    slug: "squat-une-jambe",
    name: "Squat sur une jambe",
    category: "jambes",
    family: "squats",
    level: 3,
    muscles: ["Quadriceps", "Fessiers", "Équilibre"],
    equipment: "chaise",
    mode: "reps",
    steps: [
      {
        pose: "squatUneJambeHaut",
        title: "Position de départ",
        detail:
          "Debout devant une chaise, dos à l'assise. Tendez une jambe devant vous, bras à l'horizontale pour l'équilibre.",
      },
      {
        pose: "squatUneJambeBas",
        title: "Descente",
        detail:
          "Descendez lentement sur la jambe d'appui jusqu'à effleurer l'assise, sans vous y poser.",
      },
      {
        pose: "squatUneJambeHaut",
        title: "Remontée",
        detail:
          "Poussez dans le talon pour remonter, toujours sans poser l'autre pied.",
      },
    ],
    cues: ["La chaise sert de repère et de filet : plus elle est haute, plus c'est accessible", "L'étape avant le squat une jambe complet, qui demande une mobilité de cheville rare", "Faites le même nombre de répétitions des deux côtés, en commençant par le côté faible"],
    mistakes: ["S'asseoir franchement au lieu d'effleurer", "Genou qui part vers l'intérieur", "Se jeter en arrière"],
    breathing: "Inspirez en descendant, soufflez en poussant.",
    easier: "squat-tempo",
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
    harder: "pont-une-jambe",
  },
  {
    slug: "donkey-kick",
    name: "Coup de pied fessier",
    category: "jambes",
    family: "fessiers",
    level: 1,
    muscles: ["Fessiers"],
    equipment: "aucun",
    mode: "reps",
    steps: [
      {
        pose: "quatrePattes",
        title: "Position de départ",
        detail:
          "À quatre pattes, mains sous les épaules, genoux sous les hanches, dos plat.",
      },
      {
        pose: "donkeyKickHaut",
        title: "La poussée",
        detail:
          "Poussez un talon vers le plafond en gardant le genou plié à angle droit. Montez jusqu'à ce que la cuisse soit dans l'axe du dos.",
      },
      {
        pose: "quatrePattes",
        title: "Retour",
        detail:
          "Redescendez lentement sans poser le genou, et enchaînez.",
      },
    ],
    cues: ["Le talon pousse vers le haut, comme s'il écrasait le plafond", "Le bassin ne bascule pas : si le bas du dos se creuse, vous montez trop haut", "Serrez le fessier en haut pendant une seconde"],
    mistakes: ["Bas du dos creusé", "Bassin qui part en rotation", "Mouvement lancé par élan"],
    breathing: "Soufflez en poussant, inspirez en redescendant.",
    harder: "pont-une-jambe",
  },
  {
    slug: "fire-hydrant",
    name: "Ouverture de hanche",
    category: "jambes",
    family: "fessiers",
    level: 1,
    muscles: ["Fessiers", "Hanches"],
    equipment: "aucun",
    mode: "reps",
    steps: [
      {
        pose: "quatrePattes",
        title: "Position de départ",
        detail:
          "À quatre pattes, dos plat, abdos légèrement engagés.",
      },
      {
        pose: "hydrantHaut",
        title: "L'ouverture",
        detail:
          "Ouvrez une hanche en levant le genou sur le côté, genou toujours plié. Le buste ne bouge pas.",
      },
      {
        pose: "quatrePattes",
        title: "Retour",
        detail:
          "Redescendez lentement, sans poser complètement, puis recommencez.",
      },
    ],
    cues: ["Cible le moyen fessier, sur le côté de la hanche — celui qui stabilise le bassin à la marche", "Les mains restent bien à plat : c'est le signe que le buste ne compense pas", "Amplitude modeste et contrôlée plutôt que grande et lancée"],
    mistakes: ["Buste qui bascule du côté opposé", "Genou qui se tend en montant"],
    breathing: "Soufflez en ouvrant, inspirez en refermant.",
  },
  {
    slug: "pont-une-jambe",
    name: "Pont fessier sur une jambe",
    category: "jambes",
    family: "fessiers",
    level: 2,
    muscles: ["Fessiers", "Ischio-jambiers"],
    equipment: "aucun",
    mode: "reps",
    steps: [
      {
        pose: "pontBas",
        title: "Position de départ",
        detail:
          "Allongé sur le dos, un pied au sol genou plié, l'autre jambe tendue vers le plafond.",
      },
      {
        pose: "pontUneJambe",
        title: "Montée",
        detail:
          "Poussez dans le talon au sol pour monter le bassin, jambe libre toujours tendue en l'air.",
      },
      {
        pose: "pontBas",
        title: "Descente",
        detail:
          "Redescendez lentement sans poser franchement le bassin, et enchaînez.",
      },
    ],
    cues: ["Tout le poids sur une jambe : deux fois plus dur que le pont classique", "Le bassin reste horizontal, il ne penche pas du côté de la jambe libre", "Poussez dans le talon, pas dans la pointe du pied"],
    mistakes: ["Bassin qui s'incline", "Pousser sur la pointe du pied", "Monter en creusant le bas du dos"],
    breathing: "Soufflez en montant, inspirez en descendant.",
    easier: "pont-fessier",
    harder: "hip-thrust",
  },
  {
    slug: "hip-thrust",
    name: "Hip thrust sur chaise",
    category: "jambes",
    family: "fessiers",
    level: 2,
    muscles: ["Fessiers", "Ischio-jambiers"],
    equipment: "chaise",
    mode: "reps",
    steps: [
      {
        pose: "hipThrustBas",
        title: "Position de départ",
        detail:
          "Haut du dos calé contre l'assise d'une chaise stable, pieds au sol, bassin en bas.",
      },
      {
        pose: "hipThrustHaut",
        title: "Montée",
        detail:
          "Poussez dans les talons pour monter le bassin jusqu'à ce que le corps forme une ligne des genoux aux épaules.",
      },
      {
        pose: "hipThrustBas",
        title: "Descente",
        detail:
          "Redescendez lentement, sans poser le bassin au sol entre deux répétitions.",
      },
    ],
    cues: ["L'amplitude est plus grande qu'au sol : c'est ce qui rend l'exercice plus efficace", "Menton légèrement rentré, regard vers les genoux", "Vérifiez que la chaise ne peut pas glisser avant de commencer"],
    mistakes: ["Creuser le bas du dos en haut", "Monter en poussant sur les pointes de pieds"],
    breathing: "Soufflez en montant, inspirez en descendant.",
    easier: "pont-une-jambe",
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
    slug: "fente-laterale",
    name: "Fente latérale",
    category: "jambes",
    family: "fentes",
    level: 2,
    muscles: ["Adducteurs", "Fessiers", "Quadriceps"],
    equipment: "aucun",
    mode: "reps",
    steps: [
      {
        pose: "debout",
        title: "Position de départ",
        detail:
          "Debout, pieds joints, buste droit.",
      },
      {
        pose: "fenteLateraleBas",
        title: "Le pas de côté",
        detail:
          "Faites un grand pas sur le côté et pliez cette jambe en poussant les hanches en arrière. L'autre jambe reste tendue, pied à plat.",
      },
      {
        pose: "debout",
        title: "Retour",
        detail:
          "Poussez sur la jambe fléchie pour revenir au centre, puis changez de côté.",
      },
    ],
    cues: ["Le seul mouvement qui travaille vraiment l'intérieur des cuisses sans matériel", "La jambe tendue reste tendue, pied entièrement au sol", "Poussez les hanches en arrière plutôt que de plier le genou en avant"],
    mistakes: ["Pas trop court", "Talon de la jambe tendue qui décolle", "Buste qui s'effondre en avant"],
    breathing: "Inspirez sur le pas de côté, soufflez en revenant.",
    easier: "fente-arriere",
    harder: "fente-avant",
  },
  {
    slug: "fente-croisee",
    name: "Fente croisée",
    category: "jambes",
    family: "fentes",
    level: 2,
    muscles: ["Fessiers", "Quadriceps", "Équilibre"],
    equipment: "aucun",
    mode: "reps",
    steps: [
      {
        pose: "debout",
        title: "Position de départ",
        detail:
          "Debout, pieds à la largeur des hanches, mains sur les hanches.",
      },
      {
        pose: "fenteCroiseeBas",
        title: "Le pas croisé",
        detail:
          "Reculez une jambe en diagonale, derrière et en travers de l'autre, comme une révérence. Descendez droit.",
      },
      {
        pose: "debout",
        title: "Retour",
        detail:
          "Poussez sur la jambe avant pour revenir, puis alternez.",
      },
    ],
    cues: ["Le croisement cible le côté du fessier, que la fente classique laisse de côté", "Le bassin reste face à l'avant : c'est la jambe qui croise, pas le buste", "Descendez moins bas qu'une fente classique au début, l'équilibre est plus délicat"],
    mistakes: ["Bassin qui pivote", "Genou avant qui rentre vers l'intérieur"],
    breathing: "Inspirez en descendant, soufflez en remontant.",
    easier: "fente-arriere",
    harder: "fente-bulgare",
  },
  {
    slug: "fente-sautee",
    name: "Fente sautée",
    category: "jambes",
    family: "fentes",
    level: 3,
    muscles: ["Quadriceps", "Fessiers", "Cardio"],
    equipment: "aucun",
    mode: "reps",
    steps: [
      {
        pose: "fenteBas",
        title: "Position de départ",
        detail:
          "En fente basse, les deux genoux à angle droit, buste vertical.",
      },
      {
        pose: "fenteSaut",
        title: "Le saut",
        detail:
          "Poussez fort dans les deux jambes pour décoller, et changez de jambe en l'air.",
      },
      {
        pose: "fenteBas",
        title: "Réception",
        detail:
          "Amortissez en repassant directement en fente, l'autre jambe devant.",
      },
    ],
    cues: ["Le mouvement le plus exigeant de la famille : maîtrisez la fente avant de sauter", "Réception amortie, genou qui plie dès le contact", "Bruyant et traumatisant : à éviter en appartement et sur genoux sensibles"],
    mistakes: ["Réception jambes tendues", "Genou arrière qui tape le sol", "Buste penché en avant"],
    breathing: "Soufflez au saut, inspirez à la réception.",
    easier: "fente-avant",
    impact: "saut",
    lowImpact: { slug: "fente-avant", note: "Fente avant classique, en remontant vite sans décoller." },
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
    easier: "marche-pointes",
    harder: "mollets-une-jambe",
  },
  {
    slug: "marche-pointes",
    name: "Marche sur la pointe des pieds",
    category: "jambes",
    family: "mollets",
    level: 1,
    muscles: ["Mollets", "Équilibre"],
    equipment: "aucun",
    mode: "time",
    steps: [
      {
        pose: "marchePointeA",
        title: "Sur les pointes",
        detail:
          "Montez sur la pointe des pieds et marchez sur place, talons toujours en l'air.",
      },
      {
        pose: "marchePointeB",
        title: "Pas suivant",
        detail:
          "Alternez sans jamais reposer les talons. Restez le plus haut possible.",
      },
    ],
    cues: ["L'entrée en matière de la famille : aucun impact, aucun matériel", "Le simple fait de ne jamais reposer le talon suffit à faire brûler", "Parfait comme fin d'échauffement"],
    mistakes: ["Talons qui redescendent entre deux pas", "Buste qui se penche en avant"],
    breathing: "Respiration libre et régulière.",
    harder: "mollets",
  },
  {
    slug: "mollets-une-jambe",
    name: "Mollets sur une jambe",
    category: "jambes",
    family: "mollets",
    level: 2,
    muscles: ["Mollets"],
    equipment: "aucun",
    mode: "reps",
    steps: [
      {
        pose: "molletsUneJambeBas",
        title: "Position de départ",
        detail:
          "En appui sur un pied, l'autre jambe repliée derrière. Une main peut effleurer un mur pour l'équilibre.",
      },
      {
        pose: "molletsUneJambeHaut",
        title: "Montée",
        detail:
          "Montez le plus haut possible sur la pointe du pied d'appui, puis marquez une seconde en haut.",
      },
      {
        pose: "molletsUneJambeBas",
        title: "Descente",
        detail:
          "Redescendez lentement, talon jusqu'au sol : la descente compte autant que la montée.",
      },
    ],
    cues: ["Tout le poids du corps sur un mollet : c'est ce qu'il faut pour le faire progresser", "Cherchez l'amplitude maximale, en haut comme en bas", "Trois secondes pour redescendre"],
    mistakes: ["Rebondir en bas", "Amplitude écourtée en haut", "S'appuyer franchement sur le mur"],
    breathing: "Soufflez en montant, inspirez en descendant.",
    easier: "mollets",
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
    easier: "pompes-murales",
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
    easier: "pompes-murales",
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
    easier: "dips-sol",
    harder: "dips-jambes-tendues",
  },
  {
    slug: "dips-sol",
    name: "Dips au sol",
    category: "haut",
    family: "triceps",
    level: 1,
    muscles: ["Triceps", "Épaules"],
    equipment: "aucun",
    mode: "reps",
    steps: [
      {
        pose: "dipsSolHaut",
        title: "Position de départ",
        detail:
          "Assis au sol, mains posées derrière vous doigts vers les pieds, genoux pliés. Décollez le bassin.",
      },
      {
        pose: "dipsSolBas",
        title: "Descente",
        detail:
          "Pliez les coudes vers l'arrière pour descendre le bassin jusqu'à frôler le sol.",
      },
      {
        pose: "dipsSolHaut",
        title: "Poussée",
        detail:
          "Poussez dans les paumes pour remonter, sans verrouiller les coudes en haut.",
      },
    ],
    cues: ["La version la plus accessible : le sol arrête la descente, impossible de trop descendre", "Coudes vers l'arrière, jamais sur les côtés", "Épaules basses, loin des oreilles"],
    mistakes: ["Coudes qui s'écartent", "Épaules qui remontent vers les oreilles"],
    breathing: "Inspirez en descendant, soufflez en poussant.",
    harder: "dips-chaise",
  },
  {
    slug: "dips-jambes-tendues",
    name: "Dips jambes tendues",
    category: "haut",
    family: "triceps",
    level: 3,
    muscles: ["Triceps", "Épaules", "Gainage"],
    equipment: "chaise",
    mode: "reps",
    steps: [
      {
        pose: "dipsTenduHaut",
        title: "Position de départ",
        detail:
          "Mains sur le bord d'une chaise stable, bassin dans le vide, jambes tendues devant, talons au sol.",
      },
      {
        pose: "dipsTenduBas",
        title: "Descente",
        detail:
          "Descendez en pliant les coudes vers l'arrière, jusqu'à ce que les bras forment un angle droit.",
      },
      {
        pose: "dipsTenduHaut",
        title: "Poussée",
        detail:
          "Remontez en poussant dans les paumes, corps toujours gainé.",
      },
    ],
    cues: ["Jambes tendues : le bras porte bien plus de poids que genoux pliés", "Ne descendez pas plus bas que l'angle droit, l'épaule n'aime pas", "Vérifiez la stabilité de la chaise, dos contre un mur si besoin"],
    mistakes: ["Descendre trop bas", "Coudes qui s'ouvrent", "Fesses qui s'éloignent de la chaise"],
    breathing: "Inspirez en descendant, soufflez en poussant.",
    easier: "dips-chaise",
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
    slug: "pompes-murales",
    name: "Pompes murales",
    category: "haut",
    family: "pompes",
    level: 1,
    muscles: ["Pectoraux", "Triceps", "Épaules"],
    equipment: "mur",
    mode: "reps",
    steps: [
      {
        pose: "pompeMuraleHaute",
        title: "Position de départ",
        detail:
          "Debout face au mur, bras tendus, mains à hauteur d'épaules. Reculez les pieds d'un demi-pas : plus vous reculez, plus c'est dur.",
      },
      {
        pose: "pompeMuraleBasse",
        title: "Descente",
        detail:
          "Pliez les coudes et approchez la poitrine du mur, corps aligné de la tête aux talons.",
      },
      {
        pose: "pompeMuraleHaute",
        title: "Poussée",
        detail:
          "Poussez sur les mains pour revenir bras tendus, sans creuser le bas du dos.",
      },
    ],
    cues: ["La pompe la plus accessible : c'est par là qu'on commence quand les pompes au sol sont hors de portée", "Reculez les pieds de deux centimètres chaque semaine, c'est votre progression"],
    mistakes: ["Fesses en arrière au lieu du corps aligné", "Coudes qui partent à 90° sur les côtés"],
    breathing: "Inspirez en approchant du mur, soufflez en poussant.",
    harder: "pompes-inclinees",
  },
  {
    slug: "pompes-larges",
    name: "Pompes prise large",
    category: "haut",
    family: "pompes",
    level: 2,
    muscles: ["Pectoraux", "Épaules"],
    equipment: "aucun",
    mode: "reps",
    steps: [
      {
        pose: "plancheHaute",
        title: "Position de départ",
        detail:
          "En planche, mains nettement plus larges que les épaules — une largeur et demie d'épaules.",
      },
      {
        pose: "pompeBasse",
        title: "Descente",
        detail:
          "Descendez la poitrine vers le sol. Les coudes s'ouvrent davantage que sur une pompe classique.",
      },
      {
        pose: "plancheHaute",
        title: "Poussée",
        detail:
          "Repoussez le sol en gardant le corps gainé d'un bloc.",
      },
    ],
    cues: ["La prise large déplace le travail vers les pectoraux et allège les triceps", "De profil la silhouette est la même qu'une pompe classique : c'est l'écart des mains qui change tout", "N'écartez pas au point de sentir tirer devant l'épaule"],
    mistakes: ["Écart excessif, qui met l'épaule en porte-à-faux", "Amplitude raccourcie parce que c'est plus dur"],
    breathing: "Inspirez en descendant, soufflez en poussant.",
    easier: "pompes-genoux",
    harder: "pompes",
  },
  {
    slug: "pompes-diamant",
    name: "Pompes diamant",
    category: "haut",
    family: "pompes",
    level: 3,
    muscles: ["Triceps", "Pectoraux"],
    equipment: "aucun",
    mode: "reps",
    steps: [
      {
        pose: "plancheHaute",
        title: "Position de départ",
        detail:
          "En planche, mains jointes sous la poitrine : pouces et index forment un losange.",
      },
      {
        pose: "pompeBasse",
        title: "Descente",
        detail:
          "Descendez la poitrine vers vos mains en gardant les coudes serrés le long du corps.",
      },
      {
        pose: "plancheHaute",
        title: "Poussée",
        detail:
          "Poussez fort : ce sont les triceps qui font le travail, pas les pectoraux.",
      },
    ],
    cues: ["L'exercice de triceps le plus efficace sans matériel", "Coudes serrés : dès qu'ils s'ouvrent, l'exercice redevient une pompe classique", "Vue de profil, seule la position des mains change — d'où la même silhouette que la pompe classique"],
    mistakes: ["Coudes qui s'écartent", "Bassin qui tombe quand la fatigue arrive"],
    breathing: "Inspirez en descendant, soufflez en poussant.",
    easier: "pompes",
    harder: "pompes-declinees",
  },
  {
    slug: "pompes-declinees",
    name: "Pompes déclinées",
    category: "haut",
    family: "pompes",
    level: 3,
    muscles: ["Pectoraux", "Épaules", "Triceps"],
    equipment: "chaise",
    mode: "reps",
    steps: [
      {
        pose: "pompeDeclineeHaute",
        title: "Position de départ",
        detail:
          "Pieds posés sur une chaise ou un canapé, mains au sol sous les épaules. Plus l'appui est haut, plus c'est difficile.",
      },
      {
        pose: "pompeDeclineeBasse",
        title: "Descente",
        detail:
          "Descendez la poitrine vers le sol en gardant le corps parfaitement aligné.",
      },
      {
        pose: "pompeDeclineeHaute",
        title: "Poussée",
        detail:
          "Repoussez le sol sans laisser le bassin s'affaisser.",
      },
    ],
    cues: ["Les pieds surélevés reportent le poids sur le haut des pectoraux et les épaules", "Commencez sur une marche basse avant de passer à la chaise"],
    mistakes: ["Bassin qui s'affaisse", "Nuque cassée en arrière pour regarder devant"],
    breathing: "Inspirez en descendant, soufflez en poussant.",
    easier: "pompes-diamant",
    harder: "pompes-piquees",
  },
  {
    slug: "pompes-lentes",
    name: "Pompes lentes",
    category: "haut",
    family: "pompes",
    level: 2,
    muscles: ["Pectoraux", "Triceps", "Gainage"],
    equipment: "aucun",
    mode: "reps",
    steps: [
      {
        pose: "plancheHaute",
        title: "Position de départ",
        detail:
          "Position de pompe classique, mains sous les épaules, corps gainé.",
      },
      {
        pose: "pompeBasse",
        title: "Descente en quatre temps",
        detail:
          "Descendez en comptant lentement jusqu'à quatre. C'est cette lenteur qui fait tout le travail.",
      },
      {
        pose: "plancheHaute",
        title: "Remontée",
        detail:
          "Remontez en deux temps, sans à-coup, et enchaînez sans marquer d'arrêt en haut.",
      },
    ],
    cues: ["Même mouvement, tempo différent : quatre temps pour descendre, deux pour monter", "Six pompes lentes fatiguent plus que quinze pompes rapides", "La façon la plus sûre de progresser quand on bloque sur le nombre de répétitions"],
    mistakes: ["Accélérer la descente dès que ça brûle", "Retenir sa respiration pendant les quatre temps"],
    breathing: "Inspirez pendant toute la descente, soufflez en remontant.",
    easier: "pompes-genoux",
    harder: "pompes-diamant",
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
    easier: "superman-alterne",
    harder: "nage-dos",
  },
  {
    slug: "chien-oiseau",
    name: "Chien-oiseau",
    category: "haut",
    family: "dos",
    level: 1,
    muscles: ["Lombaires", "Gainage", "Fessiers"],
    equipment: "aucun",
    mode: "time",
    steps: [
      {
        pose: "quatrePattes",
        title: "Position de départ",
        detail:
          "À quatre pattes, mains sous les épaules, genoux sous les hanches, dos plat comme une table.",
      },
      {
        pose: "chienOiseau",
        title: "L'extension",
        detail:
          "Tendez un bras devant et la jambe opposée derrière, à l'horizontale. Tenez la position sans bouger le bassin.",
      },
      {
        pose: "quatrePattes",
        title: "Retour",
        detail:
          "Revenez lentement, puis changez de côté.",
      },
    ],
    cues: ["Le meilleur exercice pour le bas du dos quand on débute : aucune charge, aucun risque", "Imaginez un verre d'eau posé sur votre bas du dos : il ne doit pas se renverser", "Bras et jambe montent à l'horizontale, pas plus haut"],
    mistakes: ["Bassin qui bascule", "Jambe montée trop haut, ce qui creuse le dos", "Nuque relevée"],
    breathing: "Respiration continue, sans bloquer.",
    harder: "superman-alterne",
  },
  {
    slug: "superman-alterne",
    name: "Superman alterné",
    category: "haut",
    family: "dos",
    level: 1,
    muscles: ["Lombaires", "Fessiers", "Épaules"],
    equipment: "aucun",
    mode: "reps",
    steps: [
      {
        pose: "supermanBas",
        title: "Position de départ",
        detail:
          "À plat ventre, bras tendus devant, jambes tendues, front vers le sol.",
      },
      {
        pose: "supermanAlterne",
        title: "La montée",
        detail:
          "Levez un bras et la jambe opposée, en gardant le regard vers le sol.",
      },
      {
        pose: "supermanBas",
        title: "Retour",
        detail:
          "Redescendez sans relâcher complètement, puis alternez.",
      },
    ],
    cues: ["L'alternance permet de tenir plus longtemps que le superman complet", "Le regard reste au sol : la nuque prolonge la colonne", "Montez peu, mais serrez fort"],
    mistakes: ["Nuque cassée en arrière", "Montée trop ample qui écrase le bas du dos"],
    breathing: "Soufflez en montant, inspirez en redescendant.",
    easier: "chien-oiseau",
    harder: "superman",
  },
  {
    slug: "nage-dos",
    name: "Nage au sol",
    category: "haut",
    family: "dos",
    level: 2,
    muscles: ["Lombaires", "Épaules", "Trapèzes"],
    equipment: "aucun",
    mode: "time",
    steps: [
      {
        pose: "nageDosA",
        title: "Bras droit levé",
        detail:
          "À plat ventre, bras tendus devant. Levez un bras et l'épaule du même côté, poitrine légèrement décollée.",
      },
      {
        pose: "nageDosB",
        title: "Bras gauche levé",
        detail:
          "Changez de bras sans reposer la poitrine. Enchaînez à un rythme lent et régulier.",
      },
    ],
    cues: ["La poitrine reste décollée du début à la fin : c'est ce qui rend l'exercice difficile", "Mouvement lent : ce n'est pas un exercice de vitesse", "Excellent contre les douleurs de dos liées à la position assise"],
    mistakes: ["Poitrine qui repose entre deux bras", "Mouvement lancé par à-coups"],
    breathing: "Respiration continue, jamais bloquée.",
    easier: "superman",
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
    easier: "planche-genoux",
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
    slug: "planche-genoux",
    name: "Planche sur les genoux",
    category: "gainage",
    family: "gainage",
    level: 1,
    muscles: ["Abdominaux", "Gainage"],
    equipment: "aucun",
    mode: "time",
    steps: [
      {
        pose: "plancheGenoux",
        title: "La position",
        detail:
          "Appui sur les avant-bras et les genoux, coudes sous les épaules. Le corps forme une ligne des genoux aux épaules.",
      },
      {
        pose: "plancheGenoux",
        title: "Tenir",
        detail:
          "Serrez les abdos et les fessiers, respirez normalement. Dès que le bas du dos se creuse, arrêtez.",
      },
    ],
    cues: ["Le point d'entrée du gainage : appui sur les genoux, donc moitié moins de poids à tenir", "Vingt secondes propres valent mieux qu'une minute avec le dos creusé", "Rentrez légèrement le bassin pour effacer la cambrure"],
    mistakes: ["Fesses trop hautes", "Bas du dos creusé", "Apnée"],
    breathing: "Respiration continue, jamais bloquée.",
    harder: "planche",
  },
  {
    slug: "planche-bras-tendus",
    name: "Planche bras tendus",
    category: "gainage",
    family: "gainage",
    level: 1,
    muscles: ["Abdominaux", "Épaules", "Gainage"],
    equipment: "aucun",
    mode: "time",
    steps: [
      {
        pose: "plancheHaute",
        title: "La position",
        detail:
          "Position de pompe haute : mains sous les épaules, bras tendus, corps aligné de la tête aux talons.",
      },
      {
        pose: "plancheHaute",
        title: "Tenir",
        detail:
          "Poussez le sol loin de vous, serrez les fessiers, et respirez.",
      },
    ],
    cues: ["Plus accessible que la planche sur avant-bras : le levier est plus court", "Poussez activement le sol, ne restez pas suspendu entre les épaules", "La position de départ de toutes les pompes : la maîtriser sert partout"],
    mistakes: ["Épaules qui s'affaissent entre les omoplates", "Bassin qui tombe", "Coudes verrouillés à fond"],
    breathing: "Respiration continue.",
    harder: "planche",
  },
  {
    slug: "planche-touche-epaule",
    name: "Planche avec touche d'épaule",
    category: "gainage",
    family: "gainage",
    level: 2,
    muscles: ["Abdominaux", "Obliques", "Épaules"],
    equipment: "aucun",
    mode: "reps",
    steps: [
      {
        pose: "plancheHaute",
        title: "Position de départ",
        detail:
          "En planche bras tendus, pieds légèrement écartés pour plus de stabilité.",
      },
      {
        pose: "plancheEpaule",
        title: "La touche",
        detail:
          "Décollez une main et venez toucher l'épaule opposée, sans que le bassin bouge d'un millimètre.",
      },
      {
        pose: "plancheHaute",
        title: "Retour",
        detail:
          "Reposez la main et alternez. C'est l'immobilité du bassin qui compte, pas la vitesse.",
      },
    ],
    cues: ["Le bassin qui ne bouge pas : voilà tout l'exercice", "Écartez les pieds, cela rend la stabilité plus facile", "Filmez-vous une fois de côté : on croit toujours bouger moins qu'en réalité"],
    mistakes: ["Bassin qui roule d'un côté à l'autre", "Aller trop vite"],
    breathing: "Soufflez à chaque touche.",
    easier: "planche-bras-tendus",
    harder: "planche-dynamique",
  },
  {
    slug: "planche-dynamique",
    name: "Planche dynamique",
    category: "gainage",
    family: "gainage",
    level: 3,
    muscles: ["Abdominaux", "Épaules", "Triceps"],
    equipment: "aucun",
    mode: "reps",
    steps: [
      {
        pose: "plancheAvantBras",
        title: "Position basse",
        detail:
          "En planche sur les avant-bras, corps aligné et gainé.",
      },
      {
        pose: "plancheHaute",
        title: "Montée",
        detail:
          "Posez une main puis l'autre pour passer bras tendus, sans laisser le bassin osciller.",
      },
      {
        pose: "plancheAvantBras",
        title: "Descente",
        detail:
          "Redescendez coude par coude, et alternez le bras qui commence.",
      },
    ],
    cues: ["Du gainage et de la poussée dans le même mouvement", "Alternez le bras qui démarre, sinon un côté travaille deux fois plus", "Pieds écartés pour limiter le roulis"],
    mistakes: ["Bassin qui se balance de gauche à droite", "Toujours démarrer du même bras"],
    breathing: "Soufflez à chaque montée.",
    easier: "planche-touche-epaule",
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
  {
    slug: "ciseaux",
    name: "Ciseaux",
    category: "gainage",
    family: "abdos",
    level: 2,
    muscles: ["Abdominaux", "Fléchisseurs de hanche"],
    equipment: "aucun",
    mode: "time",
    steps: [
      {
        pose: "ciseauxA",
        title: "Première position",
        detail:
          "Allongé sur le dos, mains sous les fesses, bas du dos plaqué au sol. Une jambe monte, l'autre descend.",
      },
      {
        pose: "ciseauxB",
        title: "Croisement",
        detail:
          "Échangez la position des jambes sans les poser. Le bas du dos ne décolle jamais du sol.",
      },
    ],
    cues: ["Le bas du dos plaqué au sol est la seule règle qui compte", "Plus les jambes descendent bas, plus c'est dur : montez-les si le dos se creuse", "Mains sous les fesses au début, elles aident à garder le bassin en place"],
    mistakes: ["Bas du dos qui décolle", "Jambes descendues trop bas trop tôt", "Apnée"],
    breathing: "Respiration continue et régulière.",
    easier: "dead-bug",
    harder: "hollow-hold",
  },
  {
    slug: "crunch-velo",
    name: "Crunch vélo",
    category: "gainage",
    family: "abdos",
    level: 2,
    muscles: ["Abdominaux", "Obliques"],
    equipment: "aucun",
    mode: "reps",
    steps: [
      {
        pose: "crunchVeloA",
        title: "Premier côté",
        detail:
          "Sur le dos, mains aux tempes. Montez une épaule vers le genou opposé qui vient à sa rencontre, l'autre jambe s'allonge.",
      },
      {
        pose: "crunchVeloB",
        title: "Second côté",
        detail:
          "Changez de côté dans un mouvement fluide, sans reposer les épaules entre deux.",
      },
    ],
    cues: ["C'est l'épaule qui tourne vers le genou, pas le coude qui tire sur la nuque", "Lentement : la rotation contrôlée fait tout le travail des obliques", "Les mains effleurent les tempes, elles ne tirent jamais"],
    mistakes: ["Tirer sur la nuque avec les mains", "Aller vite en réduisant l'amplitude", "Bas du dos décollé"],
    breathing: "Soufflez à chaque rotation.",
    easier: "crunch",
    harder: "sit-up",
  },
  {
    slug: "sit-up",
    name: "Relevé de buste complet",
    category: "gainage",
    family: "abdos",
    level: 2,
    muscles: ["Abdominaux", "Fléchisseurs de hanche"],
    equipment: "aucun",
    mode: "reps",
    steps: [
      {
        pose: "crunchBas",
        title: "Position de départ",
        detail:
          "Allongé sur le dos, genoux pliés, pieds au sol, mains croisées sur la poitrine.",
      },
      {
        pose: "sitUpHaut",
        title: "Montée",
        detail:
          "Déroulez le dos vertèbre par vertèbre jusqu'à vous asseoir complètement.",
      },
      {
        pose: "crunchBas",
        title: "Descente",
        detail:
          "Redescendez tout aussi lentement, en reposant le dos vertèbre par vertèbre.",
      },
    ],
    cues: ["Amplitude complète, contrairement au crunch qui s'arrête à mi-chemin", "Déroulez et enroulez le dos : ne montez pas d'un bloc", "Bras croisés sur la poitrine plutôt que derrière la tête"],
    mistakes: ["Se lancer d'un coup de reins", "Tirer sur la nuque", "Se laisser retomber en fin de série"],
    breathing: "Soufflez en montant, inspirez en descendant.",
    easier: "crunch",
  },
  {
    slug: "rotation-russe",
    name: "Rotation russe",
    category: "gainage",
    family: "abdos",
    level: 2,
    muscles: ["Obliques", "Abdominaux"],
    equipment: "aucun",
    mode: "reps",
    steps: [
      {
        pose: "rotationRusseGauche",
        title: "Premier côté",
        detail:
          "Assis, buste incliné en arrière, pieds au sol ou décollés. Amenez les mains à côté de la hanche.",
      },
      {
        pose: "rotationRusseDroite",
        title: "Second côté",
        detail:
          "Tournez le buste de l'autre côté sans changer l'inclinaison du dos.",
      },
    ],
    cues: ["C'est le buste qui tourne, pas seulement les bras", "Décollez les pieds pour corser, posez-les pour alléger", "Dos droit et incliné, jamais arrondi"],
    mistakes: ["Dos arrondi", "Bras qui balaient pendant que le buste reste fixe", "Aller vite"],
    breathing: "Soufflez à chaque rotation.",
    easier: "crunch",
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
    impact: "saut",
    easier: "jack-sans-saut",
    lowImpact: { slug: "jack-sans-saut", note: "Un pied posé à la fois, sans jamais décoller." },
  },
  {
    slug: "jack-sans-saut",
    name: "Jack sans saut",
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
        pose: "jackOuvertSol",
        title: "Ouverture",
        detail:
          "Posez un pied sur le côté — sans sauter — en levant les bras au-dessus de la tête. Le deuxième pied reste au sol.",
      },
      {
        pose: "debout",
        title: "Fermeture",
        detail:
          "Ramenez le pied, redescendez les bras, puis recommencez de l'autre côté. On alterne le pied qui part.",
      },
    ],
    cues: [
      "Même travail que le jumping jack, sans bruit ni impact",
      "Les bras montent en entier : c'est eux qui font monter le souffle",
      "Pensez à alterner le pied qui s'écarte, sinon un côté travaille plus que l'autre",
    ],
    mistakes: [
      "Bras qui s'arrêtent aux épaules",
      "Rythme trop lent : ça reste un exercice de cardio",
    ],
    breathing: "Respiration rythmée et continue.",
    harder: "jumping-jack",
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
    impact: "saut",
    lowImpact: { note: "Marchez sur place en montant les genoux : un pied reste toujours au sol." },
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
    impact: "saut",
    lowImpact: { note: "Même mouvement en marchant, sans phase de course." },
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
    impact: "saut",
    lowImpact: { slug: "mollets", note: "Montées sur la pointe des pieds : même travail des mollets, aucun impact." },
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
    impact: "saut",
    lowImpact: { slug: "fente-arriere", note: "Pas latéral posé au lieu du bond, ou fente arrière." },
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
    impact: "saut",
    lowImpact: { slug: "grimpeur", note: "Sans le saut final : on se relève simplement." },
    easier: "grimpeur",
  },
  {
    slug: "boxe-sur-place",
    name: "Boxe sur place",
    category: "cardio",
    family: "cardio",
    level: 1,
    muscles: ["Cardio", "Épaules", "Gainage"],
    equipment: "aucun",
    mode: "time",
    steps: [
      {
        pose: "boxeGarde",
        title: "En garde",
        detail:
          "Debout, un pied légèrement en avant, poings au niveau du menton, coudes près du corps.",
      },
      {
        pose: "boxeDirect",
        title: "Le direct",
        detail:
          "Tendez un bras devant vous en tournant légèrement le buste, puis ramenez le poing en garde et changez de bras.",
      },
    ],
    cues: ["Silencieux, sans impact, et le souffle monte vite", "La rotation du buste fait le travail : ce n'est pas qu'un mouvement de bras", "Ne verrouillez jamais le coude en fin de mouvement"],
    mistakes: ["Coude tendu à fond", "Poings qui redescendent entre deux coups", "Rester figé sur les jambes"],
    breathing: "Soufflez brièvement à chaque coup.",
  },
  {
    slug: "genoux-croises",
    name: "Genoux croisés",
    category: "cardio",
    family: "cardio",
    level: 1,
    muscles: ["Cardio", "Obliques", "Abdominaux"],
    equipment: "aucun",
    mode: "time",
    steps: [
      {
        pose: "genouxCroisesA",
        title: "Premier côté",
        detail:
          "Debout, montez un genou vers le coude opposé en tournant légèrement le buste. Un pied reste au sol.",
      },
      {
        pose: "genouxCroisesB",
        title: "Second côté",
        detail:
          "Reposez et enchaînez de l'autre côté, à un rythme soutenu mais sans sauter.",
      },
    ],
    cues: ["Du cardio sans impact : un pied touche toujours le sol", "La rotation du buste ajoute le travail des obliques", "Montez le genou haut plutôt que de descendre le coude"],
    mistakes: ["Se pencher en avant pour aller chercher le genou", "Genou qui ne monte pas assez haut"],
    breathing: "Soufflez à chaque montée de genou.",
  },
  {
    slug: "squat-jack",
    name: "Squat jack",
    category: "cardio",
    family: "cardio",
    level: 2,
    muscles: ["Cardio", "Quadriceps", "Fessiers"],
    equipment: "aucun",
    mode: "time",
    steps: [
      {
        pose: "debout",
        title: "Position fermée",
        detail:
          "Debout, pieds joints, bras le long du corps.",
      },
      {
        pose: "squatSumoBas",
        title: "Le saut en squat",
        detail:
          "Sautez en écartant les pieds et descendez directement en squat, mains devant vous.",
      },
      {
        pose: "debout",
        title: "Retour",
        detail:
          "Sautez pour refermer les pieds et vous redresser. Enchaînez sans marquer d'arrêt.",
      },
    ],
    cues: ["Le jumping jack et le squat dans un seul mouvement : le souffle monte très vite", "Descendez vraiment en squat, sinon ce n'est qu'un jumping jack", "Réception souple, genoux qui plient dès le contact"],
    mistakes: ["Squat à peine esquissé", "Réception sur les talons", "Dos arrondi en bas"],
    breathing: "Soufflez en remontant.",
    easier: "squat-sumo",
    impact: "saut",
    lowImpact: { slug: "squat-sumo", note: "Écartez les pieds en les posant, puis descendez en squat sumo." },
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
  {
    slug: "cercles-epaules",
    name: "Cercles d'épaules",
    category: "mobilite",
    family: "mobilite",
    level: 1,
    muscles: ["Épaules", "Haut du dos"],
    equipment: "aucun",
    mode: "time",
    steps: [
      {
        pose: "cerclesEpaulesBas",
        title: "Bras bas",
        detail:
          "Debout, bras le long du corps, épaules relâchées.",
      },
      {
        pose: "cerclesEpaulesHaut",
        title: "Grand cercle",
        detail:
          "Montez les bras tendus sur les côtés jusqu'au-dessus de la tête, puis redescendez devant. Cercles lents et amples.",
      },
    ],
    cues: ["Le premier mouvement de tout échauffement du haut du corps", "Cherchez l'amplitude maximale, sans forcer sur la fin", "Dix cercles en avant, dix en arrière"],
    mistakes: ["Cercles trop rapides et trop petits", "Épaules qui remontent vers les oreilles"],
    breathing: "Inspirez en montant, soufflez en descendant.",
  },
  {
    slug: "etirement-pectoraux",
    name: "Étirement des pectoraux",
    category: "mobilite",
    family: "mobilite",
    level: 1,
    muscles: ["Pectoraux", "Épaules"],
    equipment: "mur",
    mode: "time",
    steps: [
      {
        pose: "etirementPectoraux",
        title: "La position",
        detail:
          "Debout à côté d'un mur, posez la paume et l'avant-bras dessus, coude à hauteur d'épaule. Tournez doucement le buste dans l'autre sens.",
      },
      {
        pose: "etirementPectoraux",
        title: "Tenir",
        detail:
          "Tenez trente secondes en respirant, puis changez de côté.",
      },
    ],
    cues: ["L'antidote de la position assise et des heures devant un écran", "Tournez le buste plutôt que de pousser sur l'épaule", "Étirement franc mais jamais douloureux : aucune sensation dans l'articulation elle-même"],
    mistakes: ["Coude trop haut, ce qui pince l'épaule", "Forcer jusqu'à la douleur"],
    breathing: "Respiration lente et profonde.",
  },
  {
    slug: "etirement-mollets",
    name: "Étirement des mollets",
    category: "mobilite",
    family: "mobilite",
    level: 1,
    muscles: ["Mollets"],
    equipment: "mur",
    mode: "time",
    steps: [
      {
        pose: "etirementMollets",
        title: "La position",
        detail:
          "Mains sur un mur, une jambe reculée et tendue, talon bien à plat au sol, jambe avant fléchie.",
      },
      {
        pose: "etirementMollets",
        title: "Tenir",
        detail:
          "Avancez le bassin jusqu'à sentir l'étirement derrière le mollet arrière. Tenez trente secondes, puis changez.",
      },
    ],
    cues: ["Le talon arrière reste collé au sol : sans cela, l'étirement n'a pas lieu", "Pied arrière droit devant, pas tourné vers l'extérieur", "À faire après chaque séance qui contient des sauts ou du cardio"],
    mistakes: ["Talon arrière qui décolle", "Pied arrière tourné", "À-coups au lieu d'une position tenue"],
    breathing: "Respiration lente.",
  },
  {
    slug: "etirement-fessier",
    name: "Étirement du fessier",
    category: "mobilite",
    family: "mobilite",
    level: 1,
    muscles: ["Fessiers", "Hanches"],
    equipment: "aucun",
    mode: "time",
    steps: [
      {
        pose: "etirementFessier",
        title: "La position",
        detail:
          "Sur le dos, posez une cheville sur le genou opposé pour former un chiffre quatre, puis attrapez la cuisse et tirez-la vers vous.",
      },
      {
        pose: "etirementFessier",
        title: "Tenir",
        detail:
          "Tenez trente secondes en gardant la tête au sol et les épaules relâchées, puis changez de côté.",
      },
    ],
    cues: ["L'étirement le plus utile quand on reste assis toute la journée", "La tête reste posée : inutile de relever la nuque pour tirer plus fort", "Poussez doucement le genou du dessus vers l'extérieur pour renforcer l'étirement"],
    mistakes: ["Relever la tête et les épaules", "Tirer par à-coups"],
    breathing: "Respiration lente et profonde.",
  },
  {
    slug: "rotation-thoracique",
    name: "Rotation du haut du dos",
    category: "mobilite",
    family: "mobilite",
    level: 1,
    muscles: ["Haut du dos", "Épaules"],
    equipment: "aucun",
    mode: "time",
    steps: [
      {
        pose: "quatrePattes",
        title: "Position de départ",
        detail:
          "À quatre pattes, mains sous les épaules, genoux sous les hanches.",
      },
      {
        pose: "rotationBras",
        title: "La rotation",
        detail:
          "Glissez un bras sous le corps, aussi loin que possible, en laissant l'épaule et la tempe venir vers le sol.",
      },
      {
        pose: "quatrePattes",
        title: "Retour",
        detail:
          "Revenez lentement et changez de côté. Cinq passages de chaque côté suffisent.",
      },
    ],
    cues: ["Cible le haut du dos, la zone qui se raidit le plus vite en position assise", "Le bassin reste haut et immobile : seule la cage thoracique tourne", "Mouvement lent, sans jamais forcer"],
    mistakes: ["Bassin qui s'affaisse d'un côté", "Aller vite"],
    breathing: "Soufflez en glissant le bras, inspirez en revenant.",
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
