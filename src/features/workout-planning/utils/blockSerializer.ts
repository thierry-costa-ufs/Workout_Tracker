import type { WorkoutData } from '@/types/workout';
import { PlannedExercise } from '@/types/workout';
import { DAYS_OF_WEEK } from '@/core/constants/days';

export interface WorkoutBlock {
  id: string;
  label: string;
  exercises: PlannedExercise[];
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export function createId(): string {
  return `blk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createBlock(label: string): WorkoutBlock {
  return { id: createId(), label, exercises: [] };
}

export function getNextLabel(blocks: WorkoutBlock[]): string {
  const usedLabels = new Set(blocks.map((b) => b.label.toUpperCase()));
  const nextLetter = LETTERS.find((letter) => !usedLabels.has(letter));
  return nextLetter ?? `BLOCO ${blocks.length + 1}`;
}

function serializeExercises(list: PlannedExercise[] = []): string {
  return list.map((e) => `${e.id}:${e.sets}`).join('|');
}

export function reconstructFromWorkoutData(data: WorkoutData): {
  blocks: WorkoutBlock[];
  daySplit: Record<string, string | null>;
} {
  const blocks: WorkoutBlock[] = [];
  const daySplit: Record<string, string | null> = {};
  const signatureToBlockId = new Map<string, string>();
  let letterIndex = 0;

  DAYS_OF_WEEK.forEach((day) => {
    const list = data[day.id] || [];
    if (list.length === 0) {
      daySplit[day.id] = null;
      return;
    }

    const signature = serializeExercises(list);
    let blockId = signatureToBlockId.get(signature);

    if (!blockId) {
      const label = LETTERS[letterIndex] ?? `BLOCO ${letterIndex + 1}`;
      letterIndex += 1;
      const newBlock: WorkoutBlock = { id: createId(), label, exercises: list };
      blocks.push(newBlock);
      blockId = newBlock.id;
      signatureToBlockId.set(signature, blockId);
    }

    daySplit[day.id] = blockId;
  });

  if (blocks.length === 0) {
    blocks.push(createBlock('A'));
  }

  return { blocks, daySplit };
}
