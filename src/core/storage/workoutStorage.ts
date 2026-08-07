import { PersonalRecord, WorkoutTemplate } from '@/types/workout';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { filterValid, isPersonalRecord, isWorkoutTemplate } from '@/core/validation/guards';

export const STORAGE_VERSION = 1;
const key = (name: string) => `@gym_app:v${STORAGE_VERSION}:${name}`;
const shadowKey = (name: string) => `@gym_app:bak:v${STORAGE_VERSION}:${name}`;
const LEGACY_KEYS = {
  templates: '@gym_app:workout_templates',
  active: '@gym_app:active_template_id',
  prs: '@gym_app:personal_records',
};

let migrationPromise: Promise<void> | null = null;
function ensureMigrated(): Promise<void> {
  if (!migrationPromise) migrationPromise = migrateStorage();
  return migrationPromise;
}

export async function migrateStorage(): Promise<void> {
  if ((await AsyncStorage.getItem(key('workout_templates'))) !== null) return;

  const move = async (legacy: string, name: string) => {
    const raw = await AsyncStorage.getItem(legacy);
    if (raw === null) return;
    await AsyncStorage.setItem(shadowKey(name), raw);
    await AsyncStorage.setItem(key(name), raw);
    await AsyncStorage.removeItem(legacy);
  };
  await Promise.all([
    move(LEGACY_KEYS.templates, 'workout_templates'),
    move(LEGACY_KEYS.prs, 'personal_records'),
    move(LEGACY_KEYS.active, 'active_template_id'),
  ]);
}

export interface WorkoutStorage {
  loadTemplates(): Promise<WorkoutTemplate[]>;
  loadActiveId(): Promise<string | null>;
  loadPersonalRecords(): Promise<PersonalRecord[]>;

  saveTemplates(templates: WorkoutTemplate[]): Promise<void>;
  saveActiveId(id: string | null): Promise<void>;
  savePersonalRecords(records: PersonalRecord[]): Promise<void>;
}

function parseJsonArray<T>(raw: string | null): T[] {
  if (raw === null) return [];
  const parsed = JSON.parse(raw); // throws on corrupt
  return Array.isArray(parsed) ? parsed : [];
}

async function loadArray<T>(name: string, guard: (v: unknown) => v is T): Promise<T[]> {
  await ensureMigrated();
  try {
    return filterValid(parseJsonArray<T>(await AsyncStorage.getItem(key(name))), guard);
  } catch {
    // ponytail: shadow = last-known-good; empty shadow means nothing was ever written
    try {
      const backup = filterValid(
        parseJsonArray<T>(await AsyncStorage.getItem(shadowKey(name))),
        guard,
      );
      if (backup.length > 0) await AsyncStorage.setItem(key(name), JSON.stringify(backup));
      return backup;
    } catch {
      return [];
    }
  }
}

async function loadString(name: string): Promise<string | null> {
  await ensureMigrated();
  try {
    return await AsyncStorage.getItem(key(name));
  } catch {
    try {
      return await AsyncStorage.getItem(shadowKey(name));
    } catch {
      return null;
    }
  }
}

const writeQueues = new Map<string, Promise<void>>();

function serialized(name: string, task: () => Promise<void>): Promise<void> {
  const prev = writeQueues.get(name) ?? Promise.resolve();
  const run = prev.then(task).catch(() => {});
  const guarded = run.finally(() => {
    if (writeQueues.get(name) === guarded) writeQueues.delete(name);
  });
  writeQueues.set(name, guarded);
  return guarded;
}

async function atomicWrite(name: string, value: string): Promise<void> {
  await ensureMigrated();
  await AsyncStorage.setItem(shadowKey(name), value); // last-known-good
  await AsyncStorage.setItem(key(name), value);
}

export const workoutStorage: WorkoutStorage = {
  async loadTemplates() {
    return loadArray('workout_templates', isWorkoutTemplate);
  },

  async loadActiveId() {
    return loadString('active_template_id');
  },

  async loadPersonalRecords() {
    return loadArray('personal_records', isPersonalRecord);
  },

  async saveTemplates(templates) {
    await serialized('workout_templates', () =>
      atomicWrite('workout_templates', JSON.stringify(templates)),
    );
  },

  async saveActiveId(id) {
    await serialized('active_template_id', () =>
      id
        ? atomicWrite('active_template_id', id)
        : AsyncStorage.removeItem(shadowKey('active_template_id')).then(() =>
            AsyncStorage.removeItem(key('active_template_id')),
          ),
    );
  },

  async savePersonalRecords(records) {
    await serialized('personal_records', () =>
      atomicWrite('personal_records', JSON.stringify(records)),
    );
  },
};
