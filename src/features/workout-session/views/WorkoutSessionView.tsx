import { ExerciseCard } from '../components/ExerciseCard';
import { TelemetryDisplay } from '../components/TelemetryDisplay';
import { PlannedExercise, PersonalRecord } from '@/types/workout';
import { appTheme } from '@/shared/constants/theme';
import { ScrollView, Text, View } from 'react-native';
import { useSessionEngine } from '../hooks/useSessionEngine';

interface WorkoutSessionViewProps {
  exercises: PlannedExercise[];
  personalRecords?: PersonalRecord[];
}

export function WorkoutSessionView({ exercises, personalRecords }: WorkoutSessionViewProps) {
  const { progress, handleCheckNextSet, handleUndoLastSet, stats } = useSessionEngine({
    exercises,
  });

  const findPR = (exerciseId: string) =>
    personalRecords?.find((pr) => pr.exerciseId === exerciseId);

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
      <TelemetryDisplay
        completed={stats.completedSets}
        total={stats.totalSets}
        percentage={stats.percentage}
      />

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
