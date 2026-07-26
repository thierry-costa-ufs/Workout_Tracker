import React from "react";
import { View } from "react-native";
import { setSegmentStyles as styles } from "../styles/componentsStyles";

interface SetSegmentProps {
  isCompleted: boolean;
}

export const SetSegment = React.memo(function SetSegment({
  isCompleted,
}: SetSegmentProps) {
  return (
    <View style={[styles.segment, isCompleted && styles.segmentCompleted]} />
  );
});
