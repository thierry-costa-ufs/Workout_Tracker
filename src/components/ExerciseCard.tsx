import { PlannedExercise } from "@/types/workout";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SetSegment } from "./SetSegment";

interface ExerciseCardProps {
  exercise: PlannedExercise;
  progressSets: boolean[];
  onPress: () => void;
  onLongPress: () => void;
}

export const ExerciseCard = React.memo(
  function ExerciseCard({
    exercise,
    progressSets = [],
    onPress,
    onLongPress,
  }: ExerciseCardProps) {
    const completedCount = progressSets.filter(Boolean).length;
    const isFullyCompleted = completedCount === exercise.sets;

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        onLongPress={onLongPress}
        style={[styles.card, isFullyCompleted && styles.cardFinished]}
      >
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{exercise.name}</Text>
            <Text style={styles.subText}>
              {exercise.muscleGroup.toUpperCase()} •{" "}
              {exercise.equipment.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.counter}>
            {completedCount}/{exercise.sets}
          </Text>
        </View>

        <View style={styles.grid}>
          {progressSets.map((isCompleted, index) => (
            <SetSegment key={index} isCompleted={isCompleted} />
          ))}
        </View>
      </TouchableOpacity>
    );
  },

  (prevProps, nextProps) => {
    return (
      prevProps.exercise.id === nextProps.exercise.id &&
      prevProps.progressSets?.length === nextProps.progressSets?.length &&
      prevProps.progressSets?.every(
        (val, i) => val === nextProps.progressSets?.[i],
      )
    );
  },
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2C2C2E",
  },
  cardFinished: {
    borderColor: "#E5E5EA",
    backgroundColor: "#151518",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  name: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  subText: {
    color: "#8E8E93",
    fontSize: 12,
    marginTop: 4,
  },
  counter: {
    color: "#E5E5EA",
    fontWeight: "700",
    fontSize: 14,
  },
  grid: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
