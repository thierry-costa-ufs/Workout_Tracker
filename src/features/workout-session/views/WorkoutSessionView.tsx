import { ExerciseCard } from '../components/ExerciseCard';
import { TelemetryDisplay } from '../components/TelemetryDisplay';
import { PlannedExercise, PersonalRecord, WorkoutDayKey } from '@/types/workout';
import { appTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useCallback } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSessionEngine } from '../hooks/useSessionEngine';

interface WorkoutSessionViewProps {
  exercises: PlannedExercise[];
  personalRecords?: PersonalRecord[];
  templateId: string | null;
  dayKey: WorkoutDayKey;
}

export function WorkoutSessionView({
  exercises,
  personalRecords,
  templateId,
  dayKey,
}: WorkoutSessionViewProps) {
  const { progress, handleCheckNextSet, handleUndoLastSet, resetProgress, stats } =
    useSessionEngine({
      exercises,
      templateId,
      dayKey,
    });

  // ponytail: progressSets refs already stable — functional updater in hook preserves untouched arrays
  const findPR = useCallback(
    (exerciseId: string) => personalRecords?.find((pr) => pr.exerciseId === exerciseId),
    [personalRecords],
  );

  const handleReset = () => {
    Alert.alert('Zerar sessão', 'O progresso de hoje será apagado.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Zerar', style: 'destructive', onPress: resetProgress },
    ]);
  };

  if (!exercises || exercises.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: appTheme.colors.textSecondary, fontSize: 14 }}>
          Nenhum exercício planejado para hoje.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.telemetryRow}>
        <TelemetryDisplay
          completed={stats.completedSets}
          total={stats.totalSets}
          percentage={stats.percentage}
        />
        <Pressable hitSlop={12} onPress={handleReset}>
          <Ionicons name="refresh-outline" size={20} color={appTheme.colors.textTertiary} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {exercises.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            progressSets={progress[exercise.id] || []}
            onPress={() => handleCheckNextSet(exercise.id)}
            onUndo={() => handleUndoLastSet(exercise.id)}
            personalRecord={findPR(exercise.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  telemetryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 4,
  },
});
