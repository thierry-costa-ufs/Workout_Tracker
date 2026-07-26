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

export function createWorkoutStorage(): WorkoutStorage {
  return {
    async loadAll() {
      try {
        const [vWorkouts, vTemplates, vActiveId, vPRs] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY_WORKOUTS),
          AsyncStorage.getItem(STORAGE_KEY_TEMPLATES),
          AsyncStorage.getItem(STORAGE_KEY_ACTIVE),
          AsyncStorage.getItem(STORAGE_KEY_PRS),
        ]);

        return {
          workouts: vWorkouts ? JSON.parse(vWorkouts) : [],
          templates: vTemplates ? JSON.parse(vTemplates) : [],
          activeId: vActiveId || null,
          personalRecords: vPRs ? JSON.parse(vPRs) : [],
        };
      } catch (e) {
        console.error("Erro ao carregar dados do AsyncStorage:", e);
        return { workouts: [], templates: [], activeId: null, personalRecords: [] };
      }
    },

    async saveWorkouts(workouts) {
      try {
        await AsyncStorage.setItem(STORAGE_KEY_WORKOUTS, JSON.stringify(workouts));
      } catch (e) {
        console.error("Erro ao salvar sessões:", e);
      }
    },

    async saveTemplates(templates) {
      try {
        await AsyncStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(templates));
      } catch (e) {
        console.error("Erro ao salvar templates:", e);
      }
    },

    async saveActiveId(id) {
      try {
        if (id) {
          await AsyncStorage.setItem(STORAGE_KEY_ACTIVE, id);
        } else {
          await AsyncStorage.removeItem(STORAGE_KEY_ACTIVE);
        }
      } catch (e) {
        console.error("Erro ao salvar activeId:", e);
      }
    },

    async savePersonalRecords(records) {
      try {
        await AsyncStorage.setItem(STORAGE_KEY_PRS, JSON.stringify(records));
      } catch (e) {
        console.error("Erro ao salvar PRs:", e);
      }
    },
  };
}
