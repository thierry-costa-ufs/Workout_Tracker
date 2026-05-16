import { WorkoutData } from "@/constants/exercises";
import { useWorkouts } from "@/hooks/useWorkouts";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

interface ExerciseProgress {
  [exerciseId: string]: boolean[];
}

export default function HomeScreen() {
  const { templates, activeId } = useWorkouts();
  const [progress, setProgress] = useState<ExerciseProgress>({});

  const todayKey = useMemo((): keyof WorkoutData => {
    const daysMap: (keyof WorkoutData)[] = [
      "dom",
      "seg",
      "ter",
      "qua",
      "qui",
      "sex",
      "sab",
    ];
    return daysMap[new Date().getDay()];
  }, []);

  const activePlan = useMemo(() => {
    if (!templates || templates.length === 0) return null;
    return (
      templates.find((t) => t.id === activeId) ||
      templates[templates.length - 1]
    );
  }, [templates, activeId]);

  const todaysExercises = useMemo(() => {
    if (!activePlan) return [];
    return activePlan.data[todayKey] || [];
  }, [activePlan, todayKey]);

  useEffect(() => {
    const initialProgress: ExerciseProgress = {};
    todaysExercises.forEach((ex) => {
      initialProgress[ex.id] = Array(ex.sets || 3).fill(false);
    });
    setProgress(initialProgress);
  }, [todaysExercises]);

  const handleCheckNextSet = (exerciseId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setProgress((prev) => {
      const currentSets = prev[exerciseId] ? [...prev[exerciseId]] : [];
      if (currentSets.length === 0) return prev;

      const nextPendingIndex = currentSets.indexOf(false);
      if (nextPendingIndex !== -1) {
        currentSets[nextPendingIndex] = true;
      } else {
        currentSets.fill(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
      return { ...prev, [exerciseId]: currentSets };
    });
  };

  const handleLongPressResetExercise = (exerciseId: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setProgress((prev) => {
      const currentSets = prev[exerciseId] ? [...prev[exerciseId]] : [];
      currentSets.fill(false);
      return { ...prev, [exerciseId]: currentSets };
    });
  };

  const stats = useMemo(() => {
    let totalSets = 0;
    let completedSets = 0;
    Object.values(progress).forEach((setsArray) => {
      totalSets += setsArray.length;
      completedSets += setsArray.filter(Boolean).length;
    });
    const percentage =
      totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
    return { totalSets, completedSets, percentage };
  }, [progress]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.mainContainer}>
        {/* TOP NAVBAR FOCADA EM ACADEMIA */}
        <View style={styles.topNavbar}>
          <View style={styles.navbarUpperTelemetry}>
            <Text style={styles.systemTerminalText}>MONITORAMENTO DIÁRIO</Text>
            <View style={styles.navbarRigthTelemetry}></View>
          </View>

          <View style={styles.navbarMainRow}>
            <View style={styles.titleBlock}>
              <Text style={styles.navbarTitle} numberOfLines={1}>
                {activePlan
                  ? activePlan.name.toUpperCase()
                  : "NENHUM TREINO ATIVO"}
              </Text>
              <Text style={styles.navbarSubtitle}>
                {new Date()
                  .toLocaleDateString("pt-BR", {
                    weekday: "long",
                    day: "2-digit",
                    month: "short",
                  })
                  .toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {todaysExercises.length > 0 ? (
          <>
            {/* PAINEL DE PROGRESSO DE SÉRIES (HUD CLEAN) */}
            <View style={styles.progressDisplayContainer}>
              <View style={styles.displayInterior}>
                <View style={styles.displayDataColumn}>
                  <Text style={styles.displayLabel}>
                    VOLUME TOTAL CONCLUÍDO
                  </Text>
                  <Text style={styles.displayCounter}>
                    {stats.completedSets}{" "}
                    <Text style={styles.counterDivider}>/</Text>{" "}
                    {stats.totalSets}{" "}
                    <Text style={styles.unitText}> SÉRIES</Text>
                  </Text>
                </View>
                <View style={styles.displayGraphicColumn}>
                  <Text style={styles.displayPercentNumber}>
                    {stats.percentage}
                    <Text style={styles.displayPercentSymbol}>%</Text>
                  </Text>
                </View>
              </View>
              <View style={styles.displayHardwareTrack}>
                <View
                  style={[
                    styles.displayHardwareBar,
                    { width: `${stats.percentage}%` },
                  ]}
                />
              </View>
            </View>

            {/* LISTA DE EXERCÍCIOS */}
            <FlatList
              data={todaysExercises}
              contentContainerStyle={styles.listContainer as ViewStyle}
              showsVerticalScrollIndicator={false}
              keyExtractor={(item, index) => `${item.id}-${index}`}
              renderItem={({ item }) => {
                const itemSets = progress[item.id] || [];
                const completedCount = itemSets.filter(Boolean).length;
                const totalCount = itemSets.length;
                const isExerciseFinished =
                  totalCount > 0 && itemSets.every(Boolean);

                return (
                  <TouchableOpacity
                    activeOpacity={0.92}
                    onPress={() => handleCheckNextSet(item.id)}
                    onLongPress={() => handleLongPressResetExercise(item.id)}
                    style={[
                      styles.card,
                      isExerciseFinished
                        ? styles.cardFinished
                        : styles.cardActiveBorder,
                    ]}
                  >
                    <View style={styles.cardHeaderRow}>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text
                          numberOfLines={1}
                          style={[
                            styles.exerciseTitleText,
                            isExerciseFinished && styles.textCompletedCrossed,
                          ]}
                        >
                          {item.name.toUpperCase()}
                        </Text>
                        <Text style={styles.exerciseTargetGroup}>
                          {item.muscleGroup.toUpperCase()}
                        </Text>
                      </View>

                      <View style={styles.cardInteractiveZone}>
                        <View style={styles.numericIndicatorBox}>
                          <Text
                            style={[
                              styles.numericComplete,
                              isExerciseFinished &&
                                styles.numericCompleteFinished,
                            ]}
                          >
                            {completedCount}
                            <Text style={styles.numericTotal}>
                              /{totalCount}
                            </Text>
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.actionSquare,
                            isExerciseFinished && styles.actionSquareFinished,
                          ]}
                        >
                          <Ionicons
                            name={
                              isExerciseFinished
                                ? "checkmark-circle"
                                : "chevron-forward"
                            }
                            size={20}
                            color={isExerciseFinished ? "#FFF" : "#FFF"}
                          />
                        </View>
                      </View>
                    </View>

                    {/* RASTREADOR SEGMENTADO DE SÉRIES */}
                    <View style={styles.segmentTrack}>
                      {itemSets.map((isDone, idx) => (
                        <View
                          key={idx}
                          style={[
                            styles.segmentItem,
                            isDone && styles.segmentItemChecked,
                            isExerciseFinished && styles.segmentItemComplete,
                          ]}
                        />
                      ))}
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </>
        ) : (
          <View style={styles.diagnosticContainer}>
            <View style={styles.diagnosticHexagon}>
              <Ionicons name="barbell" size={24} color="#E5E5EA" />
            </View>
            <Text style={styles.diagnosticTitle}>DIA DE DESCANSO</Text>
            <Text style={styles.diagnosticSubtitle}>
              Nenhum exercício programado para hoje. Aproveite para se
              recuperar, alimentar-se bem e consolidar os ganhos. smt.
            </Text>
          </View>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#000000",
  } satisfies ViewStyle,

  /* NAVBAR CLEAN */
  topNavbar: {
    backgroundColor: "#1A1A1E",
    borderBottomWidth: 1,
    borderColor: "#1C1C1E",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  } satisfies ViewStyle,

  navbarUpperTelemetry: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  } satisfies ViewStyle,

  systemTerminalText: {
    color: "#48484A",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  } satisfies TextStyle,

  navbarRigthTelemetry: {
    flexDirection: "row",
    alignItems: "center",
  } satisfies ViewStyle,

  navbarMainRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  } satisfies ViewStyle,

  titleBlock: {
    flex: 1,
  } satisfies ViewStyle,

  navbarTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.5,
  } satisfies TextStyle,

  navbarSubtitle: {
    color: "#8E8E93",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  } satisfies TextStyle,

  /* DISPLAY DE PROGRESSO (ESTILO CARD DE METRICAS) */
  progressDisplayContainer: {
    backgroundColor: "#0A0A0C",
    marginHorizontal: 24,
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1C1C1E",
    overflow: "hidden",
  } satisfies ViewStyle,

  displayInterior: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  } satisfies ViewStyle,

  displayDataColumn: {
    flexDirection: "column",
  } satisfies ViewStyle,

  displayLabel: {
    color: "#8E8E93",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  } satisfies TextStyle,

  displayCounter: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 4,
  } satisfies TextStyle,

  counterDivider: {
    color: "#3A3A3C",
    fontWeight: "400",
  } satisfies TextStyle,

  unitText: {
    color: "#8E8E93",
    fontSize: 11,
    fontWeight: "600",
  } satisfies TextStyle,

  displayGraphicColumn: {
    alignItems: "flex-end",
  } satisfies ViewStyle,

  displayPercentNumber: {
    color: "#FFF",
    fontSize: 32,
    fontWeight: "800",
    lineHeight: 32,
  } satisfies TextStyle,

  displayPercentSymbol: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFF",
  } satisfies TextStyle,

  displayHardwareTrack: {
    height: 4,
    backgroundColor: "#1C1C1E",
    width: "100%",
  } satisfies ViewStyle,

  displayHardwareBar: {
    height: "100%",
    backgroundColor: "#E5E5EA",
  } satisfies ViewStyle,

  /* LISTAGEM E CARDS DE EXERCÍCIOS */
  listContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  } satisfies ViewStyle,

  card: {
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 14,
    marginBottom: 12,
    borderWidth: 1,
  } satisfies ViewStyle,

  cardActiveBorder: {
    borderColor: "#2C2C2E",
  } satisfies ViewStyle,

  cardFinished: {
    borderColor: "#121212",
    backgroundColor: "#121212",
  } satisfies ViewStyle,

  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  } satisfies ViewStyle,

  exerciseTitleText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  } satisfies TextStyle,

  textCompletedCrossed: {
    textDecorationLine: "line-through",
    color: "#48484A",
  } satisfies TextStyle,

  exerciseTargetGroup: {
    color: "#8E8E93",
    fontSize: 10,
    fontWeight: "600",
    marginTop: 2,
  } satisfies TextStyle,

  cardInteractiveZone: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  } satisfies ViewStyle,

  numericIndicatorBox: {
    alignItems: "flex-end",
  } satisfies ViewStyle,

  numericComplete: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  } satisfies TextStyle,

  numericCompleteFinished: {
    color: "#E5E5EA",
    fontWeight: "800",
  } satisfies TextStyle,

  numericTotal: {
    color: "#48484A",
    fontSize: 12,
    fontWeight: "500",
  } satisfies TextStyle,

  actionSquare: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#2C2C2E",
    justifyContent: "center",
    alignItems: "center",
  } satisfies ViewStyle,

  actionSquareFinished: {
    backgroundColor: "#E5E5EA",
  } satisfies ViewStyle,

  /* SEGMENTOS DE SÉRIES */
  segmentTrack: {
    flexDirection: "row",
    gap: 4,
    width: "100%",
  } satisfies ViewStyle,

  segmentItem: {
    flex: 1,
    height: 4,
    backgroundColor: "#2C2C2E",
    borderRadius: 2,
  } satisfies ViewStyle,

  segmentItemChecked: {
    backgroundColor: "#666",
  } satisfies ViewStyle,

  segmentItemComplete: {
    backgroundColor: "#E5E5EA",
  } satisfies ViewStyle,

  /* ESTADO VAZIO / DESCANSO */
  diagnosticContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 48,
    paddingBottom: 40,
  } satisfies ViewStyle,

  diagnosticHexagon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#1C1C1E",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  } satisfies ViewStyle,

  diagnosticTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  } satisfies TextStyle,

  diagnosticSubtitle: {
    color: "#8E8E93",
    fontSize: 12,
    marginTop: 6,
    textAlign: "center",
    lineHeight: 18,
  } satisfies TextStyle,
});
