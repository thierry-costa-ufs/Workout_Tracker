import { useWorkouts } from "@/context/WorkoutContext";
import { DAY_LABELS, getWorkoutDayKeyForToday } from "@/lib/workout";
import { appTheme } from "@/shared/constants/theme";
import { sharedScreenStyles } from "@/shared/styles/screenStyles";
import { AppScreen } from "@/shared/ui/AppScreen";
import { PlannedExercise } from "@/types/workout";
import { useMemo } from "react";
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
      <View style={sharedScreenStyles.emptyStateContainer}>
        <ActivityIndicator size="large" color={appTheme.colors.textPrimary} />
      </View>
    );
  }

  if (!activeTemplate) {
    return (
      <View style={sharedScreenStyles.emptyStateContainer}>
        <Text style={sharedScreenStyles.emptyStateTitle}>
          NENHUMA ROTINA ATIVA SELECIONADA.
        </Text>
        <Text style={sharedScreenStyles.emptyStateText}>
          Vá até a aba de Planejamento e monte/ative uma divisão de treino.
        </Text>
      </View>
    );
  }

  return (
    <AppScreen
      style={sharedScreenStyles.container}
      backgroundColor={appTheme.colors.surface}
    >
      <View style={sharedScreenStyles.pageHeader}>
        <View style={sharedScreenStyles.pageTitleBlock}>
          <Text style={sharedScreenStyles.pageSubtitle}>SESSÃO DE TREINO</Text>
          <Text style={sharedScreenStyles.pageTitle}>
            {activeTemplate.name.toUpperCase()}
          </Text>
          <Text style={styles.daySubtitle}>{DAY_LABELS[currentDayKey]}</Text>
        </View>
      </View>

      <View style={styles.contentBody}>
        <WorkoutSessionView exercises={todayExercises} />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
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
});
