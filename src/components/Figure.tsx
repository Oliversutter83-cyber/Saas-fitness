import { GROUND_Y, getPose, type P, type Pose, type PoseName } from "@/content/poses";

/**
 * Dessine une posture. Les membres du côté opposé sont tracés en clair pour
 * donner du volume ; le tronc et la tête sont pleins.
 *
 * Les couleurs passent par des styles en ligne plutôt que par des classes :
 * le générateur de carrousels publicitaires sérialise ces SVG pour en faire des
 * PNG, et une feuille de styles externe ne survivrait pas à l'export.
 */

export type FigureColors = {
  stroke: string;
  strokeDim: string;
  prop: string;
};

const THEME_COLORS: FigureColors = {
  stroke: "var(--figure-stroke, #0d1412)",
  strokeDim: "var(--figure-stroke-dim, #a7b6b1)",
  prop: "var(--figure-prop, #e6ece9)",
};

function path(points: P[]) {
  return points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x} ${y}`).join(" ");
}

/** Petit segment de pied, orienté vers l'avant du corps. */
function Foot({ ankle, knee, color }: { ankle: P; knee: P; color: string }) {
  const onGround = ankle[1] > GROUND_Y - 14;
  // Pied posé : à plat vers l'avant. Pied en l'air : dans le prolongement du tibia.
  const [dx, dy] = onGround ? [11, 0] : [(ankle[0] - knee[0]) * 0.5, (ankle[1] - knee[1]) * 0.5];
  return (
    <line
      x1={ankle[0]}
      y1={ankle[1]}
      x2={ankle[0] + dx}
      y2={ankle[1] + dy}
      style={{ stroke: color }}
      strokeWidth={6}
      strokeLinecap="round"
    />
  );
}

function Limb({
  from,
  joints,
  color,
  width,
}: {
  from: P;
  joints: [P, P];
  color: string;
  width: number;
}) {
  return (
    <path
      d={path([from, joints[0], joints[1]])}
      style={{ stroke: color, fill: "none" }}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

/** Le contenu du dessin, sans balise <svg> : réutilisable imbriqué. */
export function FigureBody({
  pose,
  colors = THEME_COLORS,
  showGround = true,
}: {
  pose: PoseName | Pose;
  colors?: FigureColors;
  showGround?: boolean;
}) {
  const p = typeof pose === "string" ? getPose(pose) : pose;

  return (
    <g>
      {/* Appuis : chaise, marche, mur */}
      {p.props?.map((prop, i) =>
        prop.kind === "box" ? (
          <rect
            key={i}
            x={prop.x}
            y={prop.y}
            width={prop.w}
            height={prop.h}
            rx={3}
            style={{ fill: colors.prop, stroke: colors.strokeDim }}
            strokeWidth={2}
          />
        ) : (
          <line
            key={i}
            x1={prop.x}
            y1={14}
            x2={prop.x}
            y2={GROUND_Y}
            style={{ stroke: colors.strokeDim }}
            strokeWidth={4}
            strokeLinecap="round"
          />
        ),
      )}

      {showGround && (
        <line
          x1={6}
          y1={GROUND_Y}
          x2={194}
          y2={GROUND_Y}
          style={{ stroke: colors.strokeDim }}
          strokeWidth={3}
          strokeLinecap="round"
        />
      )}

      {/* Côté opposé d'abord : il passe derrière le corps */}
      <Limb from={p.neck} joints={p.armB} color={colors.strokeDim} width={7} />
      <Limb from={p.hip} joints={p.legB} color={colors.strokeDim} width={7} />
      <Foot ankle={p.legB[1]} knee={p.legB[0]} color={colors.strokeDim} />

      {/* Tronc */}
      <line
        x1={p.neck[0]}
        y1={p.neck[1]}
        x2={p.hip[0]}
        y2={p.hip[1]}
        style={{ stroke: colors.stroke }}
        strokeWidth={11}
        strokeLinecap="round"
      />

      {/* Côté proche */}
      <Limb from={p.hip} joints={p.legA} color={colors.stroke} width={8} />
      <Foot ankle={p.legA[1]} knee={p.legA[0]} color={colors.stroke} />
      <Limb from={p.neck} joints={p.armA} color={colors.stroke} width={8} />

      {/* Tête */}
      <circle cx={p.head[0]} cy={p.head[1]} r={13} style={{ fill: colors.stroke }} />
    </g>
  );
}

export function Figure({
  pose,
  className,
  colors,
  showGround = true,
}: {
  pose: PoseName | Pose;
  className?: string;
  colors?: FigureColors;
  showGround?: boolean;
}) {
  return (
    // Cadrage resserré sur le personnage : le repère fait 200x200 mais les
    // postures n'occupent jamais les bords, et un cadrage large donne des
    // silhouettes minuscules dans les vignettes.
    <svg viewBox="16 10 168 174" className={className} role="img" aria-hidden="true">
      <FigureBody pose={pose} colors={colors} showGround={showGround} />
    </svg>
  );
}
