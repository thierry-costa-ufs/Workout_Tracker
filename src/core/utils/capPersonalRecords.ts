import { PersonalRecord } from '@/types/workout';

// ponytail: cap 500 records per exercise (~4.8MB total for 48 exercises).
// Newest-first so history lists read in insertion order; best record computed separately.
export function capPersonalRecords(
  existing: PersonalRecord[],
  newRecord: PersonalRecord,
  maxPerExercise = 500,
): PersonalRecord[] {
  const exerciseRecords = existing.filter((r) => r.exerciseId === newRecord.exerciseId);
  const otherRecords = existing.filter((r) => r.exerciseId !== newRecord.exerciseId);
  const combined = [newRecord, ...exerciseRecords];
  const capped = combined.length > maxPerExercise ? combined.slice(0, maxPerExercise) : combined;
  return [...capped, ...otherRecords];
}

export function getBestPersonalRecord(records: PersonalRecord[]): PersonalRecord | undefined {
  return records.reduce<PersonalRecord | undefined>(
    (best, r) =>
      !best || r.weight > best.weight || (r.weight === best.weight && r.reps > best.reps)
        ? r
        : best,
    undefined,
  );
}
