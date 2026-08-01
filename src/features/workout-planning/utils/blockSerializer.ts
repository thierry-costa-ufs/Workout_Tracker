import type { BlockStructure, WorkoutData, WorkoutDayKey, PlannedExercise } from '@/types/workout';
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

export function buildBlockStructure(
  blocks: WorkoutBlock[],
  daySplit: Record<string, string | null>,
): BlockStructure {
  const dayIds = {} as Record<WorkoutDayKey, string | null>;
  DAYS_OF_WEEK.forEach((day) => {
    dayIds[day.id] = daySplit[day.id] ?? null;
  });
  return {
    blocks: blocks.map((b) => ({ id: b.id, label: b.label })),
    dayIds,
  };
}

export function reconstructFromBlockStructure(
  structure: BlockStructure,
  data: WorkoutData,
): { blocks: WorkoutBlock[]; daySplit: Record<string, string | null> } {
  const blocks: WorkoutBlock[] = [];
  const daySplit: Record<string, string | null> = {};
  const knownIds = new Set(structure.blocks.map((b) => b.id));
  const idToExercises = new Map<string, PlannedExercise[]>();

  DAYS_OF_WEEK.forEach((day) => {
    const blockId = structure.dayIds[day.id];
    if (!blockId || !knownIds.has(blockId)) {
      daySplit[day.id] = null;
      return;
    }
    if (!idToExercises.has(blockId)) {
      idToExercises.set(blockId, data[day.id] || []);
    }
    daySplit[day.id] = blockId;
  });

  structure.blocks.forEach((b) => {
    const exercises = idToExercises.get(b.id);
    // ponytail: exercises live only in data; a block with no assigned day is dropped
    if (exercises) blocks.push({ id: b.id, label: b.label, exercises });
  });

  if (blocks.length === 0) {
    blocks.push(createBlock('A'));
  }

  return { blocks, daySplit };
}

export function findDuplicateBlockSignatures(blocks: WorkoutBlock[]): WorkoutBlock[][] {
  const sigToBlocks = new Map<string, WorkoutBlock[]>();

  blocks.forEach((block) => {
    if (block.exercises.length === 0) return;
    const signature = serializeExercises(block.exercises);
    const group = sigToBlocks.get(signature) ?? [];
    group.push(block);
    sigToBlocks.set(signature, group);
  });

  return Array.from(sigToBlocks.values()).filter((group) => group.length > 1);
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
