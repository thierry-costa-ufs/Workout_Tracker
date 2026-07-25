import { EXERCISES_LIST } from "@/constants/exercises";
import { useWorkouts } from "@/context/WorkoutContext";
import {
  createEmptyWorkoutData,
  DAYS_OF_WEEK,
  MUSCLE_FILTERS,
  MuscleFilterType,
} from "@/lib/workout";
import { appTheme } from "@/shared/constants/theme";
import { sharedScreenStyles } from "@/shared/styles/screenStyles";
import { AppScreen } from "@/shared/ui/AppScreen";
import { PlannedExercise, WorkoutData } from "@/types/workout";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
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
import { ExercisePickerCard } from "../components/ExercisePickerCard";

export type DayIdType = (typeof DAYS_OF_WEEK)[number]["id"];

// ---------------------------------------------------------------------------
// Blocks are reusable groups of exercises (e.g. "A", "B", "C", or renamed to
// "PUSH", "PULL"...) that get assigned to one or more days of the week. This
// is what lets an ABC split repeat across a 5/6-day week without rebuilding
// the same day twice. Blocks live only in this screen's local state — when
// the plan is saved, they're flattened into the existing per-day WorkoutData
// shape, so nothing about useWorkouts()/saveTemplate() needs to change.
// ---------------------------------------------------------------------------

interface WorkoutBlock {
  id: string;
  label: string;
  exercises: PlannedExercise[];
}

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const DISTRIBUTE_PRESETS = [3, 4, 5, 6, 7];

function createId() {
  return `blk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function createBlock(label: string): WorkoutBlock {
  return { id: createId(), label, exercises: [] };
}

function getNextLabel(blocks: WorkoutBlock[]) {
  const usedLabels = new Set(blocks.map((b) => b.label.toUpperCase()));
  const nextLetter = LETTERS.find((letter) => !usedLabels.has(letter));
  return nextLetter ?? `BLOCO ${blocks.length + 1}`;
}

function serializeExercises(list: PlannedExercise[] = []) {
  return list.map((e) => `${e.id}:${e.sets}`).join("|");
}

// Reconstructs blocks + day assignments from a saved WorkoutData object.
// Days with identical exercise lists collapse into the same block; days
// with a unique list become their own block, labeled in day order.
function reconstructFromWorkoutData(data: WorkoutData) {
  const blocks: WorkoutBlock[] = [];
  const daySplit: Record<string, string | null> = {};
  const signatureToBlockId = new Map<string, string>();
  let letterIndex = 0;

  DAYS_OF_WEEK.forEach((day) => {
    const list = data[day.id] || [];
    if (list.length === 0) {
      daySplit[day.id] = null;
      return;
    }

    const signature = serializeExercises(list);
    let blockId = signatureToBlockId.get(signature);

    if (!blockId) {
      const label = LETTERS[letterIndex] ?? `BLOCO ${letterIndex + 1}`;
      letterIndex += 1;
      const newBlock: WorkoutBlock = { id: createId(), label, exercises: list };
      blocks.push(newBlock);
      blockId = newBlock.id;
      signatureToBlockId.set(signature, blockId);
    }

    daySplit[day.id] = blockId;
  });

  if (blocks.length === 0) {
    blocks.push(createBlock("A"));
  }

  return { blocks, daySplit };
}

// Componente para renderizar cada rotina com confirmação inline de exclusão
interface PlanListItemProps {
  item: { id: string; name: string };
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => Promise<void>;
}

function PlanListItem({
  item,
  isSelected,
  onSelect,
  onDelete,
}: PlanListItemProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  return (
    <View
      style={[styles.planItemCard, isSelected && styles.planItemCardActive]}
    >
      <TouchableOpacity
        style={{ flex: 1, paddingVertical: 14 }}
        onPress={onSelect}
      >
        <Text
          style={[styles.planItemName, isSelected && styles.planItemNameActive]}
          numberOfLines={1}
        >
          {item.name.toUpperCase()}
        </Text>
      </TouchableOpacity>

      {isConfirming ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <TouchableOpacity
            style={styles.confirmDeleteBadge}
            onPress={async () => {
              await onDelete();
              setIsConfirming(false);
            }}
          >
            <Text style={styles.confirmDeleteText}>EXCLUIR</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ padding: 6 }}
            onPress={() => setIsConfirming(false)}
          >
            <Ionicons name="close" size={18} color="#A2A2A7" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={{ padding: 10 }}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setIsConfirming(true);
          }}
        >
          <Ionicons
            name="trash-outline"
            size={18}
            color={appTheme.colors.danger}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function PlanningScreen() {
  const {
    templates,
    activeId,
    saveTemplate,
    selectActiveTemplate,
    deleteTemplate,
    getExercisePR,
  } = useWorkouts();

  const [blocks, setBlocks] = useState<WorkoutBlock[]>([createBlock("A")]);
  const [daySplit, setDaySplit] = useState<Record<string, string | null>>({});
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(
    blocks[0]?.id ?? null,
  );

  const [planningName, setPlanningName] = useState("");
  const [isSaveModalVisible, setIsSaveModalVisible] = useState(false);
  const [isPlansModalVisible, setIsPlansModalVisible] = useState(false);
  const [isExerciseModalVisible, setIsExerciseModalVisible] = useState(false);
  const [isDayAssignModalVisible, setIsDayAssignModalVisible] = useState(false);
  const [dayBeingAssigned, setDayBeingAssigned] = useState<string | null>(null);
  const [isRenameModalVisible, setIsRenameModalVisible] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [selectedMuscleFilter, setSelectedMuscleFilter] =
    useState<MuscleFilterType>("Todos");

  const currentActivePlan = templates.find(
    (template) => template.id === activeId,
  );
  const selectedBlock = blocks.find((b) => b.id === selectedBlockId) || null;
  const trainingDaysCount = Object.values(daySplit).filter(Boolean).length;
  const restDaysCount = DAYS_OF_WEEK.length - trainingDaysCount;

  // Sincroniza e reseta o estado da tela quando o plano ativo muda ou é excluído
  useEffect(() => {
    if (activeId && currentActivePlan?.data) {
      const { blocks: rebuiltBlocks, daySplit: rebuiltSplit } =
        reconstructFromWorkoutData(currentActivePlan.data);
      setBlocks(rebuiltBlocks);
      setDaySplit(rebuiltSplit);
      setSelectedBlockId(rebuiltBlocks[0]?.id ?? null);
      setPlanningName(currentActivePlan.name);
    } else if (!activeId || !currentActivePlan) {
      const freshBlock = createBlock("A");
      setBlocks([freshBlock]);
      setDaySplit({});
      setSelectedBlockId(freshBlock.id);
      setPlanningName("");
    }
  }, [activeId, currentActivePlan]);

  const handleNewPlan = () => {
    selectActiveTemplate("");
    const freshBlock = createBlock("A");
    setBlocks([freshBlock]);
    setDaySplit({});
    setSelectedBlockId(freshBlock.id);
    setPlanningName("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const buildWorkoutDataFromBlocks = (): WorkoutData => {
    const data = createEmptyWorkoutData();
    DAYS_OF_WEEK.forEach((day) => {
      const blockId = daySplit[day.id];
      const block = blocks.find((b) => b.id === blockId);
      data[day.id] = block ? block.exercises : [];
    });
    return data;
  };

  const handleSavePlanning = async () => {
    if (!planningName.trim()) {
      Alert.alert("Erro", "Dê um nome ao seu plano de treino.");
      return;
    }

    const workoutData = buildWorkoutDataFromBlocks();
    await saveTemplate(planningName, workoutData, activeId || undefined);
    setIsSaveModalVisible(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  // ---- Block management -----------------------------------------------

  const handleAddBlock = () => {
    const newBlock = createBlock(getNextLabel(blocks));
    setBlocks((prev) => [...prev, newBlock]);
    setSelectedBlockId(newBlock.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const confirmDeleteBlock = (blockId: string) => {
    if (blocks.length <= 1) {
      Alert.alert(
        "Não é possível excluir",
        "Mantenha pelo menos um bloco de treino ativo.",
      );
      return;
    }

    Alert.alert(
      "Excluir bloco",
      "Os dias vinculados a este bloco ficarão como descanso.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => handleDeleteBlock(blockId),
        },
      ],
    );
  };

  const handleDeleteBlock = (blockId: string) => {
    const remainingBlocks = blocks.filter((b) => b.id !== blockId);
    setBlocks(remainingBlocks);

    setDaySplit((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((dayId) => {
        if (updated[dayId] === blockId) updated[dayId] = null;
      });
      return updated;
    });

    setSelectedBlockId((prev) =>
      prev === blockId ? (remainingBlocks[0]?.id ?? null) : prev,
    );
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleRenameBlock = (blockId: string, newLabel: string) => {
    if (!newLabel.trim()) return;
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === blockId ? { ...b, label: newLabel.trim().toUpperCase() } : b,
      ),
    );
  };

  const handleAddExerciseToBlock = (item: (typeof EXERCISES_LIST)[0]) => {
    if (!selectedBlockId) return;

    setBlocks((prev) =>
      prev.map((block) => {
        if (block.id !== selectedBlockId) return block;

        const existingIndex = block.exercises.findIndex(
          (exercise) => exercise.id === item.id,
        );

        if (existingIndex > -1) {
          const updated = block.exercises.map((exercise, index) =>
            index === existingIndex
              ? { ...exercise, sets: exercise.sets + 1 }
              : exercise,
          );
          return { ...block, exercises: updated };
        }

        const newExercise: PlannedExercise = {
          id: item.id,
          name: item.name,
          muscleGroup: item.muscleGroup,
          mechanic: item.mechanic,
          equipment: item.equipment,
          sets: item.defaultSets || 3,
        };

        return { ...block, exercises: [...block.exercises, newExercise] };
      }),
    );
  };

  const handleUpdateSetsInBlock = (
    blockId: string,
    index: number,
    newSets: number,
  ) => {
    if (newSets < 1) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setBlocks((prev) =>
      prev.map((block) => {
        if (block.id !== blockId) return block;
        const updated = block.exercises.map((exercise, i) =>
          i === index ? { ...exercise, sets: newSets } : exercise,
        );
        return { ...block, exercises: updated };
      }),
    );
  };

  const handleRemoveExerciseFromBlock = (blockId: string, index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setBlocks((prev) =>
      prev.map((block) => {
        if (block.id !== blockId) return block;
        return {
          ...block,
          exercises: block.exercises.filter((_, i) => i !== index),
        };
      }),
    );
  };

  // ---- Weekly split management ------------------------------------------

  const handleAssignDay = (dayId: string, blockId: string | null) => {
    setDaySplit((prev) => ({ ...prev, [dayId]: blockId }));
    setIsDayAssignModalVisible(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // One tap: cycles the current blocks (A, B, C...) across the first N days
  // of the week in order, leaving the rest as rest days. This is what turns
  // an ABC block set into "Mon=A, Tue=B, Wed=C, Thu=A, Fri=B" instantly.
  const handleDistributeAcrossDays = (targetTrainingDays: number) => {
    if (blocks.length === 0) return;
    const count = Math.min(
      Math.max(targetTrainingDays, 1),
      DAYS_OF_WEEK.length,
    );

    const updated: Record<string, string | null> = {};
    DAYS_OF_WEEK.forEach((day, index) => {
      updated[day.id] = index < count ? blocks[index % blocks.length].id : null;
    });

    setDaySplit(updated);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <AppScreen
      style={styles.mainContainer}
      backgroundColor={appTheme.colors.background}
    >
      <View style={styles.topHeader}>
        <View style={[sharedScreenStyles.pageTitleBlock, { marginRight: 8 }]}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            MONTAGEM DE ROTINA
          </Text>
          {currentActivePlan ? (
            <Text style={styles.activePlanBadge} numberOfLines={1}>
              {currentActivePlan.name}
            </Text>
          ) : (
            <Text
              style={[
                styles.activePlanBadge,
                { color: appTheme.colors.textPrimary },
              ]}
              numberOfLines={1}
            >
              Novo Planejamento Ativo
            </Text>
          )}
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.presetButton} onPress={handleNewPlan}>
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

      <ScrollView
        contentContainerStyle={styles.contentBody}
        showsVerticalScrollIndicator={false}
      >
        {/* ---- Blocks row ---- */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.splitTitle}>BLOCOS DE TREINO</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.blockRow}
        >
          {blocks.map((block) => {
            const isSelected = block.id === selectedBlockId;
            return (
              <TouchableOpacity
                key={block.id}
                style={[styles.blockChip, isSelected && styles.blockChipActive]}
                onPress={() => setSelectedBlockId(block.id)}
              >
                <View
                  style={[
                    styles.blockAvatar,
                    isSelected && styles.blockAvatarActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.blockAvatarText,
                      isSelected && styles.blockAvatarTextActive,
                    ]}
                  >
                    {block.label.charAt(0)}
                  </Text>
                </View>
                <View>
                  <Text
                    style={[
                      styles.blockChipLabel,
                      isSelected && styles.blockChipLabelActive,
                    ]}
                    numberOfLines={1}
                  >
                    {block.label}
                  </Text>
                  <Text style={styles.blockChipMeta}>
                    {block.exercises.length} exercícios
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            style={styles.addBlockChip}
            onPress={handleAddBlock}
          >
            <Ionicons name="add" size={20} color="#FFF" />
          </TouchableOpacity>
        </ScrollView>

        {/* ---- Selected block detail ---- */}
        {selectedBlock && (
          <>
            <View style={styles.blockDetailHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.selectedText}>
                  {`BLOCO ${selectedBlock.label}`}
                </Text>
                <Text style={styles.exerciseCount}>
                  {selectedBlock.exercises.length} EXERCÍCIOS
                </Text>
              </View>

              <TouchableOpacity
                style={styles.iconGhostButton}
                onPress={() => {
                  setRenameValue(selectedBlock.label);
                  setIsRenameModalVisible(true);
                }}
              >
                <Ionicons name="pencil-outline" size={16} color="#A2A2A7" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconGhostButton}
                onPress={() => confirmDeleteBlock(selectedBlock.id)}
              >
                <Ionicons
                  name="trash-outline"
                  size={16}
                  color={appTheme.colors.danger}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.workoutList}>
              {selectedBlock.exercises.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="flash-off-outline" size={32} color="#333" />
                  <Text style={styles.emptyStateText}>
                    Bloco vazio. Adicione exercícios abaixo.
                  </Text>
                </View>
              ) : (
                selectedBlock.exercises.map((exercise, index) => {
                  const mainListPR = getExercisePR(exercise.id);
                  return (
                    <View
                      key={`${exercise.id}-${index}`}
                      style={styles.exerciseCard}
                    >
                      <View style={styles.cardInfo}>
                        <Text style={styles.cardExerciseName}>
                          {exercise.name}
                        </Text>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <Text style={styles.cardMuscleGroupMainList}>
                            {exercise.muscleGroup}
                          </Text>
                          {mainListPR && (
                            <View style={styles.mainListPrBadge}>
                              <Ionicons
                                name="trophy"
                                size={9}
                                color={appTheme.colors.accent}
                              />
                              <Text style={styles.mainListPrText}>
                                {String(mainListPR.weight)} kg
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>

                      <View style={styles.stepperContainer}>
                        <TouchableOpacity
                          style={styles.stepperButton}
                          onPress={() =>
                            handleUpdateSetsInBlock(
                              selectedBlock.id,
                              index,
                              exercise.sets - 1,
                            )
                          }
                        >
                          <Ionicons name="remove" size={14} color="#A2A2A7" />
                        </TouchableOpacity>

                        <View style={styles.stepperValueContainer}>
                          <Text style={styles.stepperValue}>
                            {exercise.sets}
                          </Text>
                          <Text style={styles.stepperLabel}>Séries</Text>
                        </View>

                        <TouchableOpacity
                          style={styles.stepperButton}
                          onPress={() =>
                            handleUpdateSetsInBlock(
                              selectedBlock.id,
                              index,
                              exercise.sets + 1,
                            )
                          }
                        >
                          <Ionicons name="add" size={14} color="#FFF" />
                        </TouchableOpacity>
                      </View>

                      <TouchableOpacity
                        style={styles.deleteCardButton}
                        onPress={() =>
                          handleRemoveExerciseFromBlock(selectedBlock.id, index)
                        }
                      >
                        <Ionicons
                          name="trash-outline"
                          size={18}
                          color={appTheme.colors.danger}
                        />
                      </TouchableOpacity>
                    </View>
                  );
                })
              )}

              <TouchableOpacity
                style={styles.addExerciseInlineButton}
                onPress={() => setIsExerciseModalVisible(true)}
              >
                <Ionicons name="add-circle-outline" size={16} color="#FFF" />
                <Text style={styles.addExerciseInlineText}>
                  ADICIONAR EXERCÍCIO
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* ---- Weekly split ---- */}
        <View style={styles.splitDivider} />

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.splitTitle}>DIVISÃO SEMANAL</Text>
          <Text style={styles.splitSummary}>
            {trainingDaysCount} DIAS DE TREINO ·{restDaysCount} DIAS DE DESCANSO
          </Text>
        </View>

        <View style={styles.dayGrid}>
          {DAYS_OF_WEEK.map((day) => {
            const assignedBlockId = daySplit[day.id];
            const assignedBlock = blocks.find((b) => b.id === assignedBlockId);
            return (
              <TouchableOpacity
                key={day.id}
                style={styles.daySplitChip}
                onPress={() => {
                  setDayBeingAssigned(day.id);
                  setIsDayAssignModalVisible(true);
                }}
              >
                <Text style={styles.daySplitLabel}>
                  {day.label.substring(0, 3).toUpperCase()}
                </Text>
                <View
                  style={[
                    styles.daySplitBadge,
                    assignedBlock && styles.daySplitBadgeActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.daySplitBadgeText,
                      assignedBlock && styles.daySplitBadgeTextActive,
                    ]}
                  >
                    {assignedBlock ? assignedBlock.label.charAt(0) : "—"}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footerActions}>
        <TouchableOpacity
          style={styles.saveMainButton}
          onPress={() => setIsSaveModalVisible(true)}
        >
          <Text style={styles.saveMainButtonText}>CONCLUIR PLANEJAMENTO</Text>
        </TouchableOpacity>
      </View>

      {/* Modal de Planos Salvos */}
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
                extraData={[templates, activeId]}
                keyExtractor={(item) => item.id}
                style={{ width: "100%", maxHeight: 280 }}
                renderItem={({ item }) => (
                  <PlanListItem
                    item={item}
                    isSelected={item.id === activeId}
                    onSelect={() => {
                      selectActiveTemplate(item.id);
                      setIsPlansModalVisible(false);
                    }}
                    onDelete={async () => {
                      await deleteTemplate(item.id);
                      Haptics.notificationAsync(
                        Haptics.NotificationFeedbackType.Success,
                      );
                    }}
                  />
                )}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Modal de Seleção de Exercícios */}
      <Modal transparent visible={isExerciseModalVisible} animationType="slide">
        <View style={styles.centeredView}>
          <View style={[styles.modalView, styles.modalViewExpanded]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>BIBLIOTECA</Text>
                <Text style={styles.modalSubtitle}>
                  {selectedBlock
                    ? `Injetando cargas no Bloco ${selectedBlock.label}`
                    : "Selecione um bloco primeiro"}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.closeModalButton}
                onPress={() => {
                  setIsExerciseModalVisible(false);
                  setSelectedMuscleFilter("Todos");
                }}
              >
                <Ionicons name="close" size={20} color="#000" />
              </TouchableOpacity>
            </View>

            <View style={styles.filterContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {MUSCLE_FILTERS.map((muscle) => {
                  const isSelected = selectedMuscleFilter === muscle;
                  return (
                    <TouchableOpacity
                      key={muscle}
                      onPress={() => setSelectedMuscleFilter(muscle)}
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
                (exercise) =>
                  selectedMuscleFilter === "Todos" ||
                  exercise.muscleGroup === selectedMuscleFilter,
              )}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              style={{ width: "100%" }}
              renderItem={({ item }) => (
                <ExercisePickerCard
                  item={item}
                  pr={getExercisePR(item.id)}
                  onAdd={() => handleAddExerciseToBlock(item)}
                />
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Modal de Atribuição de Dia */}
      <Modal transparent visible={isDayAssignModalVisible} animationType="fade">
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>ATRIBUIR BLOCO</Text>

            <TouchableOpacity
              style={styles.assignOption}
              onPress={() =>
                dayBeingAssigned && handleAssignDay(dayBeingAssigned, null)
              }
            >
              <View style={styles.assignOptionBadge}>
                <Text style={styles.assignOptionBadgeText}>—</Text>
              </View>
              <Text style={styles.assignOptionText}>DESCANSO</Text>
            </TouchableOpacity>

            {blocks.map((block) => (
              <TouchableOpacity
                key={block.id}
                style={styles.assignOption}
                onPress={() =>
                  dayBeingAssigned &&
                  handleAssignDay(dayBeingAssigned, block.id)
                }
              >
                <View
                  style={[styles.assignOptionBadge, styles.blockAvatarActive]}
                >
                  <Text style={styles.blockAvatarTextActive}>
                    {block.label.charAt(0)}
                  </Text>
                </View>
                <Text style={styles.assignOptionText}>
                  {`BLOCO ${block.label} · ${block.exercises.length} EX.`}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity onPress={() => setIsDayAssignModalVisible(false)}>
              <Text style={styles.cancelText}>CANCELAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de Renomear Bloco */}
      <Modal transparent visible={isRenameModalVisible} animationType="fade">
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>RENOMEAR BLOCO</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: PUSH, A, SUPERIOR"
              placeholderTextColor="#444"
              value={renameValue}
              onChangeText={setRenameValue}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={styles.confirmSaveButton}
              onPress={() => {
                if (selectedBlockId) {
                  handleRenameBlock(selectedBlockId, renameValue);
                }
                setIsRenameModalVisible(false);
              }}
            >
              <Text style={styles.confirmSaveText}>SALVAR</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsRenameModalVisible(false)}>
              <Text style={styles.cancelText}>CANCELAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de Salvar Planejamento */}
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
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: appTheme.colors.background },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: appTheme.colors.background,
  },
  headerTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1,
  },
  activePlanBadge: {
    color: appTheme.colors.textSecondary,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  headerActions: { flexDirection: "row", gap: 6 },
  presetButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: appTheme.colors.surfaceElevated,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    gap: 4,
  },
  presetButtonText: { color: "#FFF", fontWeight: "700", fontSize: 11 },
  contentBody: { paddingHorizontal: 16, paddingBottom: 130, paddingTop: 4 },

  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 18,
    marginBottom: 10,
  },
  splitTitle: {
    color: appTheme.colors.textSecondary,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  splitSummary: {
    color: appTheme.colors.textPrimary,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  // Blocks
  blockRow: { gap: 8, paddingRight: 8 },
  blockChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: appTheme.colors.surfaceElevated,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: appTheme.colors.borderStrong,
    minWidth: 128,
  },
  blockChipActive: { borderColor: appTheme.colors.accent },
  blockAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: appTheme.colors.borderStrong,
  },
  blockAvatarActive: {
    backgroundColor: "rgba(255, 159, 10, 0.15)",
    borderColor: appTheme.colors.accent,
  },
  blockAvatarText: { color: "#A2A2A7", fontSize: 13, fontWeight: "900" },
  blockAvatarTextActive: { color: appTheme.colors.accent },
  blockChipLabel: {
    color: "#A2A2A7",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  blockChipLabelActive: { color: "#FFF" },
  blockChipMeta: {
    color: "#636366",
    fontSize: 9,
    fontWeight: "600",
    marginTop: 1,
  },
  addBlockChip: {
    width: 44,
    height: 56,
    borderRadius: 12,
    backgroundColor: appTheme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: appTheme.colors.borderStrong,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },

  blockDetailHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
    marginBottom: 14,
  },
  iconGhostButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: appTheme.colors.surfaceElevated,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: appTheme.colors.borderStrong,
  },
  selectedText: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  exerciseCount: {
    color: appTheme.colors.textPrimary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginTop: 2,
  },

  workoutList: { width: "100%" },
  exerciseCard: {
    backgroundColor: appTheme.colors.surfaceElevated,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: appTheme.colors.borderStrong,
  },
  cardInfo: { flex: 1, justifyContent: "center" },
  cardExerciseName: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 3,
  },
  cardMuscleGroupMainList: {
    color: appTheme.colors.textSecondary,
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  deleteCardButton: { paddingLeft: 14, justifyContent: "center" },
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#121212",
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: appTheme.colors.borderStrong,
  },
  stepperButton: {
    backgroundColor: appTheme.colors.surfaceElevated,
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
  emptyState: {
    alignItems: "center",
    marginTop: 30,
    marginBottom: 14,
    gap: 10,
  },
  emptyStateText: { color: "#444", fontSize: 13, fontWeight: "600" },

  addExerciseInlineButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#121212",
    borderRadius: 10,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: appTheme.colors.borderStrong,
    borderStyle: "dashed",
  },
  addExerciseInlineText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  // Weekly split
  splitDivider: {
    height: 1,
    backgroundColor: appTheme.colors.borderStrong,
    marginTop: 24,
  },
  presetRow: { gap: 8, paddingBottom: 4 },
  presetDayButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  presetDayButtonText: {
    color: "#000",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
  dayGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },
  daySplitChip: {
    alignItems: "center",
    gap: 6,
    backgroundColor: appTheme.colors.surfaceElevated,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: appTheme.colors.borderStrong,
    minWidth: 46,
  },
  daySplitLabel: {
    color: appTheme.colors.textSecondary,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  daySplitBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
  },
  daySplitBadgeActive: { backgroundColor: "#FFF" },
  daySplitBadgeText: { color: "#636366", fontSize: 12, fontWeight: "900" },
  daySplitBadgeTextActive: { color: "#000" },

  footerActions: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
  },
  saveMainButton: {
    backgroundColor: appTheme.colors.textPrimary,
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

  centeredView: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.85)",
  },
  modalView: {
    width: "100%",
    backgroundColor: appTheme.colors.surfaceElevated,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: appTheme.colors.borderStrong,
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
    borderColor: appTheme.colors.borderStrong,
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
    color: appTheme.colors.textSecondary,
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
    borderColor: appTheme.colors.borderStrong,
  },
  planItemCardActive: { borderColor: appTheme.colors.textPrimary },
  planItemName: {
    color: "#A2A2A7",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  planItemNameActive: { color: appTheme.colors.textPrimary },
  confirmDeleteBadge: {
    backgroundColor: appTheme.colors.danger,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  confirmDeleteText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "800",
  },
  modalViewExpanded: { height: "85%" },
  modalSubtitle: {
    color: appTheme.colors.textSecondary,
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
    borderColor: appTheme.colors.borderStrong,
    justifyContent: "center",
  },
  filterChipActive: {
    backgroundColor: appTheme.colors.textPrimary,
    borderColor: appTheme.colors.textPrimary,
  },
  filterChipText: {
    color: appTheme.colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
  },
  filterChipTextActive: { color: "#000" },
  mainListPrBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 159, 10, 0.1)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  mainListPrText: {
    color: appTheme.colors.accent,
    fontSize: 9,
    fontWeight: "700",
  },
  assignOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#121212",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: appTheme.colors.borderStrong,
  },
  assignOptionBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#1C1C1E",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: appTheme.colors.borderStrong,
  },
  assignOptionBadgeText: { color: "#636366", fontSize: 13, fontWeight: "900" },
  assignOptionText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});
