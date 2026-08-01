import { PersonalRecord, WorkoutTemplate } from '@/types/workout';

const DAY_KEYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isPlannedExercise(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return (
    isString(value.id) &&
    isString(value.name) &&
    isString(value.muscleGroup) &&
    isString(value.equipment) &&
    typeof value.sets === 'number' &&
    Number.isFinite(value.sets) &&
    value.sets >= 1
  );
}

function isWorkoutData(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return DAY_KEYS.every((day) => Array.isArray(value[day]) && value[day].every(isPlannedExercise));
}

function isBlockStructure(value: unknown): boolean {
  if (!isRecord(value)) return false;
  if (!Array.isArray(value.blocks)) return false;
  if (!value.blocks.every((b) => isRecord(b) && isString(b.id) && isString(b.label))) return false;
  if (!isRecord(value.dayIds)) return false;
  const dayIds = value.dayIds;
  return DAY_KEYS.every((day) => dayIds[day] === null || isString(dayIds[day]));
}

export function isWorkoutTemplate(value: unknown): value is WorkoutTemplate {
  if (!isRecord(value)) return false;
  return (
    isString(value.id) &&
    isString(value.name) &&
    isString(value.createdAt) &&
    isWorkoutData(value.data) &&
    (value.blockStructure === undefined || isBlockStructure(value.blockStructure))
  );
}

export function isPersonalRecord(value: unknown): value is PersonalRecord {
  if (!isRecord(value)) return false;
  return (
    isString(value.id) &&
    isString(value.exerciseId) &&
    isString(value.exerciseName) &&
    isString(value.date) &&
    isString(value.timestamp) &&
    typeof value.weight === 'number' &&
    Number.isFinite(value.weight) &&
    typeof value.reps === 'number' &&
    Number.isFinite(value.reps)
  );
}

export function isSessionProgress(value: unknown): value is Record<string, boolean[]> {
  if (!isRecord(value)) return false;
  return Object.values(value).every(
    (sets) => Array.isArray(sets) && sets.every((s) => typeof s === 'boolean'),
  );
}

export function filterValid<T>(values: T[], guard: (value: unknown) => value is T): T[] {
  return values.filter(guard);
}
