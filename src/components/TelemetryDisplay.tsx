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
      <View style={styles.row}>
        <View>
          <Text style={styles.label}>VOLUME DE TREINO</Text>
          <Text style={styles.value}>
            {completed} / {total}{" "}
            <Text style={styles.subLabel}>SÉRIES COMPLETAS</Text>
          </Text>
        </View>
        <Text style={styles.percentage}>{percentage}%</Text>
      </View>

      {/* Barra de Progresso Horizontal Contínua */}
      <View style={styles.track}>
        <View style={[styles.bar, { width: `${percentage}%` }]} />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1C1C1E",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2C2C2E",
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  label: {
    color: "#8E8E93",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  value: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 2,
  },
  subLabel: {
    fontSize: 12,
    color: "#8E8E93",
    fontWeight: "normal",
  },
  percentage: {
    color: "#E5E5EA",
    fontSize: 28,
    fontWeight: "800",
  },
  track: {
    height: 4,
    backgroundColor: "#2C2C2E",
    borderRadius: 2,
    overflow: "hidden",
  },
  bar: {
    height: "100%",
    backgroundColor: "#E5E5EA",
  },
});
