import { MuscleGroup, PersonalRecord } from '@/types/workout';
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
import { workoutStorage } from '@/core/storage/workoutStorage';
import { capPersonalRecords, getBestPersonalRecord } from '@/core/utils/capPersonalRecords';

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

export function PersonalRecordsProvider({ children }: { children: React.ReactNode }) {
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const prRef = useRef<PersonalRecord[]>([]);

  const loadData = useCallback(async () => {
    try {
      const next = await workoutStorage.loadPersonalRecords();
      prRef.current = next;
      setPersonalRecords(next);
    } catch {
      // ponytail: unreadable storage = empty list
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
        await workoutStorage.savePersonalRecords(updated);
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
      await workoutStorage.savePersonalRecords(updated);
    } catch {
      prRef.current = current;
      setPersonalRecords(current);
      Alert.alert('Erro', 'Não foi possível excluir o recorde.');
    }
  }, []);

  const getExercisePR = useCallback((exerciseId: string) => {
    return getBestPersonalRecord(prRef.current.filter((r) => r.exerciseId === exerciseId));
  }, []);

  const value = useMemo(
    () => ({ personalRecords, savePR, deletePR, getExercisePR }),
    [personalRecords, savePR, deletePR, getExercisePR],
  );

  return (
    <PersonalRecordsContext.Provider value={value}>{children}</PersonalRecordsContext.Provider>
  );
}

export function usePersonalRecords() {
  const ctx = useContext(PersonalRecordsContext);
  if (!ctx) throw new Error('usePersonalRecords must be used within a PersonalRecordsProvider');
  return ctx;
}
