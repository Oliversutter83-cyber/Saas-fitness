import { getExercise, type Exercise } from "@/content/exercises";
import { itemDurationSec, type Session } from "@/content/programs";

/**
 * Transforme une séance (blocs → tours → exercices) en une simple liste
 * d'étapes à dérouler. Le lecteur n'a alors plus qu'à avancer dans un tableau,
 * ce qui rend son état trivial : un index et un chronomètre.
 */

export type Entry =
  | {
      type: "work";
      exercise: Exercise;
      /** Durée en secondes, ou null quand l'exercice se compte en répétitions */
      seconds: number | null;
      reps: number | null;
      blockTitle: string;
      round: number;
      totalRounds: number;
      note?: string;
    }
  | {
      type: "rest";
      seconds: number;
      nextName: string;
      /** Vrai entre deux tours de circuit : le repos est plus long */
      betweenRounds: boolean;
    };

export function buildPlaylist(session: Session): Entry[] {
  const entries: Entry[] = [];

  session.blocks.forEach((block, blockIndex) => {
    for (let round = 1; round <= block.rounds; round++) {
      block.items.forEach((item, itemIndex) => {
        const exercise = getExercise(item.exercise);

        entries.push({
          type: "work",
          exercise,
          seconds: item.seconds ?? null,
          reps: item.reps ?? null,
          blockTitle: block.title,
          round,
          totalRounds: block.rounds,
          note: item.note,
        });

        const isLastItem = itemIndex === block.items.length - 1;
        const isLastRound = round === block.rounds;
        const isLastBlock = blockIndex === session.blocks.length - 1;

        // Pas de repos après le tout dernier exercice de la séance.
        if (isLastItem && isLastRound && isLastBlock) return;

        const nextName = nextExerciseName(session, blockIndex, round, itemIndex);
        if (isLastItem && !isLastRound) {
          if (block.restBetweenRoundsSec > 0) {
            entries.push({
              type: "rest",
              seconds: block.restBetweenRoundsSec,
              nextName,
              betweenRounds: true,
            });
          }
        } else if (item.restSec > 0) {
          entries.push({
            type: "rest",
            seconds: item.restSec,
            nextName,
            betweenRounds: false,
          });
        }
      });
    }
  });

  return entries;
}

function nextExerciseName(
  session: Session,
  blockIndex: number,
  round: number,
  itemIndex: number,
): string {
  const block = session.blocks[blockIndex];

  if (itemIndex + 1 < block.items.length) {
    return getExercise(block.items[itemIndex + 1].exercise).name;
  }
  if (round < block.rounds) {
    return `${getExercise(block.items[0].exercise).name} (tour ${round + 1})`;
  }
  const nextBlock = session.blocks[blockIndex + 1];
  return nextBlock ? getExercise(nextBlock.items[0].exercise).name : "Fin de séance";
}

/** Durée totale prévisible, repos compris. */
export function playlistDurationSec(session: Session): number {
  return session.blocks.reduce((total, block) => {
    const perRound = block.items.reduce(
      (sum, item) => sum + itemDurationSec(item) + item.restSec,
      0,
    );
    return total + perRound * block.rounds + block.restBetweenRoundsSec * (block.rounds - 1);
  }, 0);
}

export function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
