import { PersonalRecord } from '@/types/workout';
import { capPersonalRecords, getBestPersonalRecord } from '@/core/utils/capPersonalRecords';

function rec(id: string, exerciseId: string, weight: number, timestamp: string): PersonalRecord {
  return {
    id,
    exerciseId,
    exerciseName: 'X',
    muscleGroup: 'Peito',
    weight,
    reps: 8,
    date: '01/01/2025',
    timestamp,
  };
}

describe('capPersonalRecords', () => {
  it('prepends new record (newest-first)', () => {
    const existing = [rec('a', 'e1', 80, '2025-01-01T10:00:00Z')];
    const updated = capPersonalRecords(existing, rec('b', 'e1', 90, '2025-01-02T10:00:00Z'));
    expect(updated[0].id).toBe('b');
    expect(updated).toHaveLength(2);
  });

  it('keeps other exercises untouched', () => {
    const other = rec('c', 'e2', 50, '2025-01-01T10:00:00Z');
    const updated = capPersonalRecords([other], rec('b', 'e1', 90, '2025-01-02T10:00:00Z'));
    expect(updated).toContainEqual(other);
  });

  it('caps at maxPerExercise, dropping oldest', () => {
    const existing = Array.from({ length: 500 }, (_, i) =>
      rec(`old-${i}`, 'e1', 80, `2025-01-01T0${String(i % 10)}:00:00Z`),
    );
    const fresh = rec('new', 'e1', 100, '2025-06-01T10:00:00Z');
    const updated = capPersonalRecords(existing, fresh);
    expect(updated).toHaveLength(500);
    expect(updated[0].id).toBe('new');
    expect(updated.some((r) => r.id === 'old-499')).toBe(false);
  });
});

describe('getBestPersonalRecord', () => {
  it('returns max weight, tie-breaking on reps', () => {
    const records = [
      rec('a', 'e1', 100, '2025-01-02T10:00:00Z'),
      rec('b', 'e1', 120, '2025-01-03T10:00:00Z'),
      rec('c', 'e1', 120, '2025-01-04T10:00:00Z'),
    ];
    records[1].reps = 5;
    records[2].reps = 8;
    expect(getBestPersonalRecord(records)?.id).toBe('c');
  });

  it('returns undefined for empty list', () => {
    expect(getBestPersonalRecord([])).toBeUndefined();
  });
});
