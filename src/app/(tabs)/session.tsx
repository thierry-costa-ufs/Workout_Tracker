import { useWorkouts } from "@/context/WorkoutContext";
import { WorkoutSessionView } from "@/features/workout-session";
import { PlannedExercise, WorkoutData } from "@/types/workout";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function SessionScreen() {
  const { templates, activeId, isLoading } = useWorkouts();

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#E5E5EA" />
      </View>
    );
  }

  const activeTemplate = templates.find((t) => t.id === activeId);

  if (!activeTemplate) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.warningText}>
          NENHUMA ROTINA ATIVA SELECIONADA.
        </Text>
        <Text style={styles.subWarningText}>
          Vá até a aba de Planejamento e monte/ative uma divisão de treino.
        </Text>
      </View>
    );
  }

  const getFormattedCurrentDay = (): keyof WorkoutData => {
    const days = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"] as const;
    const dayIndex = new Date().getDay();
    return days[dayIndex] as keyof WorkoutData;
  };

  const currentDayKey = getFormattedCurrentDay();

  const todayExercises = useMemo(() => {
    const rawExercises = activeTemplate.data[currentDayKey] || [];
    return rawExercises.map((ex) => ({
      id: ex.id,
      name: ex.name,
      muscleGroup: ex.muscleGroup,
      sets: ex.sets,
      equipment: (ex as any).equipment || "LIVRE",
    })) as PlannedExercise[];
  }, [activeId, currentDayKey]);

  const dayLabels: Record<string, string> = {
    dom: "DOMINGO",
    seg: "SEGUNDA-FEIRA",
    ter: "TERÇA-FEIRA",
    qua: "QUARTA-FEIRA",
    qui: "QUINTA-FEIRA",
    sex: "SEXTA-FEIRA",
    sab: "SÁBADO",
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar barStyle="light-content" backgroundColor="#1A1A1E" />

        {/* HEADER INDUSTRIAL REESTRUTURADO */}
        <View style={styles.header}>
          <View style={styles.titleBlock}>
            <Text style={styles.brandSubtitle}>SESSÃO DE TREINO</Text>
            <Text style={styles.brandTitle}>
              {activeTemplate.name.toUpperCase()}
            </Text>
            {/* O DIA DA SEMANA AGORA ENTRA EXATAMENTE ABAIXO DO NOME DO TREINO */}
            <Text style={styles.daySubtitle}>{dayLabels[currentDayKey]}</Text>
          </View>
        </View>

        {/* CONTEÚDO PRINCIPAL DA SESSÃO */}
        <View style={styles.contentBody}>
          <WorkoutSessionView exercises={todayExercises} dayName="" />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A1A1E",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: "#1A1A1E",
    borderBottomWidth: 1,
    borderColor: "#26262B",
  },
  titleBlock: {
    flex: 1,
  },
  brandSubtitle: {
    color: "#636366",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  brandTitle: {
    color: "#E5E5EA",
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -1,
    marginBottom: 6, // Margem inferior para afastar o título do dia
  },
  daySubtitle: {
    color: "#E5E5EA", // Mesmo cinza de leitura confortável da index
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1,
  },
  contentBody: {
    flex: 1,
    backgroundColor: "#121214",
  },
  centerContainer: {
    flex: 1,
    backgroundColor: "#121214",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  warningText: {
    color: "#E5E5EA",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.5,
    textAlign: "center",
    marginBottom: 8,
  },
  subWarningText: {
    color: "#8E8E93",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
});
