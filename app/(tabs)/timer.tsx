import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

// Presets purificados para a identidade industrial monocromática
const TIMER_PRESETS = [
  {
    id: "warmup",
    label: "AQUECIMENTO",
    duration: 45,
    icon: "flame-outline",
  },
  {
    id: "feeder",
    label: "PREPARO / FEEDER",
    duration: 90,
    icon: "trending-up-outline",
  },
  {
    id: "work",
    label: "SÉRIE DE TRABALHO",
    duration: 120,
    icon: "barbell-outline",
  },
  {
    id: "power",
    label: "FORÇA / RPT",
    duration: 180,
    icon: "flash-outline",
  },
  {
    id: "cardio",
    label: "CARDIO (HIIT)",
    duration: 30,
    icon: "heart-outline",
  },
];

export default function TimerScreen() {
  const [secondsLeft, setSecondsLeft] = useState(90);
  const [totalDuration, setTotalDuration] = useState(90);
  const [isActive, setIsActive] = useState(false);
  const [activePreset, setActivePreset] = useState("feeder");

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive && secondsLeft > 0) {
      timerRef.current = window.setTimeout(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isActive) {
      handleTimerFinished();
    }

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [isActive, secondsLeft]);

  const handleTimerFinished = () => {
    setIsActive(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Vibration.vibrate([0, 500, 200, 500]);
  };

  const toggleTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsActive(false);
    setSecondsLeft(totalDuration);
  };

  const selectPreset = (id: string, duration: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsActive(false);
    setActivePreset(id);
    setTotalDuration(duration);
    setSecondsLeft(duration);
  };

  const adjustTime = (amount: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newTime = Math.max(15, totalDuration + amount);
    setTotalDuration(newTime);
    setSecondsLeft(newTime);
    setIsActive(false);
    setActivePreset("");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercent =
    totalDuration > 0 ? (secondsLeft / totalDuration) * 100 : 0;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.mainContainer}>
        {/* Topbar Industrial Refinada */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>INTERVALO DE SÉRIE</Text>
          <Text style={styles.headerSubtitle}>
            CRONOMETRAGEM E CADÊNCIA ESTRATÉGICA
          </Text>
        </View>

        {/* MOLO DO CRONÔMETRO (Inalterado volumetricamente) */}
        <View style={styles.displayContainer}>
          <View style={styles.outerRing}>
            <Text style={styles.timerText}>{formatTime(secondsLeft)}</Text>
            {activePreset ? (
              <Text style={styles.activePresetLabel}>
                {TIMER_PRESETS.find((p) => p.id === activePreset)?.label}
              </Text>
            ) : (
              <Text style={styles.activePresetLabel}>TEMPO CUSTOMIZADO</Text>
            )}
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[styles.progressBar, { width: `${progressPercent}%` }]}
            />
          </View>
        </View>

        {/* CONTROLADORES DIRETOS (Mantidos conforme solicitado) */}
        <View style={styles.adjustmentContainer}>
          <TouchableOpacity
            style={styles.adjustButton}
            onPress={() => adjustTime(-15)}
          >
            <Text style={styles.adjustButtonText}>-15s</Text>
          </TouchableOpacity>

          <View style={styles.mainControls}>
            <TouchableOpacity
              style={styles.controlCircleReset}
              onPress={resetTimer}
            >
              <Ionicons name="refresh" size={24} color="#FFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.controlCirclePlay,
                isActive && styles.controlCirclePause,
              ]}
              onPress={toggleTimer}
            >
              <Ionicons
                name={isActive ? "pause" : "play"}
                size={32}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.adjustButton}
            onPress={() => adjustTime(15)}
          >
            <Text style={styles.adjustButtonText}>+15s</Text>
          </TouchableOpacity>
        </View>

        {/* Seção de Presets Metodológicos Monocromáticos */}
        <View style={styles.presetsSection}>
          <Text style={styles.sectionTitle}>MÉTODO DE DESCANSO</Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.presetsList}
          >
            {TIMER_PRESETS.map((preset) => {
              const isCurrent = activePreset === preset.id;
              return (
                <TouchableOpacity
                  key={preset.id}
                  style={[
                    styles.presetCard,
                    isCurrent && styles.presetCardActive,
                  ]}
                  onPress={() => selectPreset(preset.id, preset.duration)}
                >
                  <View style={styles.presetLeftRow}>
                    <View
                      style={[
                        styles.iconWrapper,
                        isCurrent && styles.iconWrapperActive,
                      ]}
                    >
                      <Ionicons
                        name={preset.icon as any}
                        size={16}
                        color={isCurrent ? "#000" : "#8E8E93"}
                      />
                    </View>
                    <View style={styles.presetInfo}>
                      <Text
                        style={[
                          styles.presetLabel,
                          isCurrent && styles.presetLabelActive,
                        ]}
                      >
                        {preset.label}
                      </Text>
                      <Text style={styles.presetSubtext}>FOCO TÉCNICO</Text>
                    </View>
                  </View>

                  <View style={styles.presetRightRow}>
                    <Text
                      style={[
                        styles.presetTime,
                        isCurrent && styles.presetTimeActive,
                      ]}
                    >
                      {formatTime(preset.duration)}
                    </Text>
                    <Ionicons
                      name={isCurrent ? "ellipse" : "chevron-forward-outline"}
                      size={12}
                      color={isCurrent ? "#FFF" : "#2C2C2E"}
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#000" },

  // Header Consolidado
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#000",
  },
  headerTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1,
  },
  headerSubtitle: {
    color: "#545456",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 4,
    letterSpacing: 0.5,
  },

  // Elementos do Display Central (Preservados em layout/escala)
  displayContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
  },
  outerRing: {
    width: width * 0.65,
    height: width * 0.65,
    borderRadius: (width * 0.65) / 2,
    borderWidth: 1,
    borderColor: "#1E1E1E",
    backgroundColor: "#0A0A0A",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#E5E5EA",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
  },
  timerText: {
    color: "#FFF",
    fontSize: 54,
    fontWeight: "300",
    fontVariant: ["tabular-nums"],
  },
  activePresetLabel: {
    color: "#666",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    marginTop: 4,
    letterSpacing: 1,
  },
  progressTrack: {
    width: width * 0.6,
    height: 3,
    backgroundColor: "#1A1A1A",
    borderRadius: 2,
    marginTop: 25,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#E5E5EA",
    borderRadius: 2,
  },

  // Ajustes de Controles Mecânicos (Preservados em layout/escala)
  adjustmentContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 30,
    marginBottom: 25,
  },
  adjustButton: {
    backgroundColor: "#121212",
    borderWidth: 1,
    borderColor: "#1E1E1E",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  adjustButtonText: { color: "#8E8E93", fontSize: 13, fontWeight: "600" },
  mainControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  controlCircleReset: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#1C1C1E",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "#2C2C2E",
  },
  controlCirclePlay: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#E5E5EA",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  controlCirclePause: {
    backgroundColor: "#E5E5EA",
  },

  // Nova Estrutura da Seção de Presets Industriais
  presetsSection: {
    flex: 1,
    backgroundColor: "#000000",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 24,
    borderWidth: 1,
    borderColor: "#1C1C1E",
  },
  sectionTitle: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 16,
  },
  presetsList: {
    paddingBottom: 24,
  },
  presetCard: {
    backgroundColor: "#121212",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#1C1C1E",
  },
  presetCardActive: {
    borderColor: "#FFF",
    backgroundColor: "#1C1C1E",
  },
  presetLeftRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: "#1C1C1E",
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrapperActive: {
    backgroundColor: "#FFF",
  },
  presetInfo: {
    marginLeft: 12,
  },
  presetLabel: {
    color: "#8E8E93",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  presetLabelActive: {
    color: "#FFF",
  },
  presetSubtext: {
    color: "#444",
    fontSize: 9,
    fontWeight: "700",
    marginTop: 2,
    letterSpacing: 0.5,
  },
  presetRightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  presetTime: {
    color: "#636366",
    fontSize: 14,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  presetTimeActive: {
    color: "#FFF",
  },
});
