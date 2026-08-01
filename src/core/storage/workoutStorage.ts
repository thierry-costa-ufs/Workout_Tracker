import { PersonalRecord, WorkoutTemplate } from '@/types/workout';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { filterValid, isPersonalRecord, isWorkoutTemplate } from '@/core/validation/guards';

const STORAGE_KEY_TEMPLATES = '@gym_app:workout_templates';
const STORAGE_KEY_ACTIVE = '@gym_app:active_template_id';
const STORAGE_KEY_PRS = '@gym_app:personal_records';

export interface WorkoutStorage {
  loadTemplates(): Promise<WorkoutTemplate[]>;
  loadActiveId(): Promise<string | null>;
  loadPersonalRecords(): Promise<PersonalRecord[]>;

  saveTemplates(templates: WorkoutTemplate[]): Promise<void>;
  saveActiveId(id: string | null): Promise<void>;
  savePersonalRecords(records: PersonalRecord[]): Promise<void>;
}

function parseJsonArray<T>(raw: string | null): T[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export const workoutStorage: WorkoutStorage = {
  async loadTemplates() {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_TEMPLATES);
    return filterValid(parseJsonArray<WorkoutTemplate>(raw), isWorkoutTemplate);
  },

  async loadActiveId() {
    const value = await AsyncStorage.getItem(STORAGE_KEY_ACTIVE);
    return value || null;
  },

  async loadPersonalRecords() {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_PRS);
    return filterValid(parseJsonArray<PersonalRecord>(raw), isPersonalRecord);
  },

  async saveTemplates(templates) {
    await AsyncStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(templates));
  },

  async saveActiveId(id) {
    if (id) {
      await AsyncStorage.setItem(STORAGE_KEY_ACTIVE, id);
    } else {
      await AsyncStorage.removeItem(STORAGE_KEY_ACTIVE);
    }
  },

  async savePersonalRecords(records) {
    await AsyncStorage.setItem(STORAGE_KEY_PRS, JSON.stringify(records));
  },
};
