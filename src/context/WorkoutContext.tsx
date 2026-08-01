import {
  BlockStructure,
  MuscleGroup,
  PersonalRecord,
  WorkoutData,
  WorkoutTemplate,
} from '@/types/workout';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Alert } from 'react-native';
import { createWorkoutStorage, WorkoutStorage } from '@/core/storage/workoutStorage';
import { capPersonalRecords, getBestPersonalRecord } from '@/core/utils/capPersonalRecords';

// ─── Templates Context ──────────────────────────────────────────────
interface TemplatesContextType {
  templates: WorkoutTemplate[];
  activeId: string | null;
  isLoading: boolean;
  saveTemplate: (
    name: string,
    data: WorkoutData,
    id?: string,
    blockStructure?: BlockStructure,
  ) => Promise<void>;
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

// ponytail: cap 500 records per exercise (~4.8MB total for 48 exercises)
export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const templatesRef = useRef<WorkoutTemplate[]>([]);
  const prRef = useRef<PersonalRecord[]>([]);

  const loadData = useCallback(async () => {
    try {
      const data = await storage.loadAll();
      templatesRef.current = data.templates;
      prRef.current = data.personalRecords;
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

  const saveTemplate = useCallback(
    async (name: string, data: WorkoutData, id?: string, blockStructure?: BlockStructure) => {
      let targetId = id;
      const current = templatesRef.current;
      let updatedTemplates: WorkoutTemplate[];

      const exists = current.some((t) => t.id === id);

      if (id && exists) {
        updatedTemplates = current.map((t) =>
          t.id === id
            ? { ...t, name, data, blockStructure: blockStructure ?? t.blockStructure }
            : t,
        );
      } else {
        targetId = Date.now().toString();
        const newTemplate: WorkoutTemplate = {
          id: targetId,
          name,
          data,
          blockStructure,
          createdAt: new Date().toISOString(),
        };
        updatedTemplates = [...current, newTemplate];
      }

      const nextActiveId = exists ? activeId || id || null : targetId || null;

      // ponytail: optimistic ref so a rapid double-save can't clobber; a failed write reverts to the pre-save snapshot
      templatesRef.current = updatedTemplates;
      setTemplates(updatedTemplates);

      try {
        await Promise.all([
          storage.saveTemplates(updatedTemplates),
          storage.saveActiveId(nextActiveId),
        ]);
      } catch {
        templatesRef.current = current;
        setTemplates(current);
        Alert.alert('Erro', 'Não foi possível salvar o template.');
      }
    },
    [activeId],
  );

  const deleteTemplate = useCallback(
    async (id: string) => {
      const current = templatesRef.current;
      const nextTemplates = current.filter((t) => t.id !== id);
      const isActiveDeleted = activeId === id;

      templatesRef.current = nextTemplates;
      setTemplates(nextTemplates);

      try {
        await Promise.all([
          storage.saveTemplates(nextTemplates),
          isActiveDeleted ? storage.saveActiveId(null) : Promise.resolve(),
        ]);
        if (isActiveDeleted) setActiveId(null);
      } catch {
        templatesRef.current = current;
        setTemplates(current);
        Alert.alert('Erro', 'Não foi possível excluir o template.');
      }
    },
    [activeId],
  );

  const selectActiveTemplate = useCallback(
    async (id: string) => {
      const previous = activeId;
      try {
        if (!id) {
          setActiveId(null);
          await storage.saveActiveId(null);
        } else {
          setActiveId(id);
          await storage.saveActiveId(id);
        }
      } catch {
        setActiveId(previous);
        Alert.alert('Erro', 'Não foi possível salvar o template ativo.');
      }
    },
    [activeId],
  );

  const savePR = useCallback(
    async (
      exerciseId: string,
      exerciseName: string,
      muscleGroup: MuscleGroup,
      weight: number,
      reps: number,
    ) => {
      const now = new Date();
      const newRecord: PersonalRecord = {
        id: Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
        exerciseId,
        exerciseName,
        muscleGroup,
        weight,
        reps,
        date: now.toLocaleDateString('pt-BR'),
        timestamp: now.toISOString(),
      };

      // ponytail: cap 500 records per exercise (~4.8MB total for 48 exercises)
      const current = prRef.current;
      const updated = capPersonalRecords(current, newRecord);

      prRef.current = updated;
      setPersonalRecords(updated);

      try {
        await storage.savePersonalRecords(updated);
      } catch {
        prRef.current = current;
        setPersonalRecords(current);
        Alert.alert('Erro', 'Não foi possível salvar o recorde.');
      }
    },
    [],
  );

  const deletePR = useCallback(async (id: string) => {
    const current = prRef.current;
    const updated = current.filter((r) => r.id !== id);

    prRef.current = updated;
    setPersonalRecords(updated);

    try {
      await storage.savePersonalRecords(updated);
    } catch {
      prRef.current = current;
      setPersonalRecords(current);
      Alert.alert('Erro', 'Não foi possível excluir o recorde.');
    }
  }, []);

  const getExercisePR = useCallback(
    (exerciseId: string) => {
      return getBestPersonalRecord(personalRecords.filter((r) => r.exerciseId === exerciseId));
    },
    [personalRecords],
  );

  const templatesValue = useMemo(
    () => ({
      templates,
      activeId,
      isLoading,
      saveTemplate,
      deleteTemplate,
      selectActiveTemplate,
    }),
    [templates, activeId, isLoading, saveTemplate, deleteTemplate, selectActiveTemplate],
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
    <TemplatesContext.Provider value={templatesValue}>
      <PersonalRecordsContext.Provider value={prValue}>{children}</PersonalRecordsContext.Provider>
    </TemplatesContext.Provider>
  );
}

// ─── Hooks ──────────────────────────────────────────────────────────
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
