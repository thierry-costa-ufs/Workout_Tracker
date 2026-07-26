import { EXERCISES_LIST } from "@/core/constants/exercises";
import {
  MUSCLE_FILTERS,
  MuscleFilterType,
  DAYS_OF_WEEK,
} from "@/core/constants/days";
import { useTemplates, usePersonalRecords } from "@/context/WorkoutContext";
import { AppScreen } from "@/core/ui/AppScreen";
import { appTheme } from "@/shared/constants/theme";
import { sharedScreenStyles } from "@/shared/styles/screenStyles";
import { Overlay } from "@/shared/ui/Overlay";
import { useTabBackHandler } from "@/shared/hooks/useTabBackHandler";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import {
  Alert,
  FlatList,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ExercisePickerCard } from "../components/ExercisePickerCard";
import { PlanListItem } from "../components/PlanListItem";
import { usePlanningBlocks } from "../hooks/usePlanningBlocks";
import { planningStyles as styles } from "../styles/planningStyles";

export default function PlanningScreen() {
  useTabBackHandler();
  const {
    blocks,
    daySplit,
    selectedBlockId,
    selectedBlock,
    currentActivePlan,
    trainingDaysCount,
    restDaysCount,
    templates,
    activeId,
    setSelectedBlockId,
    handleNewPlan,
    handleAddBlock,
    confirmDeleteBlock,
    handleRenameBlock,
    handleAddExerciseToBlock,
    handleUpdateSetsInBlock,
    handleRemoveExerciseFromBlock,
    handleAssignDay,
    buildWorkoutDataFromBlocks,
    saveTemplate,
    selectActiveTemplate,
  } = usePlanningBlocks();

  const { deleteTemplate } = useTemplates();
  const { getExercisePR } = usePersonalRecords();

  const [planningName, setPlanningName] = useState("");
  const [isSaveModalVisible, setIsSaveModalVisible] = useState(false);
  const [isPlansModalVisible, setIsPlansModalVisible] = useState(false);
  const [isExerciseModalVisible, setIsExerciseModalVisible] = useState(false);
  const [isDayAssignModalVisible, setIsDayAssignModalVisible] =
    useState(false);
  const [dayBeingAssigned, setDayBeingAssigned] = useState<string | null>(null);
  const [isRenameModalVisible, setIsRenameModalVisible] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [selectedMuscleFilter, setSelectedMuscleFilter] =
    useState<MuscleFilterType>("Todos");
  const [exerciseSearch, setExerciseSearch] = useState("");

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

  return (
    <AppScreen
      style={styles.mainContainer}
      backgroundColor={appTheme.colors.background}
    >
      <View style={sharedScreenStyles.pageHeader}>
        <View style={sharedScreenStyles.pageTitleBlock}>
          <Text style={sharedScreenStyles.pageTitle} numberOfLines={1}>
            SUA ROTINA
          </Text>
          {currentActivePlan ? (
            <Text style={sharedScreenStyles.pageSubtitle} numberOfLines={1}>
              PLANO ATUAL: {currentActivePlan.name}
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

      <ScrollView
        contentContainerStyle={styles.contentBody}
        showsVerticalScrollIndicator={false}
      >
        {/* Blocks row */}
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
                style={[
                  styles.blockChip,
                  isSelected && styles.blockChipActive,
                ]}
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

        {/* Selected block detail */}
        {selectedBlock && (
          <>
            <View style={styles.blockDetailHeader}>
              <View style={styles.flex1}>
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
                          style={styles.prRow}
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
                          <Ionicons
                            name="remove"
                            size={14}
                            color="#A2A2A7"
                          />
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
                          handleRemoveExerciseFromBlock(
                            selectedBlock.id,
                            index,
                          )
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

        {/* Weekly split */}
        <View style={styles.splitDivider} />

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.splitTitle}>DIVISÃO SEMANAL</Text>
          <Text style={styles.splitSummary}>
            {trainingDaysCount} DIAS DE TREINO ·{restDaysCount} DIAS DE
            DESCANSO
          </Text>
        </View>

        <View style={styles.dayGrid}>
          {DAYS_OF_WEEK.map((day: { id: string; label: string }) => {
            const assignedBlockId = daySplit[day.id];
            const assignedBlock = blocks.find(
              (b) => b.id === assignedBlockId,
            );
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
          <Text style={styles.saveMainButtonText}>
            CONCLUIR PLANEJAMENTO
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal de Planos Salvos */}
      <Overlay
        visible={isPlansModalVisible}
        onClose={() => setIsPlansModalVisible(false)}
        animationType="fade"
      >
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
            style={styles.fullWidthMaxHeight}
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
      </Overlay>

      {/* Modal de Seleção de Exercícios */}
      <Overlay
        visible={isExerciseModalVisible}
        onClose={() => {
          setIsExerciseModalVisible(false);
          setSelectedMuscleFilter("Todos");
          setExerciseSearch("");
        }}
        animationType="slide"
        style={{ height: "85%" }}
      >
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

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={16} color="#636366" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar exercício..."
            placeholderTextColor="#636366"
            value={exerciseSearch}
            onChangeText={setExerciseSearch}
            autoCorrect={false}
          />
        </View>

        <FlatList
          data={EXERCISES_LIST.filter(
            (exercise) =>
              (selectedMuscleFilter === "Todos" ||
                exercise.muscleGroup === selectedMuscleFilter) &&
              (exerciseSearch === "" ||
                exercise.name
                  .toLowerCase()
                  .includes(exerciseSearch.toLowerCase())),
          )}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          style={styles.fullWidth}
          renderItem={({ item }) => (
            <ExercisePickerCard
              item={item}
              pr={getExercisePR(item.id)}
              onAdd={() => handleAddExerciseToBlock(item)}
            />
          )}
        />
      </Overlay>

      {/* Modal de Atribuição de Dia */}
      <Overlay
        visible={isDayAssignModalVisible}
        onClose={() => setIsDayAssignModalVisible(false)}
        animationType="fade"
      >
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
              style={[
                styles.assignOptionBadge,
                styles.blockAvatarActive,
              ]}
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

        <TouchableOpacity
          onPress={() => setIsDayAssignModalVisible(false)}
        >
          <Text style={styles.cancelText}>CANCELAR</Text>
        </TouchableOpacity>
      </Overlay>

      {/* Modal de Renomear Bloco */}
      <Overlay
        visible={isRenameModalVisible}
        onClose={() => setIsRenameModalVisible(false)}
        animationType="fade"
      >
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
      </Overlay>

      {/* Modal de Salvar Planejamento */}
      <Overlay
        visible={isSaveModalVisible}
        onClose={() => setIsSaveModalVisible(false)}
        animationType="fade"
      >
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
      </Overlay>
    </AppScreen>
  );
}
