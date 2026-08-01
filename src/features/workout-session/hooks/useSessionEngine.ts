import { PlannedExercise, WorkoutDayKey } from '@/types/workout';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { hapticLight, hapticMedium } from '@/core/utils/haptics';
import { isSessionProgress } from '@/core/validation/guards';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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

// ponytail: plan edited mid-day → carry over surviving sets, truncate/pad to new ex.sets
function mergeProgress(prev: SessionProgress, exercises: PlannedExercise[]): SessionProgress {
  const next: SessionProgress = {};
  exercises.forEach((ex) => {
    const old = prev[ex.id];
    if (!old) {
      next[ex.id] = Array(ex.sets).fill(false);
      return;
    }
    const kept = old.slice(0, ex.sets);
    while (kept.length < ex.sets) kept.push(false);
    next[ex.id] = kept;
  });
  return next;
}

export function useSessionEngine({ exercises, templateId, dayKey }: UseSessionEngineProps) {
  const [progress, setProgress] = useState<SessionProgress>({});
  const [hydrated, setHydrated] = useState(false);

  const planSig = exercises.map((e) => `${e.id}:${e.sets}`).join('|');
  const planSigRef = useRef('');

  useEffect(() => {
    if (planSig === planSigRef.current) return;
    planSigRef.current = planSig;
    setProgress((prev) => mergeProgress(prev, exercises));
  }, [planSig, exercises]);

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

        if (
          stored.progress &&
          isSessionProgress(stored.progress) &&
          stored.dayKey === dayKey &&
          stored.date === getToday()
        ) {
          // ponytail: merge so plan edits mid-day never leave missing exercise keys
          setProgress(mergeProgress(stored.progress, exercises));
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId, dayKey]);

  useEffect(() => {
    if (!hydrated || !templateId) return;
    AsyncStorage.setItem(
      progressKey(templateId),
      JSON.stringify({ dayKey, date: getToday(), progress }),
    ).catch((error) => console.warn('Failed to persist session progress', error));
  }, [progress, hydrated, templateId, dayKey]);

  const handleCheckNextSet = (exerciseId: string) => {
    if (!hydrated) return;
    const currentSets = progress[exerciseId];
    const nextIndex = currentSets ? currentSets.indexOf(false) : -1;
    if (nextIndex === -1) return;

    hapticMedium();
    setProgress((prev) => {
      const sets = prev[exerciseId];
      const idx = sets ? sets.indexOf(false) : -1;
      if (idx === -1) return prev;
      const updatedSets = [...sets];
      updatedSets[idx] = true;
      return { ...prev, [exerciseId]: updatedSets };
    });
  };

  const handleUndoLastSet = (exerciseId: string) => {
    if (!hydrated) return;
    const currentSets = progress[exerciseId];
    const lastCompleted = currentSets ? currentSets.lastIndexOf(true) : -1;
    if (lastCompleted === -1) return;

    hapticLight();
    setProgress((prev) => {
      const sets = prev[exerciseId];
      const idx = sets ? sets.lastIndexOf(true) : -1;
      if (idx === -1) return prev;
      const updatedSets = [...sets];
      updatedSets[idx] = false;
      return { ...prev, [exerciseId]: updatedSets };
    });
  };

  const resetProgress = useCallback(() => {
    if (!hydrated) return;
    setProgress(buildEmptyProgress(exercises));
    hapticMedium();
  }, [exercises, hydrated]);

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
