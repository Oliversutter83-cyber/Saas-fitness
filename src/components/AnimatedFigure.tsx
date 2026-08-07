"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Figure } from "@/components/Figure";
import { getPose, type P, type Pose, type PoseName } from "@/content/poses";

/**
 * Anime réellement le mouvement : au lieu de sauter d'une image à l'autre, on
 * interpole les positions des articulations entre deux postures. Le bonhomme
 * descend et remonte comme sur une vraie démonstration — sans vidéo à tourner.
 *
 * L'aller-retour (aller jusqu'à la dernière posture puis revenir) reproduit le
 * geste d'une répétition, avec une courte pause aux extrémités pour marquer les
 * positions clés.
 */

/**
 * Rythme du geste. La pause aux extrémités est volontairement longue : c'est
 * elle qui laisse voir la position basse et la position haute, les deux
 * moments où l'on comprend le mouvement.
 */
const SEGMENT_MS = 900;
const HOLD_MS = 600;

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpPoint(a: P, b: P, t: number): P {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
}

function lerpPose(a: Pose, b: Pose, t: number): Pose {
  return {
    head: lerpPoint(a.head, b.head, t),
    neck: lerpPoint(a.neck, b.neck, t),
    hip: lerpPoint(a.hip, b.hip, t),
    armA: [lerpPoint(a.armA[0], b.armA[0], t), lerpPoint(a.armA[1], b.armA[1], t)],
    armB: [lerpPoint(a.armB[0], b.armB[0], t), lerpPoint(a.armB[1], b.armB[1], t)],
    legA: [lerpPoint(a.legA[0], b.legA[0], t), lerpPoint(a.legA[1], b.legA[1], t)],
    legB: [lerpPoint(a.legB[0], b.legB[0], t), lerpPoint(a.legB[1], b.legB[1], t)],
    // Les appuis (chaise, mur) ne bougent pas : on garde ceux de la posture
    // vers laquelle on va, pour qu'ils apparaissent dès le début du geste.
    props: b.props ?? a.props,
  };
}

/** Départ et arrivée ralentis, milieu rapide : ça donne un geste naturel. */
function ease(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function AnimatedFigure({
  poses,
  playing = true,
  className,
  onSegmentChange,
}: {
  poses: PoseName[];
  playing?: boolean;
  className?: string;
  /** Indice de la posture la plus proche, pour synchroniser la légende. */
  onSegmentChange?: (index: number) => void;
}) {
  const key = poses.join("|");
  const resolved = useMemo(() => poses.map(getPose), [key]); // eslint-disable-line react-hooks/exhaustive-deps

  // `null` tant que l'animation n'a pas produit d'image : on retombe alors sur
  // une posture fixe calculée au rendu, sans passer par un setState d'effet.
  const [animated, setAnimated] = useState<Pose | null>(null);
  const frameRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const lastSegment = useRef<number>(-1);

  useEffect(() => {
    if (!playing || resolved.length < 2) return;

    // Respect de « animations réduites » : on laisse la posture fixe.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const steps = resolved.length;
    // Aller-retour : 0 → n-1 → 0. On ne repasse pas par la première posture deux
    // fois de suite, d'où (steps - 1) * 2 segments par cycle.
    const segments = (steps - 1) * 2;
    const cycleMs = segments * (SEGMENT_MS + HOLD_MS);

    const tick = (now: number) => {
      if (!startRef.current) startRef.current = now;
      const elapsed = (now - startRef.current) % cycleMs;

      const segmentIndex = Math.floor(elapsed / (SEGMENT_MS + HOLD_MS));
      const inSegment = elapsed - segmentIndex * (SEGMENT_MS + HOLD_MS);
      const t = Math.min(1, inSegment / SEGMENT_MS);

      // Première moitié du cycle : on descend la liste. Seconde moitié : on remonte.
      const forward = segmentIndex < steps - 1;
      const from = forward ? segmentIndex : segments - segmentIndex;
      const to = forward ? segmentIndex + 1 : segments - segmentIndex - 1;

      setAnimated(lerpPose(resolved[from], resolved[to], ease(t)));

      const nearest = t < 0.5 ? from : to;
      if (nearest !== lastSegment.current) {
        lastSegment.current = nearest;
        onSegmentChange?.(nearest);
      }

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frameRef.current);
      startRef.current = 0;
      // Remise à la posture fixe à l'arrêt : le nettoyage est le bon endroit
      // pour ça, un setState en début d'effet relancerait un rendu en cascade.
      setAnimated(null);
    };
  }, [playing, resolved, onSegmentChange]);

  // Posture affichée quand l'animation est à l'arrêt : celle de l'effort
  // (deuxième étape) plutôt que la position de départ, plus parlante.
  const still = resolved[Math.min(1, resolved.length - 1)];

  return <Figure pose={animated ?? still} className={className} />;
}
