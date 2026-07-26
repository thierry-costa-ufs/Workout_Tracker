import {
  MuscleGroup,
  PersonalRecord,
  WorkoutData,
  WorkoutSession,
  WorkoutTemplate,
} from '@/types/workout';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { createWorkoutStorage, WorkoutStorage } from '@/core/storage/workoutStorage';

// ─── Sessions Context ───────────────────────────────────────────────
interface SessionsContextType {
  workouts: WorkoutSession[];
  isLoading: boolean;
  storeData: (value: WorkoutSession[]) => Promise<void>;
  loadData: () => Promise<void>;
}

const SessionsContext = createContext<SessionsContextType | undefined>(undefined);

// ─── Templates Context ──────────────────────────────────────────────
interface TemplatesContextType {
  templates: WorkoutTemplate[];
  activeId: string | null;
  saveTemplate: (name: string, data: WorkoutData, id?: string) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  selectActiveTemplate: (id: string) => Promise<void>;
}

const TemplatesContext = createContext<TemplatesContextType | undefined>(undefined);

// ─── Personal Records Context ───────────────────────────────────────
interface PersonalRecordsContextType {
  personalRecords: PersonalRecord[];
  savePR: (
    exerciseId: string,
    exerciseName: string,
    muscleGroup: MuscleGroup,
    weight: number,
    reps: number,
  ) => Promise<void>;
  deletePR: (id: string) => Promise<void>;
  getExercisePR: (exerciseId: string) => PersonalRecord | undefined;
}

const PersonalRecordsContext = createContext<PersonalRecordsContextType | undefined>(undefined);

// ─── Provider ───────────────────────────────────────────────────────
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
    try {
      await storage.saveWorkouts(value);
      setWorkouts(value);
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar as sessões.');
    }
  }, []);

  const saveTemplate = useCallback(
    async (name: string, data: WorkoutData, id?: string) => {
      let targetId = id;
      let updatedTemplates: WorkoutTemplate[];

      const exists = templates.some((t) => t.id === id);

      if (id && exists) {
        updatedTemplates = templates.map((t) => (t.id === id ? { ...t, name, data } : t));
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

      const nextActiveId = activeId || targetId || null;

      try {
        await Promise.all([
          storage.saveTemplates(updatedTemplates),
          storage.saveActiveId(nextActiveId),
        ]);
        setTemplates(updatedTemplates);
        setActiveId(nextActiveId);
      } catch {
        Alert.alert('Erro', 'Não foi possível salvar o template.');
      }
    },
    [templates, activeId],
  );

  const deleteTemplate = useCallback(
    async (id: string) => {
      const nextTemplates = templates.filter((t) => t.id !== id);
      const isActiveDeleted = activeId === id;

      try {
        await Promise.all([
          storage.saveTemplates(nextTemplates),
          isActiveDeleted ? storage.saveActiveId(null) : Promise.resolve(),
        ]);
        setTemplates(nextTemplates);
        if (isActiveDeleted) setActiveId(null);
      } catch {
        Alert.alert('Erro', 'Não foi possível excluir o template.');
      }
    },
    [templates, activeId],
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
      muscleGroup: MuscleGroup,
      weight: number,
      reps: number,
    ) => {
      const newRecord: PersonalRecord = {
        id: Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
        exerciseId,
        exerciseName,
        muscleGroup,
        weight,
        reps,
        date: new Date().toLocaleDateString('pt-BR'),
      };

      const updated = [newRecord, ...personalRecords];

      try {
        await storage.savePersonalRecords(updated);
        setPersonalRecords(updated);
      } catch {
        Alert.alert('Erro', 'Não foi possível salvar o recorde.');
      }
    },
    [personalRecords],
  );

  const deletePR = useCallback(
    async (id: string) => {
      const updated = personalRecords.filter((r) => r.id !== id);

      try {
        await storage.savePersonalRecords(updated);
        setPersonalRecords(updated);
      } catch {
        Alert.alert('Erro', 'Não foi possível excluir o recorde.');
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

  const sessionsValue = useMemo(
    () => ({ workouts, isLoading, storeData, loadData }),
    [workouts, isLoading, storeData, loadData],
  );

  const templatesValue = useMemo(
    () => ({
      templates,
      activeId,
      saveTemplate,
      deleteTemplate,
      selectActiveTemplate,
    }),
    [templates, activeId, saveTemplate, deleteTemplate, selectActiveTemplate],
  );

  const prValue = useMemo(
    () => ({
      personalRecords,
      savePR,
      deletePR,
      getExercisePR,
    }),
    [personalRecords, savePR, deletePR, getExercisePR],
  );

  return (
    <SessionsContext.Provider value={sessionsValue}>
      <TemplatesContext.Provider value={templatesValue}>
        <PersonalRecordsContext.Provider value={prValue}>
          {children}
        </PersonalRecordsContext.Provider>
      </TemplatesContext.Provider>
    </SessionsContext.Provider>
  );
}

// ─── Hooks ──────────────────────────────────────────────────────────
export function useSessions() {
  const ctx = useContext(SessionsContext);
  if (!ctx) throw new Error('useSessions must be used within a WorkoutProvider');
  return ctx;
}

export function useTemplates() {
  const ctx = useContext(TemplatesContext);
  if (!ctx) throw new Error('useTemplates must be used within a WorkoutProvider');
  return ctx;
}

export function usePersonalRecords() {
  const ctx = useContext(PersonalRecordsContext);
  if (!ctx) throw new Error('usePersonalRecords must be used within a WorkoutProvider');
  return ctx;
}
