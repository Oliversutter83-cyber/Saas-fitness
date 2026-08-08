import { GROUND_Y, getPose, type P, type Pose, type PoseName, type Prop } from "@/content/poses";

/**
 * Passage des postures plates à des postures en volume.
 *
 * L'ordre des opérations compte, et c'est tout l'intérêt de ce fichier séparé :
 * on met chaque posture en volume D'ABORD, on interpole ENSUITE. L'inverse
 * paraissait plus simple mais donnait des mouvements faux — une fente enchaînée
 * depuis la position debout héritait de l'écart latéral de celle-ci, et les
 * jambes partaient sur les côtés au lieu de l'avant et de l'arrière. Une fois la
 * posture en volume, il n'y a plus d'ambiguïté à propager : ce ne sont que des
 * points dans l'espace.
 */

export type Pt3 = { x: number; y: number; z: number };

export type Pose3D = {
  head: Pt3;
  neck: Pt3;
  hip: Pt3;
  /** Extrémités de la barre d'épaules et de la barre de bassin */
  shoulderA: Pt3;
  shoulderB: Pt3;
  hipA: Pt3;
  hipB: Pt3;
  armA: [Pt3, Pt3];
  armB: [Pt3, Pt3];
  legA: [Pt3, Pt3];
  legB: [Pt3, Pt3];
  /** Pointe du pied, calculée avant l'interpolation pour rester cohérente */
  footA: Pt3;
  footB: Pt3;
  props?: Prop[];
};

/** Demi-largeur des épaules et du bassin, dans le repère du dessin. */
const SHOULDER = 13;
const HIP = 9;

/**
 * Place une paire de membres dans l'espace.
 *
 * Par défaut chaque membre garde son abscisse et s'écarte d'une demi-largeur
 * d'épaules ou de bassin : c'est la lecture juste pour toutes les postures vues
 * de profil, y compris les postures asymétriques où un membre part devant et
 * l'autre derrière.
 *
 * Quand la posture déclare un écart latéral, l'écart horizontal entre A et B
 * est au contraire reporté sur la profondeur, et les deux membres se retrouvent
 * alignés sur le tronc — ce qui est la réalité d'un squat sumo ou d'un
 * jumping jack.
 */
function placePair(
  a: [P, P],
  b: [P, P],
  base: number,
  lateral: boolean,
): [[Pt3, Pt3], [Pt3, Pt3]] {
  const toA: Pt3[] = [];
  const toB: Pt3[] = [];
  for (let i = 0; i < 2; i++) {
    if (lateral) {
      const commun = (a[i][0] + b[i][0]) / 2;
      const ecart = (a[i][0] - b[i][0]) / 2;
      const profondeur = Math.max(base, Math.abs(ecart)) * (ecart < 0 ? -1 : 1);
      toA.push({ x: commun, y: a[i][1], z: profondeur });
      toB.push({ x: commun, y: b[i][1], z: -profondeur });
    } else {
      toA.push({ x: a[i][0], y: a[i][1], z: base });
      toB.push({ x: b[i][0], y: b[i][1], z: -base });
    }
  }
  return [toA as [Pt3, Pt3], toB as [Pt3, Pt3]];
}

/** Pied posé à plat vers l'avant, ou dans le prolongement du tibia en l'air. */
function footTip(leg: [P, P], ankle: Pt3): Pt3 {
  const [knee, plat] = leg;
  const auSol = plat[1] > GROUND_Y - 14;
  const [dx, dy] = auSol ? [11, 0] : [(plat[0] - knee[0]) * 0.5, (plat[1] - knee[1]) * 0.5];
  return { x: ankle.x + dx, y: ankle.y + dy, z: ankle.z };
}

export function lift(pose: PoseName | Pose): Pose3D {
  const p = typeof pose === "string" ? getPose(pose) : pose;
  const hands = p.spread?.hands ?? 1;
  const feet = p.spread?.feet ?? 1;

  const [armA, armB] = placePair(p.armA, p.armB, SHOULDER * hands, p.axis?.arms === "lateral");
  const [legA, legB] = placePair(p.legA, p.legB, HIP * feet, p.axis?.legs === "lateral");

  return {
    head: { x: p.head[0], y: p.head[1], z: 0 },
    neck: { x: p.neck[0], y: p.neck[1], z: 0 },
    hip: { x: p.hip[0], y: p.hip[1], z: 0 },
    shoulderA: { x: p.neck[0], y: p.neck[1], z: SHOULDER },
    shoulderB: { x: p.neck[0], y: p.neck[1], z: -SHOULDER },
    hipA: { x: p.hip[0], y: p.hip[1], z: HIP },
    hipB: { x: p.hip[0], y: p.hip[1], z: -HIP },
    armA,
    armB,
    legA,
    legB,
    footA: footTip(p.legA, legA[1]),
    footB: footTip(p.legB, legB[1]),
    props: p.props ? [...p.props] : undefined,
  };
}

function lerpPt(a: Pt3, b: Pt3, t: number): Pt3 {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    z: a.z + (b.z - a.z) * t,
  };
}

export function lerpPose3D(a: Pose3D, b: Pose3D, t: number): Pose3D {
  return {
    head: lerpPt(a.head, b.head, t),
    neck: lerpPt(a.neck, b.neck, t),
    hip: lerpPt(a.hip, b.hip, t),
    shoulderA: lerpPt(a.shoulderA, b.shoulderA, t),
    shoulderB: lerpPt(a.shoulderB, b.shoulderB, t),
    hipA: lerpPt(a.hipA, b.hipA, t),
    hipB: lerpPt(a.hipB, b.hipB, t),
    armA: [lerpPt(a.armA[0], b.armA[0], t), lerpPt(a.armA[1], b.armA[1], t)],
    armB: [lerpPt(a.armB[0], b.armB[0], t), lerpPt(a.armB[1], b.armB[1], t)],
    legA: [lerpPt(a.legA[0], b.legA[0], t), lerpPt(a.legA[1], b.legA[1], t)],
    legB: [lerpPt(a.legB[0], b.legB[0], t), lerpPt(a.legB[1], b.legB[1], t)],
    footA: lerpPt(a.footA, b.footA, t),
    footB: lerpPt(a.footB, b.footB, t),
    // Les appuis ne bougent pas : on garde ceux de la posture d'arrivée pour
    // qu'ils apparaissent dès le début du geste.
    props: b.props ?? a.props,
  };
}
