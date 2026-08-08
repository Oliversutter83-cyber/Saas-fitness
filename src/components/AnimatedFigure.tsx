"use client";

import { Figure } from "@/components/Figure";
import { useAnimatedPose } from "@/components/useAnimatedPose";
import { type PoseName } from "@/content/poses";

/**
 * Anime réellement le mouvement : au lieu de sauter d'une image à l'autre, on
 * interpole les positions des articulations entre deux postures. Le bonhomme
 * descend et remonte comme sur une vraie démonstration — sans vidéo à tourner.
 *
 * Le calcul du geste vit dans `useAnimatedPose`, partagé avec la vue en volume.
 */
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
  const pose = useAnimatedPose(poses, playing, onSegmentChange);
  return <Figure pose={pose} className={className} />;
}
