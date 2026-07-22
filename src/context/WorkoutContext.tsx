import {
  PersonalRecord,
  WorkoutData,
  WorkoutSession,
  WorkoutTemplate,
} from "@/types/workout";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface WorkoutContextType {
  workouts: WorkoutSession[];
  templates: WorkoutTemplate[];
  personalRecords: PersonalRecord[];
  activeId: string | null;
  isLoading: boolean;
  storeData: (value: WorkoutSession[]) => Promise<void>;
  saveTemplate: (name: string, data: WorkoutData, id?: string) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  selectActiveTemplate: (id: string) => Promise<void>;
  savePR: (
    exerciseId: string,
    exerciseName: string,
    muscleGroup: string,
    weight: number,
    reps: number,
  ) => Promise<void>;
  deletePR: (id: string) => Promise<void>;
  getExercisePR: (exerciseId: string) => PersonalRecord | undefined;
  loadData: () => Promise<void>;
}

const STORAGE_KEY_WORKOUTS = "@gym_app:workouts_key";
const STORAGE_KEY_TEMPLATES = "@gym_app:workout_templates";
const STORAGE_KEY_ACTIVE = "@gym_app:active_template_id";
const STORAGE_KEY_PRS = "@gym_app:personal_records";

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [vWorkouts, vTemplates, vActiveId, vPRs] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY_WORKOUTS),
        AsyncStorage.getItem(STORAGE_KEY_TEMPLATES),
        AsyncStorage.getItem(STORAGE_KEY_ACTIVE),
        AsyncStorage.getItem(STORAGE_KEY_PRS),
      ]);

      if (vWorkouts) setWorkouts(JSON.parse(vWorkouts));
      if (vTemplates) setTemplates(JSON.parse(vTemplates));
      if (vActiveId) setActiveId(vActiveId);
      if (vPRs) setPersonalRecords(JSON.parse(vPRs));
    } catch (e) {
      console.error("Erro ao carregar dados do AsyncStorage:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const storeData = useCallback(async (value: WorkoutSession[]) => {
    try {
      setWorkouts(value);
      await AsyncStorage.setItem(STORAGE_KEY_WORKOUTS, JSON.stringify(value));
    } catch (e) {
      console.error("Erro ao salvar sessões:", e);
    }
  }, []);

  const saveTemplate = useCallback(
    async (name: string, data: WorkoutData, id?: string) => {
      try {
        let targetId = id;
        let updatedTemplates: WorkoutTemplate[];

        const exists = templates.some((t) => t.id === id);

        if (id && exists) {
          updatedTemplates = templates.map((t) =>
            t.id === id ? { ...t, name, data } : t,
          );
        } else {
          targetId = Date.now().toString();
          const newTemplate: WorkoutTemplate = {
            id: targetId,
            name,
            data,
            createdAt: new Date().toISOString(),
          };
          updatedTemplates = [...templates, newTemplate];
        }

        setTemplates(updatedTemplates);

        const nextActiveId = activeId || targetId || null;
        setActiveId(nextActiveId);

        await Promise.all([
          AsyncStorage.setItem(
            STORAGE_KEY_TEMPLATES,
            JSON.stringify(updatedTemplates),
          ),
          nextActiveId
            ? AsyncStorage.setItem(STORAGE_KEY_ACTIVE, nextActiveId)
            : AsyncStorage.removeItem(STORAGE_KEY_ACTIVE),
        ]);
      } catch (error) {
        console.error("Erro ao salvar/atualizar template:", error);
        throw error;
      }
    },
    [templates, activeId],
  );

  const deleteTemplate = useCallback(
    async (id: string) => {
      try {
        let nextTemplates: WorkoutTemplate[] = [];

        setTemplates((prev) => {
          nextTemplates = prev.filter((t) => t.id !== id);
          return nextTemplates;
        });

        const isActiveDeleted = activeId === id;
        if (isActiveDeleted) {
          setActiveId(null);
        }

        const storagePromises: Promise<void>[] = [
          AsyncStorage.setItem(
            STORAGE_KEY_TEMPLATES,
            JSON.stringify(nextTemplates),
          ),
        ];

        if (isActiveDeleted) {
          storagePromises.push(AsyncStorage.removeItem(STORAGE_KEY_ACTIVE));
        }

        await Promise.all(storagePromises);
      } catch (e) {
        console.error("Erro ao deletar template:", e);
        throw e;
      }
    },
    [activeId],
  );

  const selectActiveTemplate = useCallback(async (id: string) => {
    try {
      if (!id) {
        setActiveId(null);
        await AsyncStorage.removeItem(STORAGE_KEY_ACTIVE);
      } else {
        setActiveId(id);
        await AsyncStorage.setItem(STORAGE_KEY_ACTIVE, id);
      }
    } catch (e) {
      console.error("Erro ao selecionar template ativo:", e);
    }
  }, []);

  const savePR = useCallback(
    async (
      exerciseId: string,
      exerciseName: string,
      muscleGroup: string,
      weight: number,
      reps: number,
    ) => {
      try {
        const newRecord: PersonalRecord = {
          id:
            Date.now().toString(36) +
            Math.random().toString(36).substring(2, 5),
          exerciseId,
          exerciseName,
          muscleGroup,
          weight,
          reps,
          date: new Date().toLocaleDateString("pt-BR"),
        };

        const filtered = personalRecords.filter(
          (r) => r.exerciseId !== exerciseId,
        );
        const updated = [newRecord, ...filtered];

        setPersonalRecords(updated);
        await AsyncStorage.setItem(STORAGE_KEY_PRS, JSON.stringify(updated));
      } catch (e) {
        console.error("Erro ao salvar PR:", e);
      }
    },
    [personalRecords],
  );

  const deletePR = useCallback(
    async (id: string) => {
      try {
        const updated = personalRecords.filter((r) => r.id !== id);
        setPersonalRecords(updated);
        await AsyncStorage.setItem(STORAGE_KEY_PRS, JSON.stringify(updated));
      } catch (e) {
        console.error("Erro ao remover PR:", e);
      }
    },
    [personalRecords],
  );

  const getExercisePR = useCallback(
    (exerciseId: string) => {
      return personalRecords.find((r) => r.exerciseId === exerciseId);
    },
    [personalRecords],
  );

  const contextValue = useMemo(
    () => ({
      workouts,
      templates,
      personalRecords,
      activeId,
      isLoading,
      storeData,
      saveTemplate,
      deleteTemplate,
      selectActiveTemplate,
      savePR,
      deletePR,
      getExercisePR,
      loadData,
    }),
    [
      workouts,
      templates,
      personalRecords,
      activeId,
      isLoading,
      storeData,
      saveTemplate,
      deleteTemplate,
      selectActiveTemplate,
      savePR,
      deletePR,
      getExercisePR,
      loadData,
    ],
  );

  return (
    <WorkoutContext.Provider value={contextValue}>
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkouts() {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error(
      "useWorkouts deve ser utilizado dentro de um WorkoutProvider",
    );
  }
  return context;
}
