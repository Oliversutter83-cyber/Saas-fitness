/**
 * Bibliothèque de postures.
 *
 * Chaque posture est un bonhomme articulé décrit par les coordonnées de ses
 * articulations dans un repère de 200x200, sol à y=178. Le personnage est vu
 * de profil, tourné vers la droite.
 *
 * Les membres "A" sont ceux du côté proche (tracés en plein), les membres "B"
 * ceux du côté opposé (tracés en clair) : ça donne la profondeur sans dessin.
 *
 * Une posture réutilisable sert à plusieurs exercices (une pompe classique et
 * une pompe prise large partagent la même silhouette), d'où cette bibliothèque
 * séparée du catalogue d'exercices.
 */

export type P = [number, number];

export type Prop =
  /** Chaise, marche, canapé, table basse : un appui rectangulaire. */
  | { kind: "box"; x: number; y: number; w: number; h: number }
  /** Mur vertical. */
  | { kind: "wall"; x: number };

export type Pose = {
  head: P;
  neck: P;
  hip: P;
  /** [coude, main] */
  armA: [P, P];
  armB: [P, P];
  /** [genou, pied] */
  legA: [P, P];
  legB: [P, P];
  props?: Prop[];
};

export const GROUND_Y = 178;

const poses = {
  // ---------------------------------------------------------------- debout
  // Les postures debout sont vues de trois quarts plutôt que de profil strict :
  // de profil, bras et jambes se superposent exactement au tronc et la
  // silhouette devient un simple trait illisible.
  debout: {
    head: [100, 38],
    neck: [100, 56],
    hip: [100, 106],
    armA: [[114, 80], [119, 106]],
    armB: [[86, 80], [81, 106]],
    legA: [[110, 142], [112, 178]],
    legB: [[90, 142], [88, 178]],
  },
  // Position ouverte du jumping jack : c'est le moment où l'on est EN L'AIR.
  //
  // Trois contraintes se croisent ici :
  // — la cheville doit rester au-dessus de GROUND_Y - 14, sinon le pied est
  //   dessiné à plat comme s'il touchait le sol ;
  // — le pied en l'air prolonge le tibia sur la moitié de sa longueur, donc une
  //   jambe trop verticale ramène la pointe jusqu'au sol et le saut ne se voit
  //   plus : les jambes sont franchement écartées, pas seulement levées ;
  // — la zone visible s'arrête à y = 10, d'où les bras en V plutôt qu'à la
  //   verticale, qui sortiraient du cadre.
  brasEnCroix: {
    head: [100, 32],
    neck: [100, 50],
    hip: [100, 100],
    armA: [[116, 32], [128, 16]],
    armB: [[84, 32], [72, 16]],
    legA: [[120, 130], [143, 154]],
    legB: [[80, 130], [57, 154]],
  },

  // Même position ouverte, mais un pied posé : c'est le jack sans saut, pour
  // qui a des voisins en dessous ou des articulations sensibles. Le pas latéral
  // remplace le bond, les bras font le même trajet.
  jackOuvertSol: {
    head: [100, 40],
    neck: [100, 58],
    hip: [100, 108],
    armA: [[112, 36], [118, 16]],
    armB: [[88, 36], [82, 16]],
    legA: [[116, 144], [128, 178]],
    legB: [[84, 144], [72, 178]],
  },

  // ---------------------------------------------------------------- squat
  squatHaut: {
    head: [100, 40],
    neck: [100, 58],
    hip: [100, 108],
    armA: [[110, 74], [124, 68]],
    armB: [[108, 76], [122, 70]],
    legA: [[102, 142], [102, 178]],
    legB: [[98, 142], [98, 178]],
  },
  squatBas: {
    head: [86, 66],
    neck: [90, 82],
    hip: [80, 120],
    armA: [[104, 84], [120, 78]],
    armB: [[102, 86], [118, 80]],
    legA: [[110, 140], [100, 178]],
    legB: [[108, 142], [96, 178]],
  },
  // Chevilles remontées à 152 : à 158, la pointe de pied — qui prolonge le tibia
  // sur la moitié de sa longueur — redescendait à 4 px du sol et le saut ne se
  // lisait pas. Le corps, lui, ne bouge pas.
  squatSaut: {
    head: [100, 26],
    neck: [100, 44],
    hip: [100, 94],
    armA: [[118, 56], [130, 34]],
    armB: [[82, 58], [70, 36]],
    legA: [[114, 124], [126, 152]],
    legB: [[86, 126], [74, 154]],
  },
  chaiseMur: {
    head: [84, 66],
    neck: [84, 84],
    hip: [84, 124],
    armA: [[96, 100], [106, 120]],
    armB: [[94, 102], [104, 122]],
    legA: [[124, 126], [124, 178]],
    legB: [[122, 128], [122, 178]],
    props: [{ kind: "wall", x: 72 }],
  },
  molletsHaut: {
    head: [100, 30],
    neck: [100, 48],
    hip: [100, 98],
    armA: [[114, 72], [119, 98]],
    armB: [[86, 72], [81, 98]],
    legA: [[110, 134], [112, 168]],
    legB: [[90, 134], [88, 168]],
  },

  // ---------------------------------------------------------------- fentes
  fenteBas: {
    head: [100, 44],
    neck: [100, 62],
    hip: [100, 112],
    armA: [[106, 86], [106, 110]],
    armB: [[94, 86], [94, 110]],
    legA: [[128, 142], [128, 178]],
    legB: [[78, 158], [62, 178]],
  },
  fentePasArriere: {
    head: [100, 42],
    neck: [100, 60],
    hip: [100, 110],
    armA: [[106, 84], [106, 108]],
    armB: [[94, 84], [94, 108]],
    legA: [[102, 144], [102, 178]],
    legB: [[80, 146], [58, 166]],
  },
  bulgareHaut: {
    head: [110, 44],
    neck: [110, 62],
    hip: [110, 112],
    armA: [[116, 86], [116, 110]],
    armB: [[104, 86], [104, 110]],
    legA: [[126, 144], [126, 178]],
    legB: [[88, 146], [64, 138]],
    props: [{ kind: "box", x: 36, y: 138, w: 44, h: 40 }],
  },
  bulgareBas: {
    head: [108, 60],
    neck: [108, 78],
    hip: [106, 126],
    armA: [[114, 100], [114, 124]],
    armB: [[102, 100], [102, 124]],
    legA: [[132, 150], [126, 178]],
    legB: [[84, 160], [64, 138]],
    props: [{ kind: "box", x: 36, y: 138, w: 44, h: 40 }],
  },

  // ------------------------------------------------------------ sur le dos
  pontBas: {
    head: [58, 150],
    neck: [72, 158],
    hip: [116, 166],
    armA: [[92, 172], [110, 176]],
    armB: [[92, 174], [110, 178]],
    legA: [[146, 142], [154, 176]],
    legB: [[144, 144], [152, 176]],
  },
  pontHaut: {
    head: [58, 158],
    neck: [72, 164],
    hip: [116, 132],
    armA: [[92, 172], [110, 176]],
    armB: [[92, 174], [110, 178]],
    legA: [[148, 132], [154, 176]],
    legB: [[146, 134], [152, 176]],
  },
  crunchBas: {
    head: [58, 154],
    neck: [72, 160],
    hip: [116, 168],
    armA: [[70, 148], [62, 148]],
    armB: [[70, 150], [62, 150]],
    legA: [[146, 142], [154, 176]],
    legB: [[144, 144], [152, 176]],
  },
  crunchHaut: {
    head: [68, 132],
    neck: [80, 144],
    hip: [116, 168],
    armA: [[78, 130], [70, 126]],
    armB: [[78, 132], [70, 128]],
    legA: [[146, 142], [154, 176]],
    legB: [[144, 144], [152, 176]],
  },
  jambesBas: {
    head: [52, 160],
    neck: [66, 164],
    hip: [110, 172],
    armA: [[86, 176], [104, 178]],
    armB: [[86, 177], [104, 179]],
    legA: [[136, 168], [164, 164]],
    legB: [[134, 170], [162, 166]],
  },
  jambesHaut: {
    head: [52, 160],
    neck: [66, 164],
    hip: [110, 172],
    armA: [[86, 176], [104, 178]],
    armB: [[86, 177], [104, 179]],
    legA: [[118, 140], [124, 110]],
    legB: [[116, 142], [122, 112]],
  },
  deadbugDepart: {
    head: [52, 162],
    neck: [66, 166],
    hip: [110, 172],
    armA: [[70, 140], [76, 116]],
    armB: [[68, 142], [74, 118]],
    legA: [[122, 142], [126, 112]],
    legB: [[120, 144], [124, 114]],
  },
  deadbugTendu: {
    head: [52, 162],
    neck: [66, 166],
    hip: [110, 172],
    armA: [[54, 146], [38, 132]],
    armB: [[68, 142], [74, 118]],
    legA: [[122, 142], [126, 112]],
    legB: [[140, 168], [172, 166]],
  },
  hollow: {
    head: [62, 148],
    neck: [74, 154],
    hip: [110, 170],
    armA: [[64, 132], [52, 116]],
    armB: [[62, 134], [50, 118]],
    legA: [[140, 158], [168, 146]],
    legB: [[138, 160], [166, 148]],
  },

  // ---------------------------------------------------------- sur le ventre
  supermanBas: {
    head: [150, 164],
    neck: [136, 170],
    hip: [92, 174],
    armA: [[160, 170], [178, 168]],
    armB: [[158, 172], [176, 170]],
    legA: [[70, 176], [48, 174]],
    legB: [[70, 178], [48, 176]],
  },
  supermanHaut: {
    head: [150, 148],
    neck: [136, 158],
    hip: [92, 172],
    armA: [[160, 150], [178, 140]],
    armB: [[158, 152], [176, 142]],
    legA: [[70, 170], [48, 156]],
    legB: [[70, 172], [48, 158]],
  },

  // --------------------------------------------------------------- planche
  plancheHaute: {
    head: [164, 118],
    neck: [150, 126],
    hip: [104, 142],
    armA: [[150, 150], [150, 176]],
    armB: [[148, 152], [148, 178]],
    legA: [[76, 154], [50, 174]],
    legB: [[74, 156], [48, 176]],
  },
  plancheAvantBras: {
    head: [162, 128],
    neck: [148, 136],
    hip: [104, 150],
    armA: [[152, 158], [172, 176]],
    armB: [[150, 160], [170, 178]],
    legA: [[76, 160], [50, 175]],
    legB: [[74, 162], [48, 177]],
  },
  plancheLaterale: {
    head: [52, 110],
    neck: [64, 122],
    hip: [112, 148],
    armA: [[62, 150], [58, 176]],
    armB: [[70, 104], [74, 80]],
    legA: [[144, 162], [172, 176]],
    legB: [[142, 164], [170, 178]],
  },
  pompeBasse: {
    head: [162, 142],
    neck: [148, 150],
    hip: [104, 158],
    armA: [[161, 153], [150, 176]],
    armB: [[159, 155], [148, 178]],
    legA: [[76, 166], [50, 175]],
    legB: [[74, 167], [48, 177]],
  },
  pompeGenouxHaute: {
    head: [164, 118],
    neck: [150, 126],
    hip: [104, 146],
    armA: [[150, 150], [150, 176]],
    armB: [[148, 152], [148, 178]],
    legA: [[80, 176], [56, 162]],
    legB: [[78, 177], [54, 164]],
  },
  pompeGenouxBasse: {
    head: [162, 144],
    neck: [148, 152],
    hip: [104, 158],
    armA: [[160, 154], [150, 176]],
    armB: [[158, 156], [148, 178]],
    legA: [[80, 176], [56, 162]],
    legB: [[78, 177], [54, 164]],
  },
  pompeInclineeHaute: {
    head: [169, 92],
    neck: [155, 100],
    hip: [112, 124],
    armA: [[155, 120], [155, 138]],
    armB: [[153, 122], [153, 140]],
    legA: [[86, 146], [60, 174]],
    legB: [[84, 148], [58, 176]],
    props: [{ kind: "box", x: 132, y: 138, w: 46, h: 40 }],
  },
  pompeInclineeBasse: {
    head: [167, 116],
    neck: [153, 124],
    hip: [112, 138],
    armA: [[166, 126], [155, 138]],
    armB: [[164, 128], [153, 140]],
    legA: [[86, 154], [60, 176]],
    legB: [[84, 156], [58, 178]],
    props: [{ kind: "box", x: 132, y: 138, w: 46, h: 40 }],
  },
  piqueHaut: {
    head: [152, 112],
    neck: [140, 120],
    hip: [110, 84],
    armA: [[146, 150], [150, 176]],
    armB: [[144, 152], [148, 178]],
    legA: [[86, 130], [64, 175]],
    legB: [[84, 132], [62, 177]],
  },
  piqueBas: {
    head: [154, 152],
    neck: [144, 142],
    hip: [110, 90],
    armA: [[160, 150], [150, 176]],
    armB: [[158, 152], [148, 178]],
    legA: [[86, 132], [64, 176]],
    legB: [[84, 134], [62, 178]],
  },
  grimpeurA: {
    head: [164, 118],
    neck: [150, 126],
    hip: [104, 142],
    armA: [[150, 150], [150, 176]],
    armB: [[148, 152], [148, 178]],
    legA: [[118, 150], [132, 164]],
    legB: [[74, 156], [48, 176]],
  },
  grimpeurB: {
    head: [164, 118],
    neck: [150, 126],
    hip: [104, 142],
    armA: [[150, 150], [150, 176]],
    armB: [[148, 152], [148, 178]],
    legA: [[76, 154], [50, 174]],
    legB: [[116, 152], [130, 166]],
  },

  // ------------------------------------------------------------------ dips
  dipsHaut: {
    head: [80, 78],
    neck: [70, 92],
    hip: [92, 128],
    armA: [[70, 112], [70, 132]],
    armB: [[68, 114], [68, 134]],
    legA: [[130, 132], [152, 176]],
    legB: [[128, 134], [150, 178]],
    props: [{ kind: "box", x: 40, y: 132, w: 46, h: 46 }],
  },
  dipsBas: {
    head: [84, 110],
    neck: [74, 124],
    hip: [96, 156],
    armA: [[62, 152], [70, 132]],
    armB: [[60, 154], [68, 134]],
    legA: [[132, 150], [152, 176]],
    legB: [[130, 152], [150, 178]],
    props: [{ kind: "box", x: 40, y: 132, w: 46, h: 46 }],
  },

  // ---------------------------------------------------------------- cardio
  genouxHautsA: {
    head: [100, 38],
    neck: [100, 56],
    hip: [100, 106],
    armA: [[112, 78], [108, 58]],
    armB: [[88, 80], [92, 100]],
    legA: [[112, 110], [104, 136]],
    legB: [[100, 142], [100, 178]],
  },
  genouxHautsB: {
    head: [100, 38],
    neck: [100, 56],
    hip: [100, 106],
    armA: [[112, 80], [116, 100]],
    armB: [[88, 78], [92, 58]],
    legA: [[100, 142], [100, 178]],
    legB: [[112, 110], [104, 136]],
  },
  talonsFessesA: {
    head: [100, 38],
    neck: [100, 56],
    hip: [100, 106],
    armA: [[112, 78], [108, 58]],
    armB: [[88, 80], [92, 100]],
    legA: [[96, 144], [104, 116]],
    legB: [[102, 142], [102, 178]],
  },
  talonsFessesB: {
    head: [100, 38],
    neck: [100, 56],
    hip: [100, 106],
    armA: [[112, 80], [116, 100]],
    armB: [[88, 78], [92, 58]],
    legA: [[102, 142], [102, 178]],
    legB: [[96, 144], [104, 116]],
  },
  cordeBas: {
    head: [100, 38],
    neck: [100, 56],
    hip: [100, 106],
    armA: [[116, 82], [128, 74]],
    armB: [[84, 82], [72, 74]],
    legA: [[107, 142], [108, 178]],
    legB: [[93, 142], [92, 178]],
  },
  // La consigne dit « à peine décollé », et c'est juste : un vrai saut à la corde
  // fait 2 ou 3 cm. Mais à cette échelle le décollage devenait invisible, donc on
  // le force un peu — assez pour qu'on le voie, pas au point de contredire le
  // texte.
  cordeHaut: {
    head: [100, 28],
    neck: [100, 46],
    hip: [100, 96],
    armA: [[116, 72], [128, 64]],
    armB: [[84, 72], [72, 64]],
    legA: [[108, 128], [107, 156]],
    legB: [[92, 128], [93, 156]],
  },
  patineurGauche: {
    head: [86, 44],
    neck: [88, 62],
    hip: [92, 110],
    armA: [[70, 84], [56, 72]],
    armB: [[104, 86], [116, 74]],
    legA: [[96, 142], [92, 178]],
    legB: [[112, 140], [132, 164]],
  },
  patineurDroit: {
    head: [114, 44],
    neck: [112, 62],
    hip: [108, 110],
    armA: [[130, 84], [144, 72]],
    armB: [[96, 86], [84, 74]],
    legA: [[104, 142], [108, 178]],
    legB: [[88, 140], [68, 164]],
  },

  // ------------------------------------------------------------ étirements
  etirementIschios: {
    head: [126, 84],
    neck: [116, 94],
    hip: [88, 120],
    armA: [[112, 118], [126, 142]],
    armB: [[110, 120], [124, 144]],
    legA: [[92, 148], [96, 178]],
    legB: [[90, 150], [94, 178]],
  },
  etirementQuadriceps: {
    head: [100, 38],
    neck: [100, 56],
    hip: [100, 106],
    armA: [[88, 90], [80, 118]],
    armB: [[114, 82], [126, 76]],
    legA: [[106, 142], [108, 178]],
    legB: [[88, 142], [76, 116]],
  },
  etirementEnfant: {
    head: [152, 158],
    neck: [138, 152],
    hip: [92, 142],
    armA: [[160, 164], [180, 170]],
    armB: [[158, 166], [178, 172]],
    legA: [[100, 166], [74, 174]],
    legB: [[98, 168], [72, 176]],
  },
  etirementChat: {
    head: [156, 132],
    neck: [144, 130],
    hip: [96, 118],
    armA: [[146, 152], [148, 176]],
    armB: [[144, 154], [146, 178]],
    legA: [[92, 148], [88, 176]],
    legB: [[90, 150], [86, 178]],
  },
} as const satisfies Record<string, Pose>;

export type PoseName = keyof typeof poses;
export const POSES: Record<PoseName, Pose> = poses;

export function getPose(name: PoseName): Pose {
  return POSES[name];
}
