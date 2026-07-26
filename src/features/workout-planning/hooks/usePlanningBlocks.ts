import { DAYS_OF_WEEK, createEmptyWorkoutData } from "@/core/constants/days";
import { WorkoutData } from "@/types/workout";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { useWorkouts } from "@/context/WorkoutContext";
import {
  WorkoutBlock,
  createBlock,
  getNextLabel,
  reconstructFromWorkoutData,
} from "../utils/blockSerializer";

export function usePlanningBlocks() {
  const { templates, activeId, saveTemplate, selectActiveTemplate } =
    useWorkouts();

  const [blocks, setBlocks] = useState<WorkoutBlock[]>([createBlock("A")]);
  const [daySplit, setDaySplit] = useState<Record<string, string | null>>({});
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(
    blocks[0]?.id ?? null,
  );

  const currentActivePlan = templates.find(
    (template) => template.id === activeId,
  );
  const selectedBlock = blocks.find((b) => b.id === selectedBlockId) || null;
  const trainingDaysCount = Object.values(daySplit).filter(Boolean).length;
  const restDaysCount = DAYS_OF_WEEK.length - trainingDaysCount;

  useEffect(() => {
    if (activeId && currentActivePlan?.data) {
      const { blocks: rebuiltBlocks, daySplit: rebuiltSplit } =
        reconstructFromWorkoutData(currentActivePlan.data);
      setBlocks(rebuiltBlocks);
      setDaySplit(rebuiltSplit);
      setSelectedBlockId(rebuiltBlocks[0]?.id ?? null);
    } else if (!activeId || !currentActivePlan) {
      const freshBlock = createBlock("A");
      setBlocks([freshBlock]);
      setDaySplit({});
      setSelectedBlockId(freshBlock.id);
    }
  }, [activeId, currentActivePlan]);

  const handleNewPlan = useCallback(() => {
    selectActiveTemplate("");
    const freshBlock = createBlock("A");
    setBlocks([freshBlock]);
    setDaySplit({});
    setSelectedBlockId(freshBlock.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [selectActiveTemplate]);

  const buildWorkoutDataFromBlocks = useCallback((): WorkoutData => {
    const data = createEmptyWorkoutData();
    DAYS_OF_WEEK.forEach((day) => {
      const blockId = daySplit[day.id];
      const block = blocks.find((b) => b.id === blockId);
      data[day.id] = block ? block.exercises : [];
    });
    return data;
  }, [blocks, daySplit]);

  const handleAddBlock = useCallback(() => {
    const newBlock = createBlock(getNextLabel(blocks));
    setBlocks((prev) => [...prev, newBlock]);
    setSelectedBlockId(newBlock.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [blocks]);

  const handleDeleteBlock = useCallback((blockId: string) => {
    setBlocks((prev) => {
      const remaining = prev.filter((b) => b.id !== blockId);
      return remaining;
    });

    setDaySplit((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((dayId) => {
        if (updated[dayId] === blockId) updated[dayId] = null;
      });
      return updated;
    });

    setSelectedBlockId((prev) =>
      prev === blockId ? null : prev,
    );
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const confirmDeleteBlock = useCallback(
    (blockId: string) => {
      if (blocks.length <= 1) {
        Alert.alert(
          "Não é possível excluir",
          "Mantenha pelo menos um bloco de treino ativo.",
        );
        return;
      }

      Alert.alert(
        "Excluir bloco",
        "Os dias vinculados a este bloco ficarão como descanso.",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Excluir",
            style: "destructive",
            onPress: () => handleDeleteBlock(blockId),
          },
        ],
      );
    },
    [blocks.length, handleDeleteBlock],
  );

  const handleRenameBlock = useCallback((blockId: string, newLabel: string) => {
    if (!newLabel.trim()) return;
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === blockId ? { ...b, label: newLabel.trim().toUpperCase() } : b,
      ),
    );
  }, []);

  const handleAddExerciseToBlock = useCallback(
    (item: { id: string; name: string; muscleGroup: string; mechanic: string; equipment: string; defaultSets?: number }) => {
      if (!selectedBlockId) return;

      setBlocks((prev) =>
        prev.map((block) => {
          if (block.id !== selectedBlockId) return block;

          const existingIndex = block.exercises.findIndex(
            (exercise) => exercise.id === item.id,
          );

          if (existingIndex > -1) {
            const updated = block.exercises.map((exercise, index) =>
              index === existingIndex
                ? { ...exercise, sets: exercise.sets + 1 }
                : exercise,
            );
            return { ...block, exercises: updated };
          }

          const newExercise = {
            id: item.id,
            name: item.name,
            muscleGroup: item.muscleGroup,
            mechanic: item.mechanic,
            equipment: item.equipment,
            sets: item.defaultSets || 3,
          };

          return { ...block, exercises: [...block.exercises, newExercise] };
        }),
      );
    },
    [selectedBlockId],
  );

  const handleUpdateSetsInBlock = useCallback(
    (blockId: string, index: number, newSets: number) => {
      if (newSets < 1) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      setBlocks((prev) =>
        prev.map((block) => {
          if (block.id !== blockId) return block;
          const updated = block.exercises.map((exercise, i) =>
            i === index ? { ...exercise, sets: newSets } : exercise,
          );
          return { ...block, exercises: updated };
        }),
      );
    },
    [],
  );

  const handleRemoveExerciseFromBlock = useCallback(
    (blockId: string, index: number) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setBlocks((prev) =>
        prev.map((block) => {
          if (block.id !== blockId) return block;
          return {
            ...block,
            exercises: block.exercises.filter((_, i) => i !== index),
          };
        }),
      );
    },
    [],
  );

  const handleAssignDay = useCallback((dayId: string, blockId: string | null) => {
    setDaySplit((prev) => ({ ...prev, [dayId]: blockId }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleDistributeAcrossDays = useCallback(
    (targetTrainingDays: number) => {
      if (blocks.length === 0) return;
      const count = Math.min(
        Math.max(targetTrainingDays, 1),
        DAYS_OF_WEEK.length,
      );

      const updated: Record<string, string | null> = {};
      DAYS_OF_WEEK.forEach((day, index) => {
        updated[day.id] =
          index < count ? blocks[index % blocks.length].id : null;
      });

      setDaySplit(updated);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    [blocks],
  );

  return {
    blocks,
    daySplit,
    selectedBlockId,
    selectedBlock,
    currentActivePlan,
    trainingDaysCount,
    restDaysCount,
    templates,
    activeId,
    setSelectedBlockId,
    handleNewPlan,
    buildWorkoutDataFromBlocks,
    handleAddBlock,
    confirmDeleteBlock,
    handleRenameBlock,
    handleAddExerciseToBlock,
    handleUpdateSetsInBlock,
    handleRemoveExerciseFromBlock,
    handleAssignDay,
    handleDistributeAcrossDays,
    saveTemplate,
    selectActiveTemplate,
  };
}
