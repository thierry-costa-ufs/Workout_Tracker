import {
  DAYS_OF_WEEK,
  EXERCISES_LIST,
  PlannedExercise,
  WorkoutData,
} from "@/constants/exercises";
import { useWorkouts } from "@/hooks/useWorkouts";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function TabTwoScreen() {
  const {
    templates,
    activeId,
    saveTemplate,
    selectActiveTemplate,
    deleteTemplate,
  } = useWorkouts();

  const [draftWorkout, setDraftWorkout] = useState<WorkoutData>({
    dom: [],
    seg: [],
    ter: [],
    qua: [],
    qui: [],
    sex: [],
    sab: [],
  });

  const [planningName, setPlanningName] = useState("");
  const [isSaveModalVisible, setIsSaveModalVisible] = useState(false);
  const [isPlansModalVisible, setIsPlansModalVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState(DAYS_OF_WEEK[1].id);
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState<
    | "Todos"
    | "Peito"
    | "Costas"
    | "Ombro"
    | "Quadríceps"
    | "Posterior"
    | "Bíceps"
    | "Tríceps"
    | "Panturrilha"
    | "Abdômen"
  >("Todos");

  const currentActivePlan = templates.find((t) => t.id === activeId);

  useEffect(() => {
    if (activeId && currentActivePlan) {
      setDraftWorkout(currentActivePlan.data);
      setPlanningName(currentActivePlan.name);
    }
  }, [activeId, templates]);

  const handleNewPlan = () => {
    selectActiveTemplate("");
    setDraftWorkout({
      dom: [],
      seg: [],
      ter: [],
      qua: [],
      qui: [],
      sex: [],
      sab: [],
    });
    setPlanningName("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleSavePlanning = async () => {
    if (!planningName.trim()) {
      Alert.alert("Erro", "Dê um nome ao seu plano de treino.");
      return;
    }
    await saveTemplate(planningName, draftWorkout, activeId || undefined);
    setIsSaveModalVisible(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleAddExercise = (item: (typeof EXERCISES_LIST)[0]) => {
    const currentDayList = draftWorkout[selectedDay] || [];
    const existingIndex = currentDayList.findIndex((ex) => ex.id === item.id);

    if (existingIndex > -1) {
      handleUpdateSets(existingIndex, currentDayList[existingIndex].sets + 1);
    } else {
      const newExercise: PlannedExercise = {
        ...item,
        sets: item.defaultSets || 3,
      };
      setDraftWorkout((prev) => ({
        ...prev,
        [selectedDay]: [...currentDayList, newExercise],
      }));
    }
  };

  const handleUpdateSets = (index: number, newSets: number) => {
    if (newSets < 1) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const currentDayList = [...(draftWorkout[selectedDay] || [])];
    currentDayList[index].sets = newSets;

    setDraftWorkout((prev) => ({
      ...prev,
      [selectedDay]: currentDayList,
    }));
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.mainContainer}>
        {/* Header Consolidado com Identidade Premium */}
        <View style={styles.topHeader}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              MONTAGEM DE ROTINA
            </Text>
            {currentActivePlan ? (
              <Text style={styles.activePlanBadge} numberOfLines={1}>
                {currentActivePlan.name}
              </Text>
            ) : (
              <Text
                style={[styles.activePlanBadge, { color: "#E5E5EA" }]}
                numberOfLines={1}
              >
                Novo Planejamento Ativo
              </Text>
            )}
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.presetButton}
              onPress={handleNewPlan}
            >
              <Ionicons name="refresh-outline" size={14} color="#FFF" />
              <Text style={styles.presetButtonText}>Limpar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.presetButton}
              onPress={() => setIsPlansModalVisible(true)}
            >
              <Ionicons name="folder-open-outline" size={14} color="#FFF" />
              <Text style={styles.presetButtonText}>Planos</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Seletor de Dias Crueis/Lineares */}
        <View style={styles.dayNavContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={DAYS_OF_WEEK}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setSelectedDay(item.id)}
                style={[
                  styles.dayChip,
                  item.id === selectedDay && styles.activeDayChip,
                ]}
              >
                <Text
                  style={[
                    styles.dayChipText,
                    item.id === selectedDay && styles.activeDayChipText,
                  ]}
                >
                  {item.label.substring(0, 3)}
                </Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
          />
        </View>

        {/* Lista de Exercícios Selecionados */}
        <ScrollView
          contentContainerStyle={styles.contentBody}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.selectedText}>{selectedDay.toUpperCase()}</Text>
            <Text style={styles.exerciseCount}>
              {draftWorkout[selectedDay]?.length || 0} EXERCÍCIOS
            </Text>
          </View>

          <View style={styles.workoutList}>
            {!draftWorkout[selectedDay] ||
            draftWorkout[selectedDay].length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="flash-off-outline" size={32} color="#333" />
                <Text style={styles.emptyStateText}>
                  Dia de descanso ou vazio.
                </Text>
              </View>
            ) : (
              draftWorkout[selectedDay].map((ex, index) => (
                <View key={`${ex.id}-${index}`} style={styles.exerciseCard}>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardExerciseName}>{ex.name}</Text>
                    <Text style={styles.cardMuscleGroupMainList}>
                      {ex.muscleGroup}
                    </Text>
                  </View>

                  {/* Stepper Monolítico */}
                  <View style={styles.stepperContainer}>
                    <TouchableOpacity
                      style={styles.stepperButton}
                      onPress={() => handleUpdateSets(index, ex.sets - 1)}
                    >
                      <Ionicons name="remove" size={14} color="#A2A2A7" />
                    </TouchableOpacity>

                    <View style={styles.stepperValueContainer}>
                      <Text style={styles.stepperValue}>{ex.sets}</Text>
                      <Text style={styles.stepperLabel}>Séries</Text>
                    </View>

                    <TouchableOpacity
                      style={styles.stepperButton}
                      onPress={() => handleUpdateSets(index, ex.sets + 1)}
                    >
                      <Ionicons name="add" size={14} color="#FFF" />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.deleteCardButton}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      const newDayList = draftWorkout[selectedDay].filter(
                        (_, i) => i !== index,
                      );
                      setDraftWorkout((prev) => ({
                        ...prev,
                        [selectedDay]: newDayList,
                      }));
                    }}
                  >
                    <Ionicons name="trash-outline" size={18} color="#FF453A" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        {/* Rodapé Flutuante Integrado */}
        <View style={styles.footerActions}>
          <TouchableOpacity
            style={styles.fabAdd}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add" size={24} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveMainButton}
            onPress={() => setIsSaveModalVisible(true)}
          >
            <Text style={styles.saveMainButtonText}>CONCLUIR PLANEJAMENTO</Text>
          </TouchableOpacity>
        </View>

        {/* Modal: Planos Salvos */}
        <Modal transparent visible={isPlansModalVisible} animationType="fade">
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>ROTINAS SALVAS</Text>
                <TouchableOpacity
                  onPress={() => setIsPlansModalVisible(false)}
                  style={styles.closeModalHeaderBtn}
                >
                  <Ionicons name="close" size={20} color="#FFF" />
                </TouchableOpacity>
              </View>

              {templates.length === 0 ? (
                <Text style={styles.emptyPlansText}>
                  Nenhum modelo estruturado.
                </Text>
              ) : (
                <FlatList
                  data={templates}
                  keyExtractor={(item) => item.id}
                  style={{ width: "100%", maxHeight: 250 }}
                  renderItem={({ item }) => {
                    const isSelected = item.id === activeId;
                    return (
                      <View
                        style={[
                          styles.planItemCard,
                          isSelected && styles.planItemCardActive,
                        ]}
                      >
                        <TouchableOpacity
                          style={{ flex: 1, paddingVertical: 14 }}
                          onPress={() => {
                            selectActiveTemplate(item.id);
                            setIsPlansModalVisible(false);
                          }}
                        >
                          <Text
                            style={[
                              styles.planItemName,
                              isSelected && styles.planItemNameActive,
                            ]}
                          >
                            {item.name.toUpperCase()}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={{ padding: 8 }}
                          onPress={() => {
                            Alert.alert(
                              "Apagar",
                              `Excluir permanentemente "${item.name}"?`,
                              [
                                { text: "Cancelar", style: "cancel" },
                                {
                                  text: "Excluir",
                                  style: "destructive",
                                  onPress: () => deleteTemplate(item.id),
                                },
                              ],
                            );
                          }}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={16}
                            color="#FF453A"
                          />
                        </TouchableOpacity>
                      </View>
                    );
                  }}
                />
              )}
            </View>
          </View>
        </Modal>

        {/* Modal Avançado de Seleção (Biblioteca de Exercícios) */}
        <Modal transparent visible={modalVisible} animationType="slide">
          <View style={styles.centeredView}>
            <View style={[styles.modalView, styles.modalViewExpanded]}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>BIBLIOTECA</Text>
                  <Text style={styles.modalSubtitle}>
                    Injete cargas na sua divisão
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.closeModalButton}
                  onPress={() => {
                    setModalVisible(false);
                    setSelectedMuscleFilter("Todos");
                  }}
                >
                  <Ionicons name="close" size={20} color="#000" />
                </TouchableOpacity>
              </View>

              <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {[
                    "Todos",
                    "Peito",
                    "Costas",
                    "Ombro",
                    "Quadríceps",
                    "Posterior",
                    "Bíceps",
                    "Tríceps",
                    "Panturrilha",
                    "Abdômen",
                  ].map((muscle) => {
                    const isSelected = selectedMuscleFilter === muscle;
                    return (
                      <TouchableOpacity
                        key={muscle}
                        onPress={() => setSelectedMuscleFilter(muscle as any)}
                        style={[
                          styles.filterChip,
                          isSelected && styles.filterChipActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.filterChipText,
                            isSelected && styles.filterChipTextActive,
                          ]}
                        >
                          {muscle}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              <FlatList
                data={EXERCISES_LIST.filter(
                  (ex) =>
                    selectedMuscleFilter === "Todos" ||
                    ex.muscleGroup === selectedMuscleFilter,
                )}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                style={{ width: "100%" }}
                renderItem={({ item }) => (
                  <ExerciseCardItem
                    item={item}
                    onAdd={() => handleAddExercise(item)}
                  />
                )}
              />
            </View>
          </View>
        </Modal>

        {/* Modal Finalizar */}
        <Modal transparent visible={isSaveModalVisible} animationType="fade">
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>IDENTIFIQUE O PLANO</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: PUSH/PULL/LEGS EVOLUTION"
                placeholderTextColor="#444"
                value={planningName}
                onChangeText={setPlanningName}
                autoFocus
              />
              <TouchableOpacity
                style={styles.confirmSaveButton}
                onPress={handleSavePlanning}
              >
                <Text style={styles.confirmSaveText}>ATIVAR AGORA</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsSaveModalVisible(false)}>
                <Text style={styles.cancelText}>CANCELAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

interface ExerciseCardItemProps {
  item: (typeof EXERCISES_LIST)[0];
  onAdd: () => void;
}

// Subcomponente Otimizado para o Catálogo
function ExerciseCardItem({ item, onAdd }: ExerciseCardItemProps) {
  const [isAdded, setIsAdded] = useState(false);

  const handlePress = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onAdd();
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 600);
  };

  return (
    <TouchableOpacity
      style={[
        styles.advancedExerciseCard,
        isAdded && styles.cardFeedbackActive,
      ]}
      activeOpacity={0.7}
      onPress={handlePress}
    >
      <View style={{ flex: 1, marginRight: 10 }}>
        <Text style={styles.advancedExerciseName}>{item.name}</Text>
        <View style={styles.metaBadgeContainer}>
          <View
            style={[
              styles.metaBadge,
              item.mechanic === "Composto"
                ? styles.badgeComposto
                : styles.badgeIsolado,
            ]}
          >
            <Text style={styles.metaBadgeText}>
              {item.mechanic.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.subtleTargetText}>
            {item.equipment.toUpperCase()} • {item.muscleGroup.toUpperCase()}
          </Text>
        </View>
      </View>

      <View
        style={[styles.addIconCircle, isAdded && styles.addIconCircleSuccess]}
      >
        <Ionicons
          name={isAdded ? "checkmark" : "add"}
          size={16}
          color={isAdded ? "#E5E5EA" : "#FFF"}
        />
      </View>
    </TouchableOpacity>
  );
}

// Estilização Industrial Monocromática e de Alta Performance
const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#000" },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  activePlanBadge: {
    color: "#8E8E93",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  headerActions: { flexDirection: "row", gap: 6 },
  presetButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C1C1E",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    gap: 4,
  },
  presetButtonText: { color: "#FFF", fontWeight: "700", fontSize: 11 },
  dayNavContainer: { paddingVertical: 10, backgroundColor: "#000" },
  dayChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#1C1C1E",
    marginRight: 8,
    minWidth: 50,
    alignItems: "center",
  },
  activeDayChip: { backgroundColor: "#FFF" },
  dayChipText: {
    color: "#8E8E93",
    fontWeight: "700",
    fontSize: 12,
    textTransform: "uppercase",
  },
  activeDayChipText: { color: "#000" },
  contentBody: { paddingHorizontal: 16, paddingBottom: 130 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
    marginBottom: 16,
  },
  selectedText: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  exerciseCount: {
    color: "#E5E5EA",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  workoutList: { width: "100%" },

  // Cards de Exercício da Página Principal (Agressivos e Robustos)
  exerciseCard: {
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2C2C2E",
  },
  cardInfo: { flex: 1, justifyContent: "center" },
  cardExerciseName: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 3,
  },
  cardMuscleGroupMainList: {
    color: "#8E8E93",
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  deleteCardButton: { paddingLeft: 14, justifyContent: "center" },

  // Stepper Técnico de Séries
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#121212",
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: "#2C2C2E",
  },
  stepperButton: {
    backgroundColor: "#1C1C1E",
    width: 30,
    height: 30,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  stepperValueContainer: { width: 44, alignItems: "center" },
  stepperValue: { color: "#FFF", fontSize: 14, fontWeight: "800" },
  stepperLabel: {
    color: "#636366",
    fontSize: 8,
    fontWeight: "700",
    textTransform: "uppercase",
    marginTop: -2,
  },

  emptyState: { alignItems: "center", marginTop: 60, gap: 10 },
  emptyStateText: { color: "#444", fontSize: 13, fontWeight: "600" },
  footerActions: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  fabAdd: {
    backgroundColor: "#FFF",
    width: 54,
    height: 54,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  saveMainButton: {
    flex: 1,
    backgroundColor: "#E5E5EA",
    height: 54,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  saveMainButtonText: {
    color: "#000",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1,
  },

  // Modais de Tela Escura Absoluta
  centeredView: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.85)",
  },
  modalView: {
    width: "100%",
    backgroundColor: "#1C1C1E",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#2C2C2E",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  modalTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  closeModalHeaderBtn: { padding: 4 },
  input: {
    width: "100%",
    backgroundColor: "#121212",
    color: "#FFF",
    padding: 16,
    borderRadius: 8,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#2C2C2E",
  },
  confirmSaveButton: {
    backgroundColor: "#FFF",
    width: "100%",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  confirmSaveText: {
    color: "#000",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  cancelText: {
    color: "#8E8E93",
    fontWeight: "700",
    fontSize: 12,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  emptyPlansText: {
    color: "#444",
    paddingVertical: 20,
    fontSize: 13,
    fontWeight: "600",
  },
  planItemCard: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#121212",
    paddingHorizontal: 14,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#2C2C2E",
  },
  planItemCardActive: { borderColor: "#E5E5EA" },
  planItemName: {
    color: "#A2A2A7",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  planItemNameActive: { color: "#E5E5EA" },

  // Customização da Biblioteca de Exercícios (Modal)
  modalViewExpanded: { height: "85%" },
  modalSubtitle: {
    color: "#8E8E93",
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2,
  },
  closeModalButton: { backgroundColor: "#FFF", padding: 6, borderRadius: 8 },
  filterContainer: { flexDirection: "row", marginBottom: 16, height: 34 },
  filterChip: {
    backgroundColor: "#121212",
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 6,
    borderWidth: 1,
    borderColor: "#2C2C2E",
    justifyContent: "center",
  },
  filterChipActive: { backgroundColor: "#E5E5EA", borderColor: "#E5E5EA" },
  filterChipText: { color: "#8E8E93", fontSize: 11, fontWeight: "700" },
  filterChipTextActive: { color: "#000" },

  // Cards na Biblioteca Interna
  advancedExerciseCard: {
    backgroundColor: "#121212",
    borderWidth: 1,
    borderColor: "#2C2C2E",
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  advancedExerciseName: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
  },
  metaBadgeContainer: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeComposto: { backgroundColor: "rgba(255, 159, 10, 0.1)" },
  badgeIsolado: { backgroundColor: "rgba(255, 255, 255, 0.05)" },
  metaBadgeText: { fontSize: 9, fontWeight: "800", color: "#FF9F0A" },
  subtleTargetText: { color: "#636366", fontSize: 9, fontWeight: "700" },
  addIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#1C1C1E",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2C2C2E",
  },
  cardFeedbackActive: { borderColor: "#E5E5EA" },
  addIconCircleSuccess: {
    backgroundColor: "rgba(255, 159, 10, 0.1)",
    borderColor: "#E5E5EA",
  },
});
