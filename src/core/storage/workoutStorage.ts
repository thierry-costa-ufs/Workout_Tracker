import {
  PersonalRecord,
  WorkoutSession,
  WorkoutTemplate,
} from "@/types/workout";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY_WORKOUTS = "@gym_app:workouts_key";
const STORAGE_KEY_TEMPLATES = "@gym_app:workout_templates";
const STORAGE_KEY_ACTIVE = "@gym_app:active_template_id";
const STORAGE_KEY_PRS = "@gym_app:personal_records";

export interface WorkoutStorage {
  loadAll(): Promise<{
    workouts: WorkoutSession[];
    templates: WorkoutTemplate[];
    activeId: string | null;
    personalRecords: PersonalRecord[];
  }>;

  saveWorkouts(workouts: WorkoutSession[]): Promise<void>;
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

export function createWorkoutStorage(): WorkoutStorage {
  return {
    async loadAll() {
      const [vWorkouts, vTemplates, vActiveId, vPRs] = await Promise.allSettled([
        AsyncStorage.getItem(STORAGE_KEY_WORKOUTS),
        AsyncStorage.getItem(STORAGE_KEY_TEMPLATES),
        AsyncStorage.getItem(STORAGE_KEY_ACTIVE),
        AsyncStorage.getItem(STORAGE_KEY_PRS),
      ]);

      return {
        workouts:
          vWorkouts.status === "fulfilled"
            ? parseJsonArray<WorkoutSession>(vWorkouts.value)
            : [],
        templates:
          vTemplates.status === "fulfilled"
            ? parseJsonArray<WorkoutTemplate>(vTemplates.value)
            : [],
        activeId:
          vActiveId.status === "fulfilled" ? vActiveId.value || null : null,
        personalRecords:
          vPRs.status === "fulfilled"
            ? parseJsonArray<PersonalRecord>(vPRs.value)
            : [],
      };
    },

    async saveWorkouts(workouts) {
      await AsyncStorage.setItem(
        STORAGE_KEY_WORKOUTS,
        JSON.stringify(workouts),
      );
    },

    async saveTemplates(templates) {
      await AsyncStorage.setItem(
        STORAGE_KEY_TEMPLATES,
        JSON.stringify(templates),
      );
    },

    async saveActiveId(id) {
      if (id) {
        await AsyncStorage.setItem(STORAGE_KEY_ACTIVE, id);
      } else {
        await AsyncStorage.removeItem(STORAGE_KEY_ACTIVE);
      }
    },

    async savePersonalRecords(records) {
      await AsyncStorage.setItem(
        STORAGE_KEY_PRS,
        JSON.stringify(records),
      );
    },
  };
}
