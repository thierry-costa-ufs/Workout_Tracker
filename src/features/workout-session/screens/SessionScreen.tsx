import { useWorkouts } from "@/context/WorkoutContext";
import { DAY_LABELS, getWorkoutDayKeyForToday } from "@/lib/workout";
import { appTheme } from "@/shared/constants/theme";
import { AppScreen } from "@/shared/ui/AppScreen";
import { PlannedExercise } from "@/types/workout";
import React, { useMemo } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { WorkoutSessionView } from "../views/WorkoutSessionView";

export default function SessionScreen() {
  const { templates, activeId, isLoading } = useWorkouts();
  const activeTemplate = templates.find((template) => template.id === activeId);
  const currentDayKey = getWorkoutDayKeyForToday();

  const todayExercises = useMemo(() => {
    if (!activeTemplate) {
      return [] as PlannedExercise[];
    }

    const rawExercises = activeTemplate.data[currentDayKey] || [];
    return rawExercises.map((exercise) => ({
      id: exercise.id,
      name: exercise.name,
      muscleGroup: exercise.muscleGroup,
      sets: exercise.sets,
      equipment: exercise.equipment,
      mechanic: exercise.mechanic,
    })) as PlannedExercise[];
  }, [activeTemplate, currentDayKey]);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={appTheme.colors.textPrimary} />
      </View>
    );
  }

  if (!activeTemplate) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.warningText}>NENHUMA ROTINA ATIVA SELECIONADA.</Text>
        <Text style={styles.subWarningText}>
          Vá até a aba de Planejamento e monte/ative uma divisão de treino.
        </Text>
      </View>
    );
  }

  return (
    <AppScreen style={styles.container} backgroundColor={appTheme.colors.surface}>
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <Text style={styles.brandSubtitle}>SESSÃO DE TREINO</Text>
          <Text style={styles.brandTitle}>{activeTemplate.name.toUpperCase()}</Text>
          <Text style={styles.daySubtitle}>{DAY_LABELS[currentDayKey]}</Text>
        </View>
      </View>

      <View style={styles.contentBody}>
        <WorkoutSessionView
          exercises={todayExercises}
          dayName={DAY_LABELS[currentDayKey]}
        />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appTheme.colors.surface,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: appTheme.colors.surface,
    borderBottomWidth: 1,
    borderColor: appTheme.colors.border,
  },
  titleBlock: {
    flex: 1,
  },
  brandSubtitle: {
    color: appTheme.colors.textMuted,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  brandTitle: {
    color: appTheme.colors.textPrimary,
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -1,
    marginBottom: 6,
  },
  daySubtitle: {
    color: appTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1,
  },
  contentBody: {
    flex: 1,
    backgroundColor: appTheme.colors.background,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: appTheme.colors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  warningText: {
    color: appTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.5,
    textAlign: "center",
    marginBottom: 8,
  },
  subWarningText: {
    color: appTheme.colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
});
