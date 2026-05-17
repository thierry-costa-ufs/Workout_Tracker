import { EXERCISES_LIST } from "@/constants/exercises";
import { useWorkouts } from "@/context/WorkoutContext";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function PRScreen() {
  const { personalRecords, savePR, deletePR } = useWorkouts();

  const [modalVisible, setModalVisible] = useState(false);
  const [exerciseModalVisible, setExerciseModalVisible] = useState(false);

  const [selectedExercise, setSelectedExercise] = useState<
    (typeof EXERCISES_LIST)[0] | null
  >(null);
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");

  const handleSavePR = async () => {
    if (!selectedExercise || !weight || !reps) {
      Alert.alert("Erro", "Preencha todos os campos técnicos.");
      return;
    }

    const parsedWeight = parseFloat(weight.replace(",", "."));
    const parsedReps = parseInt(reps, 10);

    if (isNaN(parsedWeight) || isNaN(parsedReps)) {
      Alert.alert("Erro", "Insira valores numéricos válidos.");
      return;
    }

    try {
      await savePR(
        selectedExercise.id,
        selectedExercise.name,
        selectedExercise.muscleGroup,
        parsedWeight,
        parsedReps,
      );

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setModalVisible(false);
      setSelectedExercise(null);
      setWeight("");
      setReps("");
    } catch (e) {
      Alert.alert("Erro", "Falha ao salvar o recorde no sistema central.");
    }
  };

  const handleDeletePR = (id: string) => {
    Alert.alert("Remover Recorde", "Excluir permanentemente este PR?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          await deletePR(id);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        },
      },
    ]);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>RECORDES PESSOAIS</Text>
            <Text style={styles.headerSubtitle}>
              Mapeamento de Força Absoluta
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addPresetButton}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add" size={16} color="#000" />
            <Text style={styles.addPresetText}>NOVO PR</Text>
          </TouchableOpacity>
        </View>

        {personalRecords.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="trophy-outline" size={42} color="#2C2C2E" />
            <Text style={styles.emptyStateText}>
              Nenhuma carga máxima computada.
            </Text>
          </View>
        ) : (
          <FlatList
            data={personalRecords}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.prCard}>
                <View style={styles.prInfo}>
                  <Text style={styles.prExerciseName}>{item.exerciseName}</Text>
                  <Text style={styles.prMeta}>
                    {item.muscleGroup.toUpperCase()} • {item.date}
                  </Text>
                </View>
                <View style={styles.prMetrics}>
                  <View style={styles.metricBadge}>
                    <Text style={styles.metricValue}>{item.weight} KG</Text>
                    <Text style={styles.metricLabel}>CARGA</Text>
                  </View>
                  <View style={styles.metricBadge}>
                    <Text style={styles.metricValue}>x{item.reps}</Text>
                    <Text style={styles.metricLabel}>REPS</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeletePR(item.id)}
                  >
                    <Ionicons name="trash-outline" size={16} color="#FF453A" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}

        {/* Modal: Cadastro de Novo PR */}
        <Modal transparent visible={modalVisible} animationType="slide">
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>REGISTRAR MARCA</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={22} color="#FFF" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.selectSelectable}
                onPress={() => setExerciseModalVisible(true)}
              >
                <Text
                  style={{
                    color: selectedExercise ? "#FFF" : "#444",
                    fontWeight: "600",
                  }}
                >
                  {selectedExercise
                    ? selectedExercise.name.toUpperCase()
                    : "SELECIONE O EXERCÍCIO"}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#8E8E93" />
              </TouchableOpacity>

              <View style={styles.rowInputs}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>CARGA TOTAL (KG)</Text>
                  <TextInput
                    style={styles.technicalInput}
                    placeholder="0.0"
                    placeholderTextColor="#444"
                    keyboardType="numeric"
                    value={weight}
                    onChangeText={setWeight}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>REPETIÇÕES MÁX.</Text>
                  <TextInput
                    style={styles.technicalInput}
                    placeholder="0"
                    placeholderTextColor="#444"
                    keyboardType="numeric"
                    value={reps}
                    onChangeText={setReps}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.confirmSaveButton}
                onPress={handleSavePR}
              >
                <Text style={styles.confirmSaveText}>SALVAR RECORDE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Sub-Modal: Selecionar Exercício da Lista */}
        <Modal transparent visible={exerciseModalVisible} animationType="fade">
          <View style={styles.centeredView}>
            <View style={[styles.modalView, { height: "70%" }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>BIBLIOTECA TÉCNICA</Text>
                <TouchableOpacity
                  onPress={() => setExerciseModalVisible(false)}
                >
                  <Ionicons name="close" size={22} color="#FFF" />
                </TouchableOpacity>
              </View>

              <FlatList
                data={EXERCISES_LIST}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.exerciseSelectionRow}
                    onPress={() => {
                      setSelectedExercise(item);
                      setExerciseModalVisible(false);
                    }}
                  >
                    <Text style={styles.exerciseSelectionText}>
                      {item.name}
                    </Text>
                    <Text style={styles.exerciseSelectionSub}>
                      {item.muscleGroup.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  headerTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1,
  },
  headerSubtitle: {
    color: "#636366",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
    textTransform: "uppercase",
  },
  addPresetButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 4,
  },
  addPresetText: {
    color: "#000",
    fontWeight: "900",
    fontSize: 11,
    letterSpacing: 0.5,
  },
  emptyState: {
    flex: 0.7,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  emptyStateText: { color: "#444", fontSize: 13, fontWeight: "600" },
  listContent: { paddingHorizontal: 16, paddingBottom: 40 },
  prCard: {
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2C2C2E",
  },
  prInfo: { flex: 1 },
  prExerciseName: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  prMeta: {
    color: "#8E8E93",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  prMetrics: { flexDirection: "row", alignItems: "center", gap: 8 },
  metricBadge: {
    backgroundColor: "#121212",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: "center",
    minWidth: 60,
    borderWidth: 1,
    borderColor: "#2C2C2E",
  },
  metricValue: { color: "#FF9F0A", fontSize: 12, fontWeight: "900" },
  metricLabel: {
    color: "#545456",
    fontSize: 7,
    fontWeight: "700",
    marginTop: 1,
  },
  deleteButton: { paddingLeft: 8 },
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
    marginBottom: 20,
  },
  modalTitle: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1,
  },
  selectSelectable: {
    width: "100%",
    backgroundColor: "#121212",
    padding: 16,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2C2C2E",
    marginBottom: 16,
  },
  rowInputs: { flexDirection: "row", gap: 12, marginBottom: 20 },
  inputLabel: {
    color: "#8E8E93",
    fontSize: 9,
    fontWeight: "800",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  technicalInput: {
    backgroundColor: "#121212",
    color: "#FFF",
    padding: 14,
    borderRadius: 8,
    fontSize: 16,
    fontWeight: "700",
    borderWidth: 1,
    borderColor: "#2C2C2E",
    textAlign: "center",
  },
  confirmSaveButton: {
    backgroundColor: "#FFF",
    width: "100%",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmSaveText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  exerciseSelectionRow: {
    width: "100%",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#2C2C2E",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  exerciseSelectionText: { color: "#FFF", fontSize: 13, fontWeight: "700" },
  exerciseSelectionSub: { color: "#636366", fontSize: 9, fontWeight: "700" },
});
