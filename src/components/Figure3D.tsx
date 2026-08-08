"use client";

import { useEffect, useRef, useState } from "react";
import { GROUND_Y } from "@/content/poses";
import { type Pose3D, type Pt3 } from "@/content/poses3d";

/**
 * Vue en volume du personnage : on tourne autour pour le voir de face, de dos
 * et des deux côtés.
 *
 * D'où vient la profondeur. Les postures sont décrites à plat, mais elles
 * distinguent déjà le membre du côté proche (« A ») de celui du côté opposé
 * (« B »). Cette information suffit à reconstruire une troisième dimension : le
 * tronc reste au centre, un côté passe devant, l'autre derrière. On y ajoute
 * une barre d'épaules et une barre de bassin, qui n'existaient pas à plat et
 * qui donnent au personnage sa largeur.
 *
 * Le piège, et comment il est traité. L'axe horizontal du dessin porte deux
 * informations que rien ne distingue dans les coordonnées : l'écart avant-
 * arrière d'une fente, et l'écart gauche-droite d'un squat sumo. Tourner sans
 * les séparer transformerait la fente en grand écart. Chaque posture déclare
 * donc, quand c'est nécessaire, que son écart est latéral (voir `Axis` dans la
 * bibliothèque de postures) ; l'écart est alors reporté sur l'axe de
 * profondeur, et le mouvement reste juste sous tous les angles.
 *
 * Ce que ça montre et que le dessin plat cache : l'écartement des mains — une
 * pompe diamant et une pompe prise large ont la même silhouette de profil —,
 * l'alignement des genoux sur les pieds, et la symétrie droite-gauche.
 */

/** Distance de l'œil : plus elle est courte, plus la perspective est marquée. */
const EYE = 460;

const CX = 100;
const CY = 96;

const THEME = {
  stroke: "var(--figure-stroke, #0d1412)",
  strokeDim: "var(--figure-stroke-dim, #a7b6b1)",
};

/** Rotation autour de l'axe vertical, puis projection en perspective. */
function project(p: Pt3, angle: number) {
  const dx = p.x - CX;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const x = dx * cos + p.z * sin;
  const z = -dx * sin + p.z * cos;
  const scale = EYE / (EYE + z);
  return { x: CX + x * scale, y: CY + (p.y - CY) * scale, z, scale };
}

type Seg = { points: Pt3[]; width: number; kind: "corps" | "appui" | "sol" };

function segments(pose: Pose3D): Seg[] {
  const segs: Seg[] = [
    // Le sol : un rectangle plutôt qu'une ligne, sinon la profondeur ne se lit pas.
    { points: [{ x: 12, y: GROUND_Y, z: 50 }, { x: 188, y: GROUND_Y, z: 50 }], width: 2, kind: "sol" },
    { points: [{ x: 12, y: GROUND_Y, z: -50 }, { x: 188, y: GROUND_Y, z: -50 }], width: 2, kind: "sol" },
    { points: [{ x: 12, y: GROUND_Y, z: -50 }, { x: 12, y: GROUND_Y, z: 50 }], width: 2, kind: "sol" },
    { points: [{ x: 188, y: GROUND_Y, z: -50 }, { x: 188, y: GROUND_Y, z: 50 }], width: 2, kind: "sol" },

    { points: [pose.shoulderB, pose.shoulderA], width: 8, kind: "corps" },
    { points: [pose.hipB, pose.hipA], width: 8, kind: "corps" },
    { points: [pose.neck, pose.hip], width: 11, kind: "corps" },

    { points: [pose.shoulderA, ...pose.armA], width: 8, kind: "corps" },
    { points: [pose.shoulderB, ...pose.armB], width: 8, kind: "corps" },
    { points: [pose.hipA, ...pose.legA], width: 8, kind: "corps" },
    { points: [pose.hipB, ...pose.legB], width: 8, kind: "corps" },

    { points: [pose.legA[1], pose.footA], width: 6, kind: "corps" },
    { points: [pose.legB[1], pose.footB], width: 6, kind: "corps" },
  ];

  for (const prop of pose.props ?? []) {
    if (prop.kind === "box") {
      const { x, y, w, h } = prop;
      for (const z of [40, -40]) {
        segs.push({ points: [{ x, y, z }, { x: x + w, y, z }], width: 3, kind: "appui" });
        segs.push({ points: [{ x, y, z }, { x, y: y + h, z }], width: 3, kind: "appui" });
        segs.push({ points: [{ x: x + w, y, z }, { x: x + w, y: y + h, z }], width: 3, kind: "appui" });
      }
      segs.push({ points: [{ x, y, z: -40 }, { x, y, z: 40 }], width: 3, kind: "appui" });
      segs.push({ points: [{ x: x + w, y, z: -40 }, { x: x + w, y, z: 40 }], width: 3, kind: "appui" });
    } else {
      for (const z of [46, -46]) {
        segs.push({ points: [{ x: prop.x, y: 20, z }, { x: prop.x, y: GROUND_Y, z }], width: 3, kind: "appui" });
      }
      segs.push({
        points: [{ x: prop.x, y: 20, z: -46 }, { x: prop.x, y: 20, z: 46 }],
        width: 3,
        kind: "appui",
      });
    }
  }

  return segs;
}

/** Ce qui est loin s'éclaircit : c'est ce qui donne le relief. */
function shade(z: number, kind: Seg["kind"]) {
  if (kind !== "corps") return THEME.strokeDim;
  return z > 0 ? THEME.strokeDim : THEME.stroke;
}

export function Figure3D({
  pose,
  angle,
  className,
}: {
  pose: Pose3D;
  angle: number;
  className?: string;
}) {
  const segs = segments(pose)
    .map((seg) => {
      const projected = seg.points.map((p) => project(p, angle));
      const depth = projected.reduce((sum, p) => sum + p.z, 0) / projected.length;
      return { seg, projected, depth };
    })
    // Tri du fond vers l'avant : sans ça, un bras arrière passerait devant le tronc.
    .sort((a, b) => b.depth - a.depth);

  const head = project(pose.head, angle);

  return (
    <svg viewBox="16 10 168 174" className={className} role="img" aria-hidden="true">
      {segs.map(({ seg, projected, depth }, i) => (
        <polyline
          key={i}
          points={projected.map((p) => `${p.x},${p.y}`).join(" ")}
          style={{ stroke: shade(depth, seg.kind), fill: "none" }}
          strokeWidth={seg.width * (seg.kind === "corps" ? projected[0].scale : 1)}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={seg.kind === "sol" ? 0.45 : 1}
        />
      ))}
      <circle cx={head.x} cy={head.y} r={13 * head.scale} style={{ fill: THEME.stroke }} />
    </svg>
  );
}

const TOUR = Math.PI * 2;

/** Les quatre points de vue utiles, dans l'ordre où on tourne autour. */
export const VUES = [
  { label: "Profil", angle: 0 },
  { label: "Face", angle: Math.PI / 2 },
  { label: "Autre profil", angle: Math.PI },
  { label: "Dos", angle: -Math.PI / 2 },
] as const;

/**
 * Vue en volume pilotable : on fait tourner le personnage au doigt, ou d'un
 * appui sur l'un des quatre points de vue. Sans intervention il tourne
 * lentement sur lui-même — c'est ce mouvement qui signale qu'on peut l'attraper,
 * sans avoir à l'écrire.
 */
export function OrbitFigure3D({ pose, className }: { pose: Pose3D; className?: string }) {
  const [angle, setAngle] = useState(0);
  const [libre, setLibre] = useState(true);
  const dragRef = useRef<{ x: number; angle: number } | null>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    if (!libre) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    let last = 0;
    const tick = (now: number) => {
      if (last) setAngle((a) => (a + ((now - last) / 1000) * 0.5) % TOUR);
      last = now;
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [libre]);

  return (
    // Colonne : le dessin prend toute la place restante, la rangée de points de
    // vue garde la sienne. Sans `min-h-0`, le dessin déborderait du cadre et se
    // ferait rogner par les boutons.
    <div className={`flex flex-col ${className ?? ""}`}>
      <div
        className="min-h-0 flex-1 cursor-ew-resize touch-pan-y select-none"
        onPointerDown={(e) => {
          // `angle` vient du rendu courant, il est donc déjà à jour : inutile de
          // le doubler d'une référence.
          dragRef.current = { x: e.clientX, angle };
          setLibre(false);
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          const drag = dragRef.current;
          if (!drag) return;
          setAngle(drag.angle + ((e.clientX - drag.x) / 120) * (Math.PI / 2));
        }}
        onPointerUp={() => {
          dragRef.current = null;
        }}
        onPointerCancel={() => {
          dragRef.current = null;
        }}
      >
        <Figure3D pose={pose} angle={angle} className="h-full w-full" />
      </div>

      <div className="mt-2 flex shrink-0 flex-wrap justify-center gap-1.5">
        {VUES.map((vue) => (
          <button
            key={vue.label}
            type="button"
            onClick={() => {
              setLibre(false);
              setAngle(vue.angle);
            }}
            className="rounded-full bg-white/5 px-3 py-1 text-[0.7rem] font-bold text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            {vue.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setLibre((v) => !v)}
          aria-pressed={libre}
          className={`rounded-full px-3 py-1 text-[0.7rem] font-bold transition ${
            libre ? "bg-brand-400/20 text-brand-200" : "bg-white/5 text-white/70 hover:bg-white/10"
          }`}
        >
          ↻ Tourner
        </button>
      </div>
    </div>
  );
}
