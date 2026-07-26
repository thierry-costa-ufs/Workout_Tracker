import { MUSCLE_FILTERS, MuscleFilterType } from '@/core/constants/days';
import { EXERCISES_LIST } from '@/core/constants/exercises';
import { ExerciseData, PersonalRecord } from '@/types/workout';
import { appTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { FlatList, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Overlay } from '@/shared/ui/Overlay';
import { ExercisePickerCard } from './ExercisePickerCard';
import { planningStyles as styles } from '../styles/planningStyles';

interface ExercisePickerModalProps {
  visible: boolean;
  onClose: () => void;
  selectedBlock: { id: string; label: string } | undefined;
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
      <View style={styles.modalHeader}>
        <View>
          <Text style={styles.modalTitle}>BIBLIOTECA</Text>
          <Text style={styles.modalSubtitle}>
            {selectedBlock
              ? `Injetando cargas no Bloco ${selectedBlock.label}`
              : 'Selecione um bloco primeiro'}
          </Text>
        </View>
        <TouchableOpacity style={styles.closeModalButton} onPress={handleClose}>
          <Ionicons name="close" size={20} color={appTheme.colors.textInverse} />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {MUSCLE_FILTERS.map((muscle) => {
            const isSelected = selectedMuscleFilter === muscle;
            return (
              <TouchableOpacity
                key={muscle}
                onPress={() => setSelectedMuscleFilter(muscle)}
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
              >
                <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                  {muscle}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={16} color={appTheme.colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar exercício..."
          placeholderTextColor={appTheme.colors.textMuted}
          value={exerciseSearch}
          onChangeText={setExerciseSearch}
          autoCorrect={false}
        />
      </View>

      <FlatList
        data={filteredExercises}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        style={styles.fullWidth}
        renderItem={({ item }) => (
          <ExercisePickerCard
            item={item}
            pr={getExercisePR(item.id)}
            onAdd={() => onAddExercise(item)}
          />
        )}
      />
    </Overlay>
  );
}
