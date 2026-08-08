import { DAYS_OF_WEEK, createEmptyWorkoutData } from '@/core/constants/days';
import { ExerciseData, WorkoutData } from '@/types/workout';
import { useActiveTemplate } from '@/shared/hooks/useActiveTemplate';
import { confirmDelete } from '@/shared/utils/confirmDelete';
import { hapticLight, hapticMedium, hapticNotify } from '@/core/utils/haptics';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useTemplates } from '@/context/TemplatesContext';
import {
  WorkoutBlock,
  createBlock,
  findDuplicateBlockSignatures,
  getNextLabel,
  reconstructFromBlockStructure,
  reconstructFromWorkoutData,
} from '../utils/blockSerializer';

export function usePlanningBlocks() {
  const { templates, activeId, saveTemplate, selectActiveTemplate } = useTemplates();
  const currentActivePlan = useActiveTemplate();

  const [blocks, setBlocks] = useState<WorkoutBlock[]>([createBlock('A')]);
  const [daySplit, setDaySplit] = useState<Record<string, string | null>>({});
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(blocks[0]?.id ?? null);

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId) || null;
  const trainingDaysCount = Object.values(daySplit).filter(Boolean).length;
  const restDaysCount = DAYS_OF_WEEK.length - trainingDaysCount;

  useEffect(() => {
    if (activeId && currentActivePlan?.data) {
      const { blocks: rebuiltBlocks, daySplit: rebuiltSplit } = currentActivePlan.blockStructure
        ? reconstructFromBlockStructure(currentActivePlan.blockStructure, currentActivePlan.data)
        : reconstructFromWorkoutData(currentActivePlan.data);
      setBlocks(rebuiltBlocks);
      setDaySplit(rebuiltSplit);
      setSelectedBlockId(rebuiltBlocks[0]?.id ?? null);
    } else if (!activeId || !currentActivePlan) {
      const freshBlock = createBlock('A');
      setBlocks([freshBlock]);
      setDaySplit({});
      setSelectedBlockId(freshBlock.id);
    }
  }, [activeId, currentActivePlan]);

  const handleNewPlan = useCallback(() => {
    selectActiveTemplate(null);
    const freshBlock = createBlock('A');
    setBlocks([freshBlock]);
    setDaySplit({});
    setSelectedBlockId(freshBlock.id);
    hapticMedium();
  }, [selectActiveTemplate]);

  const buildWorkoutDataFromBlocks = useCallback(
    (bl: WorkoutBlock[], sp: Record<string, string | null>): WorkoutData => {
      const data = createEmptyWorkoutData();
      DAYS_OF_WEEK.forEach((day) => {
        const blockId = sp[day.id];
        const block = bl.find((b) => b.id === blockId);
        data[day.id] = block ? block.exercises : [];
      });
      return data;
    },
    [],
  );

  const handleAddBlock = useCallback(() => {
    const newBlock = createBlock(getNextLabel(blocks));
    setBlocks((prev) => [...prev, newBlock]);
    setSelectedBlockId(newBlock.id);
    hapticMedium();
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

    setSelectedBlockId((prev) => (prev === blockId ? null : prev));
    hapticNotify();
  }, []);

  const confirmDeleteBlock = useCallback(
    (blockId: string) => {
      if (blocks.length <= 1) {
        Alert.alert('Não é possível excluir', 'Mantenha pelo menos um bloco de treino ativo.');
        return;
      }

      confirmDelete('Excluir bloco', 'Os dias vinculados a este bloco ficarão como descanso.', () =>
        handleDeleteBlock(blockId),
      );
    },
    [blocks.length, handleDeleteBlock],
  );

  const handleRenameBlock = useCallback((blockId: string, newLabel: string) => {
    if (!newLabel.trim()) return;
    setBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, label: newLabel.trim().toUpperCase() } : b)),
    );
  }, []);

  const handleAddExerciseToBlock = useCallback(
    (item: ExerciseData) => {
      if (!selectedBlockId) return;

      setBlocks((prev) =>
        prev.map((block) => {
          if (block.id !== selectedBlockId) return block;

          const existingIndex = block.exercises.findIndex((exercise) => exercise.id === item.id);

          if (existingIndex > -1) {
            const updated = block.exercises.map((exercise, index) =>
              index === existingIndex ? { ...exercise, sets: exercise.sets + 1 } : exercise,
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

  const handleUpdateSetsInBlock = useCallback((blockId: string, index: number, newSets: number) => {
    if (newSets < 1) return;
    hapticLight();

    setBlocks((prev) =>
      prev.map((block) => {
        if (block.id !== blockId) return block;
        const updated = block.exercises.map((exercise, i) =>
          i === index ? { ...exercise, sets: newSets } : exercise,
        );
        return { ...block, exercises: updated };
      }),
    );
  }, []);

  const handleRemoveExerciseFromBlock = useCallback((blockId: string, index: number) => {
    hapticMedium();
    setBlocks((prev) =>
      prev.map((block) => {
        if (block.id !== blockId) return block;
        return {
          ...block,
          exercises: block.exercises.filter((_, i) => i !== index),
        };
      }),
    );
  }, []);

  const handleAssignDay = useCallback((dayId: string, blockId: string | null) => {
    setDaySplit((prev) => ({ ...prev, [dayId]: blockId }));
    hapticLight();
  }, []);

  const mergeDuplicateBlocks = useCallback(() => {
    const groups = findDuplicateBlockSignatures(blocks);
    const dropToKeep = new Map<string, string>();
    groups.forEach((group) => {
      const survivorId = group[0]!.id;
      group.slice(1).forEach((block) => dropToKeep.set(block.id, survivorId));
    });

    const mergedBlocks = blocks.filter((b) => !dropToKeep.has(b.id));
    const mergedDaySplit = { ...daySplit };
    Object.keys(mergedDaySplit).forEach((dayId) => {
      const blockId = mergedDaySplit[dayId];
      if (blockId && dropToKeep.has(blockId)) {
        mergedDaySplit[dayId] = dropToKeep.get(blockId) ?? blockId;
      }
    });

    setBlocks(mergedBlocks);
    setDaySplit(mergedDaySplit);
    setSelectedBlockId((prev) =>
      prev && dropToKeep.has(prev) ? (dropToKeep.get(prev) ?? null) : prev,
    );
    hapticNotify();

    return { blocks: mergedBlocks, daySplit: mergedDaySplit };
  }, [blocks, daySplit]);

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
    mergeDuplicateBlocks,
    saveTemplate,
    selectActiveTemplate,
  };
}
