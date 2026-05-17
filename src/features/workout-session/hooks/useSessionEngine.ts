import { PlannedExercise } from "@/types/workout";
import * as Haptics from "expo-haptics";
import { useEffect, useMemo, useState } from "react";

// Contrato de entrada do motor
interface UseSessionEngineProps {
  exercises: PlannedExercise[];
}

// Estrutura do progresso: { "id-exercicio": [true, false, false] }
export type SessionProgress = Record<string, boolean[]>;

export function useSessionEngine({ exercises }: UseSessionEngineProps) {
  const [progress, setProgress] = useState<SessionProgress>({});

  // Inicializa o progresso sempre que a lista de exercícios mudar (troca de dia ou de treino)
  useEffect(() => {
    const initialProgress: SessionProgress = {};
    exercises.forEach((ex) => {
      initialProgress[ex.id] = Array(ex.sets).fill(false);
    });
    setProgress(initialProgress);
  }, [exercises]);

  // Avança uma série por vez (Clique Curto)
  const handleCheckNextSet = (exerciseId: string) => {
    setProgress((prev) => {
      const currentSets = prev[exerciseId];
      if (!currentSets) return prev;

      // Encontra o primeiro índice que ainda é 'false'
      const nextIndex = currentSets.indexOf(false);

      if (nextIndex === -1) return prev; // Todas as séries já foram feitas

      const updatedSets = [...currentSets];
      updatedSets[nextIndex] = true;

      // Feedback tátil de sucesso/conclusão de etapa
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      return { ...prev, [exerciseId]: updatedSets };
    });
  };

  // Reseta todas as séries do exercício específico (Clique Longo)
  const handleLongPressResetExercise = (exerciseId: string) => {
    setProgress((prev) => {
      const currentSets = prev[exerciseId];
      if (!currentSets) return prev;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

      return {
        ...prev,
        [exerciseId]: Array(currentSets.length).fill(false),
      };
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
    handleLongPressResetExercise,
    stats,
  };
}
