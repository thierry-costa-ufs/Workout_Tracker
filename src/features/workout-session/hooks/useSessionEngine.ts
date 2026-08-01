import { PlannedExercise, WorkoutDayKey } from '@/types/workout';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface UseSessionEngineProps {
  exercises: PlannedExercise[];
  templateId: string | null;
  dayKey: WorkoutDayKey;
}

export type SessionProgress = Record<string, boolean[]>;

const progressKey = (templateId: string) => `@gym_app:session_progress:${templateId}`;

function getToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

function buildEmptyProgress(exercises: PlannedExercise[]): SessionProgress {
  const progress: SessionProgress = {};
  exercises.forEach((ex) => {
    progress[ex.id] = Array(ex.sets).fill(false);
  });
  return progress;
}

export function useSessionEngine({ exercises, templateId, dayKey }: UseSessionEngineProps) {
  const [progress, setProgress] = useState<SessionProgress>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setProgress(buildEmptyProgress(exercises));
  }, [exercises]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        if (!templateId) return;

        const raw = await AsyncStorage.getItem(progressKey(templateId));
        if (cancelled || !raw) return;

        const stored = JSON.parse(raw) as {
          dayKey?: string | null;
          date?: string | null;
          progress?: SessionProgress | null;
        };

        if (stored.progress && stored.dayKey === dayKey && stored.date === getToday()) {
          setProgress(stored.progress);
        }
      } catch {
        // ponytail: corrupt or missing progress = fresh session
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [templateId, dayKey]);

  useEffect(() => {
    if (!hydrated || !templateId) return;
    AsyncStorage.setItem(
      progressKey(templateId),
      JSON.stringify({ dayKey, date: getToday(), progress }),
    ).catch(() => {});
  }, [progress, hydrated, templateId, dayKey]);

  const handleCheckNextSet = (exerciseId: string) => {
    setProgress((prev) => {
      const currentSets = prev[exerciseId];
      if (!currentSets) return prev;

      const nextIndex = currentSets.indexOf(false);
      if (nextIndex === -1) return prev;

      const updatedSets = [...currentSets];
      updatedSets[nextIndex] = true;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      return { ...prev, [exerciseId]: updatedSets };
    });
  };

  const handleUndoLastSet = (exerciseId: string) => {
    setProgress((prev) => {
      const currentSets = prev[exerciseId];
      if (!currentSets) return prev;

      const lastCompleted = currentSets.lastIndexOf(true);
      if (lastCompleted === -1) return prev;

      const updatedSets = [...currentSets];
      updatedSets[lastCompleted] = false;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      return { ...prev, [exerciseId]: updatedSets };
    });
  };

  const resetProgress = useCallback(() => {
    setProgress(buildEmptyProgress(exercises));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [exercises]);

  const stats = useMemo(() => {
    let totalSets = 0;
    let completedSets = 0;

    Object.values(progress).forEach((setsArray) => {
      totalSets += setsArray.length;
      completedSets += setsArray.filter(Boolean).length;
    });

    const percentage = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

    return {
      totalSets,
      completedSets,
      percentage,
    };
  }, [progress]);

  return {
    progress,
    handleCheckNextSet,
    handleUndoLastSet,
    resetProgress,
    stats,
  };
}
