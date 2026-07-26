import React from "react";
import { StyleSheet, View } from "react-native";

interface SetSegmentProps {
  isCompleted: boolean;
}

export const SetSegment = React.memo(function SetSegment({ isCompleted }: SetSegmentProps) {
  return <View style={[styles.segment, isCompleted && styles.segmentCompleted]} />;
});

const styles = StyleSheet.create({
  segment: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3A3A3D",
    marginRight: 4,
  },
  segmentCompleted: {
    backgroundColor: "#E5E5EA",
  },
});
