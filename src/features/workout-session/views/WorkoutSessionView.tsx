import { ExerciseCard } from "@/components/ExerciseCard";
import { TelemetryDisplay } from "@/components/TelemetryDisplay";
import { PlannedExercise } from "@/types/workout";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSessionEngine } from "../hooks/useSessionEngine";

interface WorkoutSessionViewProps {
  exercises: PlannedExercise[];
}

export function WorkoutSessionView({ exercises }: WorkoutSessionViewProps) {
  const { progress, handleCheckNextSet, handleLongPressResetExercise, stats } =
    useSessionEngine({ exercises });

  if (!exercises || exercises.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          Nenhum exercício planejado para hoje.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TelemetryDisplay
        completed={stats.completedSets}
        total={stats.totalSets}
        percentage={stats.percentage}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {exercises.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            progressSets={progress[exercise.id] || []}
            onPress={() => handleCheckNextSet(exercise.id)}
            onLongPress={() => handleLongPressResetExercise(exercise.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    paddingBottom: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#8E8E93",
    fontSize: 14,
  },
});
