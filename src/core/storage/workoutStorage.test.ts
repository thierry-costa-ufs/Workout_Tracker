import AsyncStorage from '@react-native-async-storage/async-storage';
import { migrateStorage, workoutStorage } from '@/core/storage/workoutStorage';
import { PersonalRecord, WorkoutTemplate } from '@/types/workout';

// ponytail: temp mock — B4 moves this to jest.setup.js
jest.mock('@react-native-async-storage/async-storage', () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- canonical RN mock pattern
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

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
