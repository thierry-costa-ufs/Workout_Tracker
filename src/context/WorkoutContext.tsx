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
  const [activeId, setLoadingActiveId] = useState<string | null>(null);
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
      if (vActiveId) setLoadingActiveId(vActiveId);
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
        let updatedTemplates: WorkoutTemplate[];
        let targetId = id;

        setTemplates((prevTemplates) => {
          const exists = prevTemplates.some((t) => t.id === id);
          if (id && exists) {
            updatedTemplates = prevTemplates.map((t) =>
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
            updatedTemplates = [...prevTemplates, newTemplate];
          }
          return updatedTemplates;
        });

        // CORREÇÃO CRÍTICA: Não force a troca do activeId se você estiver apenas editando um treino existente
        // Só define como ativo automaticamente se o usuário não tiver nenhum treino ativo ainda.
        setLoadingActiveId((currentActive) => {
          const nextActive = currentActive || targetId || null;
          AsyncStorage.setItem(STORAGE_KEY_ACTIVE, nextActive || "");
          return nextActive;
        });

        // Aguarda a atualização do estado local refletir no storage de forma assíncrona estável
        setTimeout(async () => {
          await AsyncStorage.setItem(
            STORAGE_KEY_TEMPLATES,
            JSON.stringify(updatedTemplates),
          );
        }, 0);
      } catch (error) {
        console.error("Erro ao salvar/atualizar template:", error);
        throw error;
      }
    },
    [],
  );

  const deleteTemplate = useCallback(async (id: string) => {
    try {
      setTemplates((prev) => {
        const updated = prev.filter((t) => t.id !== id);
        AsyncStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(updated));
        return updated;
      });

      setLoadingActiveId((current) => {
        if (current === id) {
          AsyncStorage.removeItem(STORAGE_KEY_ACTIVE);
          return null;
        }
        return current;
      });
    } catch (e) {
      console.error("Erro ao deletar template:", e);
    }
  }, []);

  const selectActiveTemplate = useCallback(async (id: string) => {
    try {
      if (!id) {
        setLoadingActiveId(null);
        await AsyncStorage.removeItem(STORAGE_KEY_ACTIVE);
      } else {
        setLoadingActiveId(id);
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

        setPersonalRecords((prev) => {
          const filtered = prev.filter((r) => r.exerciseId !== exerciseId);
          const updated = [newRecord, ...filtered];
          AsyncStorage.setItem(STORAGE_KEY_PRS, JSON.stringify(updated));
          return updated;
        });
      } catch (e) {
        console.error("Erro ao salvar PR:", e);
      }
    },
    [],
  );

  const deletePR = useCallback(async (id: string) => {
    try {
      setPersonalRecords((prev) => {
        const updated = prev.filter((r) => r.id !== id);
        AsyncStorage.setItem(STORAGE_KEY_PRS, JSON.stringify(updated));
        return updated;
      });
    } catch (e) {
      console.error("Erro ao remover PR:", e);
    }
  }, []);

  const getExercisePR = useCallback(
    (exerciseId: string) => {
      return personalRecords.find((r) => r.exerciseId === exerciseId);
    },
    [personalRecords],
  );

  // Memoriza o objeto do contexto para evitar renderizações inúteis abaixo
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
