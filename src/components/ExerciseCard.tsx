import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SetSegment } from "./SetSegment";

interface ExerciseCardProps {
  exercise: {
    id: string;
    name: string;
    muscleGroup?: string;
    sets?: number;
  };
  progressSets: boolean[];
  onPress: () => void;
  onLongPress: () => void;
}

export const ExerciseCard = React.memo(function ExerciseCard({
  exercise,
  progressSets,
  onPress,
  onLongPress,
}: ExerciseCardProps) {
  return (
    <TouchableOpacity onPress={onPress} onLongPress={onLongPress} style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.name}>{exercise.name}</Text>
        <Text style={styles.meta}>{exercise.muscleGroup || ""}</Text>
      </View>

      <View style={styles.setsRow}>
        {progressSets.map((isCompleted, index) => (
          <SetSegment key={`${exercise.id}-${index}`} isCompleted={isCompleted} />
        ))}
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1C1C1F",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  name: {
    color: "#E5E5EA",
    fontSize: 14,
    fontWeight: "700",
    flex: 1,
  },
  meta: {
    color: "#8E8E93",
    fontSize: 11,
    fontWeight: "600",
  },
  setsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
});
