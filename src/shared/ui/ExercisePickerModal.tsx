import { ExerciseData, PersonalRecord } from '@/types/workout';
import { appTheme } from '@/shared/constants/theme';
import { sharedScreenStyles } from '@/shared/styles/screenStyles';
import { MuscleFilterChips } from '@/shared/ui/MuscleFilterChips';
import { SearchBar } from '@/shared/ui/SearchBar';
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useCallback, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { Overlay } from '@/shared/ui/Overlay';
import { ExercisePickerCard } from '@/features/workout-planning/components/ExercisePickerCard';
import { EXERCISES_LIST } from '@/core/constants/exercises';
import { MuscleFilterType } from '@/core/constants/days';

interface ExercisePickerModalProps {
  visible: boolean;
  onClose: () => void;
  selectedBlock: { id: string; label: string } | null;
  getExercisePR: (id: string) => PersonalRecord | undefined;
  onAddExercise: (exercise: ExerciseData) => void;
}

export function ExercisePickerModal({
  visible,
  onClose,
  selectedBlock,
  getExercisePR,
  onAddExercise,
}: ExercisePickerModalProps) {
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState<MuscleFilterType>('Todos');
  const [exerciseSearch, setExerciseSearch] = useState('');

  const handleClose = () => {
    setSelectedMuscleFilter('Todos');
    setExerciseSearch('');
    onClose();
  };

  const handleAdd = useCallback(
    (exercise: ExerciseData) => {
      onAddExercise(exercise);
    },
    [onAddExercise],
  );

  const filteredExercises = useMemo(() => {
    return EXERCISES_LIST.filter(
      (exercise) =>
        (selectedMuscleFilter === 'Todos' || exercise.muscleGroup === selectedMuscleFilter) &&
        (exerciseSearch === '' ||
          exercise.name.toLowerCase().includes(exerciseSearch.toLowerCase())),
    );
  }, [selectedMuscleFilter, exerciseSearch]);

  return (
    <Overlay
      visible={visible}
      onClose={handleClose}
      animationType="slide"
      style={{ height: '85%' }}
    >
      <View style={sharedScreenStyles.modalHeader}>
        <View>
          <Text style={sharedScreenStyles.modalTitle}>EXERCÍCIOS</Text>
          <Text style={sharedScreenStyles.modalSubtitle}>
            {selectedBlock ? `para Bloco ${selectedBlock.label}` : 'Selecione um bloco primeiro'}
          </Text>
        </View>
        <TouchableOpacity style={sharedScreenStyles.closeModalBtn} onPress={handleClose}>
          <Ionicons name="close" size={20} color={appTheme.colors.white} />
        </TouchableOpacity>
      </View>

      <SearchBar value={exerciseSearch} onChange={setExerciseSearch} />

      <View style={{ height: 16 }} />

      <MuscleFilterChips value={selectedMuscleFilter} onChange={setSelectedMuscleFilter} />

      <View style={{ height: 16 }} />

      <FlatList
        data={filteredExercises}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ExercisePickerCard item={item} pr={getExercisePR(item.id)} onAdd={handleAdd} />
        )}
      />
    </Overlay>
  );
}
