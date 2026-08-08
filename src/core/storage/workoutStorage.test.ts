import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getToday,
  migrateStorage,
  pruneSessionKeys,
  workoutStorage,
} from '@/core/storage/workoutStorage';
import { PersonalRecord, WorkoutTemplate } from '@/types/workout';

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

const V = { templates: '@gym_app:v1:workout_templates', prs: '@gym_app:v1:personal_records' };
const BAK = {
  templates: '@gym_app:bak:v1:workout_templates',
  prs: '@gym_app:bak:v1:personal_records',
};

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('migrateStorage', () => {
  it('moves legacy keys to versioned keys, removes legacy, is idempotent', async () => {
    await AsyncStorage.setItem('@gym_app:workout_templates', JSON.stringify([validTemplate()]));
    await AsyncStorage.setItem('@gym_app:personal_records', JSON.stringify([validRecord()]));
    await AsyncStorage.setItem('@gym_app:active_template_id', 't1');

    await migrateStorage();

    expect(await AsyncStorage.getItem(V.templates)).toBe(JSON.stringify([validTemplate()]));
    expect(await AsyncStorage.getItem(BAK.templates)).toBe(JSON.stringify([validTemplate()]));
    expect(await AsyncStorage.getItem('@gym_app:workout_templates')).toBeNull();
    expect(await AsyncStorage.getItem('@gym_app:personal_records')).toBeNull();
    expect(await AsyncStorage.getItem('@gym_app:active_template_id')).toBeNull();
    expect(await AsyncStorage.getItem(V.prs)).toBe(JSON.stringify([validRecord()]));
    expect(await AsyncStorage.getItem('@gym_app:v1:active_template_id')).toBe('t1');

    await migrateStorage();
    expect(await AsyncStorage.getItem(V.templates)).toBe(JSON.stringify([validTemplate()]));
  });
});

describe('loadArray shadow fallback', () => {
  it('falls back to shadow and self-heals when canonical is corrupt', async () => {
    await AsyncStorage.setItem(V.templates, '{corrupt');
    await AsyncStorage.setItem(BAK.templates, JSON.stringify([validTemplate()]));

    const loaded = await workoutStorage.loadTemplates();

    expect(loaded).toEqual([validTemplate()]);
    expect(await AsyncStorage.getItem(V.templates)).toBe(JSON.stringify([validTemplate()]));
  });

  it('returns [] when canonical corrupt and no shadow, without throwing', async () => {
    await AsyncStorage.setItem(V.prs, '{corrupt');

    await expect(workoutStorage.loadPersonalRecords()).resolves.toEqual([]);
  });
});

describe('serialized writes', () => {
  it('concurrent saves serialize in order, last wins', async () => {
    const setItem = jest.spyOn(AsyncStorage, 'setItem').mockClear();
    const first = { ...validRecord(), weight: 50 };
    const second = { ...validRecord(), weight: 90 };

    await Promise.all([
      workoutStorage.savePersonalRecords([first]),
      workoutStorage.savePersonalRecords([second]),
    ]);

    expect(await workoutStorage.loadPersonalRecords()).toEqual([second]);
    const canonicalWrites = setItem.mock.calls
      .filter(([key]) => key === V.prs)
      .map(([, value]) => value);
    expect(canonicalWrites).toEqual([JSON.stringify([first]), JSON.stringify([second])]);
  });
});

describe('session progress', () => {
  const today = getToday();
  const sessionKey = (templateId: string) => `@gym_app:v1:session:${templateId}:${today}`;
  const legacyKey = (templateId: string) => `@gym_app:session_progress:${templateId}`;

  it('saves and loads session progress under date-keyed key', async () => {
    const payload = { dayKey: 'seg', date: today, progress: { e1: [true, false] } };
    await workoutStorage.saveSessionProgress('t1', payload);

    expect(await AsyncStorage.getItem(sessionKey('t1'))).toBe(JSON.stringify(payload));
    expect(await workoutStorage.loadSessionProgress('t1')).toEqual(payload);
  });

  it('isolates sessions by templateId and date', async () => {
    await workoutStorage.saveSessionProgress('t1', {
      dayKey: 'seg',
      date: today,
      progress: { e1: [true] },
    });
    await workoutStorage.saveSessionProgress('t2', {
      dayKey: 'seg',
      date: today,
      progress: { e2: [false] },
    });

    expect((await workoutStorage.loadSessionProgress('t1'))?.progress).toEqual({ e1: [true] });
    expect((await workoutStorage.loadSessionProgress('t2'))?.progress).toEqual({ e2: [false] });
  });

  it('migrates legacy unversioned key once when date matches', async () => {
    const legacy = { dayKey: 'seg', date: today, progress: { e1: [true, true] } };
    await AsyncStorage.setItem(legacyKey('t1'), JSON.stringify(legacy));

    const loaded = await workoutStorage.loadSessionProgress('t1');

    expect(loaded).toEqual(legacy);
    expect(await AsyncStorage.getItem(legacyKey('t1'))).toBeNull();
    expect(await AsyncStorage.getItem(sessionKey('t1'))).toBe(JSON.stringify(legacy));
  });

  it('ignores legacy key when date does not match today', async () => {
    const stale = { dayKey: 'seg', date: '2000-01-01', progress: { e1: [true] } };
    await AsyncStorage.setItem(legacyKey('t1'), JSON.stringify(stale));

    expect(await workoutStorage.loadSessionProgress('t1')).toBeNull();
  });

  it('returns null when no session stored', async () => {
    expect(await workoutStorage.loadSessionProgress('t1')).toBeNull();
  });
});

describe('pruneSessionKeys', () => {
  it('removes session keys older than retainDays', async () => {
    const oldDate = '2000-01-01';
    await AsyncStorage.setItem(`@gym_app:v1:session:t1:${oldDate}`, JSON.stringify({}));
    await AsyncStorage.setItem(`@gym_app:v1:session:t2:${getToday()}`, JSON.stringify({}));

    await pruneSessionKeys(7);

    expect(await AsyncStorage.getItem(`@gym_app:v1:session:t1:${oldDate}`)).toBeNull();
    expect(await AsyncStorage.getItem(`@gym_app:v1:session:t2:${getToday()}`)).not.toBeNull();
  });
});
