import React from "react";
import { StyleSheet, View } from "react-native";

interface SetSegmentProps {
  isCompleted: boolean;
}

export const SetSegment = React.memo(function SetSegment({
  isCompleted,
}: SetSegmentProps) {
  return (
    <View
      style={[
        styles.segment,
        isCompleted ? styles.completed : styles.incomplete,
      ]}
    />
  );
});

const styles = StyleSheet.create({
  segment: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 2,
  },
  completed: {
    backgroundColor: "#E5E5EA",
  },
  incomplete: {
    backgroundColor: "#2C2C2E",
  },
});
