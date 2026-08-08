import { BlockStructure, PersonalRecord, WorkoutTemplate } from '@/types/workout';
import {
  filterValid,
  isPersonalRecord,
  isSessionProgress,
  isWorkoutTemplate,
} from '@/core/validation/guards';

function validTemplate(): WorkoutTemplate {
  return {
    id: 't1',
    name: 'Plano',
    createdAt: '2025-01-01T00:00:00.000Z',
    data: {
      dom: [],
      seg: [],
      ter: [],
      qua: [],
      qui: [],
      sex: [],
      sab: [
        {
          id: 'e1',
          name: 'Supino',
          muscleGroup: 'Peito',
          mechanic: 'Composto',
          equipment: 'Barra',
          sets: 3,
        },
      ],
    },
    blockStructure: {
      blocks: [],
      dayIds: { dom: null, seg: null, ter: null, qua: null, qui: null, sex: null, sab: null },
    },
  };
}

function validRecord(): PersonalRecord {
  return {
    id: 'r1',
    exerciseId: 'e1',
    exerciseName: 'Supino',
    muscleGroup: 'Peito',
    weight: 80,
    reps: 8,
    date: '01/01/2025',
    timestamp: '2025-01-01T00:00:00.000Z',
  };
}

describe('isWorkoutTemplate', () => {
  it('accepts a well-formed template', () => {
    expect(isWorkoutTemplate(validTemplate())).toBe(true);
  });

  it('rejects template without data', () => {
    const t = validTemplate();
    delete (t as Partial<WorkoutTemplate>).data;
    expect(isWorkoutTemplate(t)).toBe(false);
  });

  it('rejects template with a missing day key', () => {
    const t = validTemplate();
    delete (t.data as Partial<WorkoutTemplate['data']>).qua;
    expect(isWorkoutTemplate(t)).toBe(false);
  });

  it('rejects exercise with non-numeric sets', () => {
    const t = validTemplate();
    (t.data.sab[0] as unknown as { sets: unknown }).sets = '3';
    expect(isWorkoutTemplate(t)).toBe(false);
  });

  it('rejects exercise with sets < 1', () => {
    const t = validTemplate();
    t.data.sab[0].sets = 0;
    expect(isWorkoutTemplate(t)).toBe(false);
  });

  it('rejects exercise with fractional sets', () => {
    const t = validTemplate();
    t.data.sab[0].sets = 2.5;
    expect(isWorkoutTemplate(t)).toBe(false);
  });

  it('rejects exercise with sets above max', () => {
    const t = validTemplate();
    t.data.sab[0].sets = 1000000;
    expect(isWorkoutTemplate(t)).toBe(false);
  });

  it('rejects exercise with muscleGroup outside enum', () => {
    const t = validTemplate();
    (t.data.sab[0] as unknown as { muscleGroup: string }).muscleGroup = 'Perna';
    expect(isWorkoutTemplate(t)).toBe(false);
  });

  it('rejects exercise with equipment outside enum', () => {
    const t = validTemplate();
    (t.data.sab[0] as unknown as { equipment: string }).equipment = 'Corda';
    expect(isWorkoutTemplate(t)).toBe(false);
  });

  it('rejects exercise with mechanic outside enum', () => {
    const t = validTemplate();
    (t.data.sab[0] as unknown as { mechanic: string }).mechanic = 'Misto';
    expect(isWorkoutTemplate(t)).toBe(false);
  });

  it('rejects exercise with name longer than 80', () => {
    const t = validTemplate();
    t.data.sab[0].name = 'a'.repeat(81);
    expect(isWorkoutTemplate(t)).toBe(false);
  });

  it('rejects malformed blockStructure', () => {
    const t = validTemplate();
    t.blockStructure = { blocks: 'nope', dayIds: {} } as unknown as BlockStructure;
    expect(isWorkoutTemplate(t)).toBe(false);
  });

  it('accepts missing blockStructure', () => {
    const t = validTemplate();
    delete (t as Partial<WorkoutTemplate>).blockStructure;
    expect(isWorkoutTemplate(t)).toBe(true);
  });
});

describe('isPersonalRecord', () => {
  it('accepts a well-formed record', () => {
    expect(isPersonalRecord(validRecord())).toBe(true);
  });

  it('rejects record with string weight', () => {
    const r = validRecord();
    (r as unknown as { weight: unknown }).weight = '80';
    expect(isPersonalRecord(r)).toBe(false);
  });

  it('rejects record with NaN weight', () => {
    const r = validRecord();
    (r as unknown as { weight: unknown }).weight = NaN;
    expect(isPersonalRecord(r)).toBe(false);
  });

  it('rejects record with weight above max', () => {
    const r = validRecord();
    (r as unknown as { weight: unknown }).weight = 2500;
    expect(isPersonalRecord(r)).toBe(false);
  });

  it('rejects record with 1e308 weight', () => {
    const r = validRecord();
    (r as unknown as { weight: unknown }).weight = 1e308;
    expect(isPersonalRecord(r)).toBe(false);
  });

  it('accepts record with zero weight', () => {
    const r = validRecord();
    r.weight = 0;
    expect(isPersonalRecord(r)).toBe(true);
  });

  it('accepts record with fractional weight', () => {
    const r = validRecord();
    r.weight = 82.5;
    expect(isPersonalRecord(r)).toBe(true);
  });

  it('rejects record with zero reps', () => {
    const r = validRecord();
    r.reps = 0;
    expect(isPersonalRecord(r)).toBe(false);
  });

  it('rejects record with fractional reps', () => {
    const r = validRecord();
    (r as unknown as { reps: unknown }).reps = 8.5;
    expect(isPersonalRecord(r)).toBe(false);
  });

  it('rejects record with muscleGroup outside enum', () => {
    const r = validRecord();
    (r as unknown as { muscleGroup: string }).muscleGroup = 'Perna';
    expect(isPersonalRecord(r)).toBe(false);
  });

  it('rejects record missing timestamp', () => {
    const r = validRecord();
    delete (r as Partial<PersonalRecord>).timestamp;
    expect(isPersonalRecord(r)).toBe(false);
  });
});

describe('isSessionProgress', () => {
  it('accepts boolean arrays keyed by exercise', () => {
    expect(isSessionProgress({ e1: [true, false], e2: [] })).toBe(true);
  });

  it('rejects non-array progress value', () => {
    expect(isSessionProgress({ e1: true })).toBe(false);
  });

  it('rejects non-boolean entries', () => {
    expect(isSessionProgress({ e1: [true, 1] })).toBe(false);
  });
});

describe('filterValid', () => {
  it('drops invalid items, keeps valid ones', () => {
    const arr = [validRecord(), { id: 'bad' }, validRecord()];
    expect(filterValid(arr, isPersonalRecord)).toHaveLength(2);
  });
});
