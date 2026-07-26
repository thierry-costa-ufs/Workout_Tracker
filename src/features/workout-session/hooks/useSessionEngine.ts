import { PlannedExercise } from "@/types/workout";
import * as Haptics from "expo-haptics";
import { useEffect, useMemo, useState } from "react";

interface UseSessionEngineProps {
  exercises: PlannedExercise[];
}

export type SessionProgress = Record<string, boolean[]>;

export function useSessionEngine({ exercises }: UseSessionEngineProps) {
  const [progress, setProgress] = useState<SessionProgress>({});

  useEffect(() => {
    const initialProgress: SessionProgress = {};
    exercises.forEach((ex) => {
      initialProgress[ex.id] = Array(ex.sets).fill(false);
    });
    setProgress(initialProgress);
  }, [exercises]);

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

  const stats = useMemo(() => {
    let totalSets = 0;
    let completedSets = 0;

    Object.values(progress).forEach((setsArray) => {
      totalSets += setsArray.length;
      completedSets += setsArray.filter(Boolean).length;
    });

    const percentage =
      totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

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
    stats,
  };
}
