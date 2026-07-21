import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface TelemetryDisplayProps {
  completed: number;
  total: number;
  percentage: number;
}

export const TelemetryDisplay = React.memo(function TelemetryDisplay({
  completed,
  total,
  percentage,
}: TelemetryDisplayProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{completed}/{total} sets</Text>
      <Text style={styles.text}>{Math.round(percentage)}%</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    paddingBottom: 12,
  },
  text: {
    color: "#8E8E93",
    fontSize: 12,
    fontWeight: "700",
  },
});
