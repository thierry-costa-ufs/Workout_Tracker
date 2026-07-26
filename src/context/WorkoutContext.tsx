import {
  PersonalRecord,
  WorkoutData,
  WorkoutSession,
  WorkoutTemplate,
} from "@/types/workout";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createWorkoutStorage, WorkoutStorage } from "@/core/storage/workoutStorage";

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

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

const storage: WorkoutStorage = createWorkoutStorage();

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const data = await storage.loadAll();
      setWorkouts(data.workouts);
      setTemplates(data.templates);
      setActiveId(data.activeId);
      setPersonalRecords(data.personalRecords);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const storeData = useCallback(async (value: WorkoutSession[]) => {
    setWorkouts(value);
    await storage.saveWorkouts(value);
  }, []);

  const saveTemplate = useCallback(
    async (name: string, data: WorkoutData, id?: string) => {
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
        storage.saveTemplates(updatedTemplates),
        storage.saveActiveId(nextActiveId),
      ]);
    },
    [templates, activeId],
  );

  const deleteTemplate = useCallback(
    async (id: string) => {
      let nextTemplates: WorkoutTemplate[] = [];

      setTemplates((prev) => {
        nextTemplates = prev.filter((t) => t.id !== id);
        return nextTemplates;
      });

      const isActiveDeleted = activeId === id;
      if (isActiveDeleted) {
        setActiveId(null);
      }

      await Promise.all([
        storage.saveTemplates(nextTemplates),
        isActiveDeleted ? storage.saveActiveId(null) : Promise.resolve(),
      ]);
    },
    [activeId],
  );

  const selectActiveTemplate = useCallback(async (id: string) => {
    if (!id) {
      setActiveId(null);
      await storage.saveActiveId(null);
    } else {
      setActiveId(id);
      await storage.saveActiveId(id);
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

      const updated = [newRecord, ...personalRecords];

      setPersonalRecords(updated);
      await storage.savePersonalRecords(updated);
    },
    [personalRecords],
  );

  const deletePR = useCallback(
    async (id: string) => {
      const updated = personalRecords.filter((r) => r.id !== id);
      setPersonalRecords(updated);
      await storage.savePersonalRecords(updated);
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
