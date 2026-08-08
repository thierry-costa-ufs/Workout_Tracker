import { PersonalRecord, WorkoutTemplate } from '@/types/workout';

const DAY_KEYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];

const LIMITS = { weightMax: 2000, repsMax: 500, setsMax: 100, nameMax: 80, labelMax: 40 };

const MUSCLE_GROUPS: Set<string> = new Set([
  'Peito',
  'Costas',
  'Ombro',
  'Quadríceps',
  'Posterior',
  'Panturrilha',
  'Bíceps',
  'Tríceps',
  'Antebraço',
  'Trapézio',
  'Abdômen',
]);

const EQUIPMENT: Set<string> = new Set(['Barra', 'Halter', 'Polia', 'Máquina', 'Peso Corporal']);

const MECHANIC: Set<string> = new Set(['Composto', 'Isolado']);

// ponytail: no integer check for weight — app supports fractional weight (82.5)
const isInRange = (n: unknown, min: number, max: number) =>
  typeof n === 'number' && Number.isFinite(n) && Number.isInteger(n) && n >= min && n <= max;

const isWeight = (n: unknown) =>
  typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= LIMITS.weightMax;

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
    value.id.length <= LIMITS.nameMax &&
    isString(value.name) &&
    value.name.length <= LIMITS.nameMax &&
    isString(value.muscleGroup) &&
    MUSCLE_GROUPS.has(value.muscleGroup) &&
    isString(value.equipment) &&
    EQUIPMENT.has(value.equipment) &&
    (value.mechanic === undefined || (isString(value.mechanic) && MECHANIC.has(value.mechanic))) &&
    isInRange(value.sets, 1, LIMITS.setsMax)
  );
}

function isWorkoutData(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return DAY_KEYS.every((day) => Array.isArray(value[day]) && value[day].every(isPlannedExercise));
}

function isBlockStructure(value: unknown): boolean {
  if (!isRecord(value)) return false;
  if (!Array.isArray(value.blocks)) return false;
  if (
    !value.blocks.every(
      (b) =>
        isRecord(b) && isString(b.id) && isString(b.label) && b.label.length <= LIMITS.labelMax,
    )
  )
    return false;
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
    value.id.length <= LIMITS.nameMax &&
    isString(value.exerciseId) &&
    value.exerciseId.length <= LIMITS.nameMax &&
    isString(value.exerciseName) &&
    value.exerciseName.length <= LIMITS.nameMax &&
    isString(value.muscleGroup) &&
    MUSCLE_GROUPS.has(value.muscleGroup) &&
    isString(value.date) &&
    value.date.length <= LIMITS.labelMax &&
    isString(value.timestamp) &&
    value.timestamp.length <= LIMITS.labelMax &&
    isWeight(value.weight) &&
    isInRange(value.reps, 1, LIMITS.repsMax)
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
