import { DAYS_OF_WEEK } from '@/core/constants/days';
import { useTemplates } from '@/context/TemplatesContext';
import { usePersonalRecords } from '@/context/PersonalRecordsContext';
import { AppScreen } from '@/core/ui/AppScreen';
import { appTheme } from '@/shared/constants/theme';
import { sharedScreenStyles } from '@/shared/styles/screenStyles';
import { Overlay } from '@/shared/ui/Overlay';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { hapticNotify } from '@/core/utils/haptics';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ExercisePickerModal } from '@/shared/ui/ExercisePickerModal';
import { PlansModal } from '../components/PlansModal';
import { PrBadge } from '@/shared/ui/PrBadge';
import { usePlanningBlocks } from '../hooks/usePlanningBlocks';
import { buildBlockStructure, findDuplicateBlockSignatures } from '../utils/blockSerializer';
import type { WorkoutBlock } from '../utils/blockSerializer';
import { planningStyles as styles } from '../styles/planningStyles';

export default function PlanningScreen() {
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
    mergeDuplicateBlocks,
    buildWorkoutDataFromBlocks,
    saveTemplate,
    selectActiveTemplate,
  } = usePlanningBlocks();

  const { deleteTemplate } = useTemplates();
  const { getExercisePR } = usePersonalRecords();

  const [planningName, setPlanningName] = useState('');
  const [isSaveModalVisible, setIsSaveModalVisible] = useState(false);
  const [isPlansModalVisible, setIsPlansModalVisible] = useState(false);
  const [isExerciseModalVisible, setIsExerciseModalVisible] = useState(false);
  const [isDayAssignModalVisible, setIsDayAssignModalVisible] = useState(false);
  const [dayBeingAssigned, setDayBeingAssigned] = useState<string | null>(null);
  const [isRenameModalVisible, setIsRenameModalVisible] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [isOrphanModalVisible, setIsOrphanModalVisible] = useState(false);
  const [orphanCountdown, setOrphanCountdown] = useState(3);

  const orphanBlocks = blocks.filter((b) => b.exercises.length > 0 && !daySplit[b.id]);

  useEffect(() => {
    if (!isOrphanModalVisible) return;
    setOrphanCountdown(3);
    const id = setInterval(() => {
      setOrphanCountdown((c) => (c <= 1 ? 0 : c - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [isOrphanModalVisible]);

  const finalizeSave = async (bl: WorkoutBlock[], sp: Record<string, string | null>) => {
    const duplicates = findDuplicateBlockSignatures(bl);
    if (duplicates.length > 0) {
      Alert.alert(
        'Blocos idênticos',
        'Existem blocos com os mesmos exercícios. Juntar em um só bloco?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Manter separados', onPress: () => doSave(bl, sp) },
          {
            text: 'Juntar',
            onPress: () => {
              const merged = mergeDuplicateBlocks();
              doSave(merged.blocks, merged.daySplit);
            },
          },
        ],
      );
      return;
    }
    await doSave(bl, sp);
  };

  const doSave = async (bl: WorkoutBlock[], sp: Record<string, string | null>) => {
    const workoutData = buildWorkoutDataFromBlocks(bl, sp);
    await saveTemplate(
      planningName.trim(),
      workoutData,
      activeId || undefined,
      buildBlockStructure(bl, sp),
    );
    setIsSaveModalVisible(false);
    hapticNotify();
  };

  const handleSavePlanning = async () => {
    if (!planningName.trim()) {
      Alert.alert('Erro', 'Dê um nome ao seu plano de treino.');
      return;
    }

    if (orphanBlocks.length > 0) {
      setIsOrphanModalVisible(true);
      return;
    }

    await finalizeSave(blocks, daySplit);
  };

  return (
    <AppScreen style={styles.mainContainer} backgroundColor={appTheme.colors.background}>
      <View style={sharedScreenStyles.pageHeader}>
        <View style={sharedScreenStyles.pageTitleBlock}>
          <Text style={sharedScreenStyles.pageTitle} numberOfLines={1}>
            ROTINA
          </Text>
          {currentActivePlan ? (
            <Text style={sharedScreenStyles.pageSubtitle} numberOfLines={1}>
              PLANO ATUAL: {currentActivePlan.name}
            </Text>
          ) : (
            <Text
              style={[styles.activePlanBadge, { color: appTheme.colors.textPrimary }]}
              numberOfLines={1}
            >
              Novo Planejamento Ativo
            </Text>
          )}
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.presetButton} onPress={handleNewPlan}>
            <Ionicons name="refresh-outline" size={14} color={appTheme.colors.white} />
            <Text style={styles.presetButtonText}>Limpar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.presetButton}
            onPress={() => setIsPlansModalVisible(true)}
          >
            <Ionicons name="folder-open-outline" size={14} color={appTheme.colors.white} />
            <Text style={styles.presetButtonText}>Planos</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.contentBody} showsVerticalScrollIndicator={false}>
        {/* Blocks row */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.splitTitle}>BLOCOS DE TREINO</Text>
        </View>

        <View>
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
                  <View style={[styles.blockAvatar, isSelected && styles.blockAvatarActive]}>
                    <Text
                      style={[styles.blockAvatarText, isSelected && styles.blockAvatarTextActive]}
                    >
                      {block.label.charAt(0)}
                    </Text>
                  </View>
                  <View>
                    <Text
                      style={[styles.blockChipLabel, isSelected && styles.blockChipLabelActive]}
                      numberOfLines={1}
                    >
                      {block.label}
                    </Text>
                    <Text style={styles.blockChipMeta}>{block.exercises.length} exercícios</Text>
                  </View>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity style={styles.addBlockChip} onPress={handleAddBlock}>
              <Ionicons name="add" size={20} color={appTheme.colors.white} />
            </TouchableOpacity>
          </ScrollView>
          <LinearGradient
            pointerEvents="none"
            colors={['transparent', appTheme.colors.background]}
            start={{ x: 0.85, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 40 }}
          />
        </View>

        {/* Selected block detail */}
        {selectedBlock && (
          <>
            <View style={styles.blockDetailHeader}>
              <View style={styles.flex1}>
                <Text style={styles.selectedText}>{`BLOCO ${selectedBlock.label}`}</Text>
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
                <Ionicons name="pencil-outline" size={16} color={appTheme.colors.textTertiary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconGhostButton}
                onPress={() => confirmDeleteBlock(selectedBlock.id)}
              >
                <Ionicons name="trash-outline" size={16} color={appTheme.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.workoutList}>
              {selectedBlock.exercises.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="flash-off-outline" size={32} color={appTheme.colors.gray} />
                  <Text style={styles.emptyStateText}>
                    Bloco vazio. Adicione exercícios abaixo.
                  </Text>
                </View>
              ) : (
                selectedBlock.exercises.map((exercise, index) => {
                  const mainListPR = getExercisePR(exercise.id);
                  return (
                    <View key={`${exercise.id}-${index}`} style={styles.exerciseCard}>
                      <View style={styles.cardInfo}>
                        <Text style={styles.cardExerciseName}>{exercise.name}</Text>
                        <View style={styles.prRow}>
                          <Text style={styles.cardMuscleGroupMainList}>{exercise.muscleGroup}</Text>
                          {mainListPR && (
                            <PrBadge weight={mainListPR.weight} reps={mainListPR.reps} />
                          )}
                        </View>
                      </View>

                      <View style={styles.stepperContainer}>
                        <TouchableOpacity
                          style={styles.stepperButton}
                          onPress={() =>
                            handleUpdateSetsInBlock(selectedBlock.id, index, exercise.sets - 1)
                          }
                        >
                          <Ionicons name="remove" size={14} color={appTheme.colors.textTertiary} />
                        </TouchableOpacity>

                        <View style={styles.stepperValueContainer}>
                          <Text style={styles.stepperValue}>{exercise.sets}</Text>
                          <Text style={styles.stepperLabel}>Séries</Text>
                        </View>

                        <TouchableOpacity
                          style={styles.stepperButton}
                          onPress={() =>
                            handleUpdateSetsInBlock(selectedBlock.id, index, exercise.sets + 1)
                          }
                        >
                          <Ionicons name="add" size={14} color={appTheme.colors.white} />
                        </TouchableOpacity>
                      </View>

                      <TouchableOpacity
                        style={styles.deleteCardButton}
                        onPress={() => handleRemoveExerciseFromBlock(selectedBlock.id, index)}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={18}
                          color={appTheme.colors.textPrimary}
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
                <Ionicons name="add-circle-outline" size={16} color={appTheme.colors.white} />
                <Text style={styles.addExerciseInlineText}>ADICIONAR EXERCÍCIO</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Weekly split */}
        <View style={styles.splitDivider} />

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.splitTitle}>DIVISÃO SEMANAL</Text>
          <Text style={styles.splitSummary}>
            {trainingDaysCount} DIAS DE TREINO ·{restDaysCount} DIAS DE DESCANSO
          </Text>
        </View>

        <View style={styles.dayGrid}>
          {DAYS_OF_WEEK.map((day: { id: string; label: string }) => {
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
                <Text style={styles.daySplitLabel}>{day.label.substring(0, 3).toUpperCase()}</Text>
                <View style={[styles.daySplitBadge, assignedBlock && styles.daySplitBadgeActive]}>
                  <Text
                    style={[
                      styles.daySplitBadgeText,
                      assignedBlock && styles.daySplitBadgeTextActive,
                    ]}
                  >
                    {assignedBlock ? assignedBlock.label.charAt(0) : '—'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footerActions}>
        <TouchableOpacity style={styles.saveMainButton} onPress={() => setIsSaveModalVisible(true)}>
          <Text style={styles.saveMainButtonText}>CONCLUIR PLANEJAMENTO</Text>
        </TouchableOpacity>
      </View>

      {/* Modal de Planos Salvos */}
      <PlansModal
        visible={isPlansModalVisible}
        onClose={() => setIsPlansModalVisible(false)}
        templates={templates}
        activeId={activeId}
        onSelectTemplate={selectActiveTemplate}
        onDeleteTemplate={deleteTemplate}
      />

      {/* Modal de Seleção de Exercícios */}
      <ExercisePickerModal
        visible={isExerciseModalVisible}
        onClose={() => setIsExerciseModalVisible(false)}
        selectedBlock={selectedBlock}
        getExercisePR={getExercisePR}
        onAddExercise={handleAddExerciseToBlock}
      />

      {/* Modal de Atribuição de Dia */}
      <Overlay
        visible={isDayAssignModalVisible}
        onClose={() => setIsDayAssignModalVisible(false)}
        animationType="fade"
      >
        <Text style={styles.modalTitle}>ATRIBUIR BLOCO</Text>

        <TouchableOpacity
          style={styles.assignOption}
          onPress={() => dayBeingAssigned && handleAssignDay(dayBeingAssigned, null)}
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
            onPress={() => dayBeingAssigned && handleAssignDay(dayBeingAssigned, block.id)}
          >
            <View style={[styles.assignOptionBadge, styles.blockAvatarActive]}>
              <Text style={styles.blockAvatarTextActive}>{block.label.charAt(0)}</Text>
            </View>
            <Text style={styles.assignOptionText}>
              {`BLOCO ${block.label} · ${block.exercises.length} EX.`}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity onPress={() => setIsDayAssignModalVisible(false)}>
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
          placeholderTextColor={appTheme.colors.muted}
          value={renameValue}
          onChangeText={setRenameValue}
          autoCapitalize="characters"
          maxLength={20}
          blurOnSubmit
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
          placeholderTextColor={appTheme.colors.muted}
          value={planningName}
          onChangeText={setPlanningName}
          maxLength={40}
          blurOnSubmit
        />
        <TouchableOpacity style={styles.confirmSaveButton} onPress={handleSavePlanning}>
          <Text style={styles.confirmSaveText}>ATIVAR AGORA</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsSaveModalVisible(false)}>
          <Text style={styles.cancelText}>CANCELAR</Text>
        </TouchableOpacity>
      </Overlay>

      {/* Modal de Blocos sem Dia Atribuído */}
      <Overlay
        visible={isOrphanModalVisible}
        onClose={() => setIsOrphanModalVisible(false)}
        animationType="fade"
      >
        <Text style={styles.modalTitle}>BLOCOS SEM DIA</Text>
        <Text style={styles.orphanSubtitle}>
          Estes blocos têm exercícios, mas nenhum dia da semana atribuído. Eles serão removidos do
          plano. Mantê-los?
        </Text>
        {orphanBlocks.map((block) => (
          <View key={block.id} style={styles.orphanBlockRow}>
            <View style={[styles.assignOptionBadge, styles.blockAvatarActive]}>
              <Text style={styles.blockAvatarTextActive}>{block.label.charAt(0)}</Text>
            </View>
            <Text style={styles.orphanBlockText}>
              {`BLOCO ${block.label} · ${block.exercises.length} EX.`}
            </Text>
          </View>
        ))}
        <TouchableOpacity
          style={[
            styles.confirmSaveButton,
            orphanCountdown > 0 && styles.confirmSaveButtonDisabled,
          ]}
          disabled={orphanCountdown > 0}
          onPress={() => {
            setIsOrphanModalVisible(false);
            finalizeSave(blocks, daySplit);
          }}
        >
          <Text style={styles.confirmSaveText}>
            {orphanCountdown > 0 ? `MANTER (${orphanCountdown})` : 'MANTER E SALVAR'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setIsOrphanModalVisible(false);
            setIsSaveModalVisible(false);
          }}
        >
          <Text style={styles.cancelText}>CANCELAR</Text>
        </TouchableOpacity>
      </Overlay>
    </AppScreen>
  );
}
