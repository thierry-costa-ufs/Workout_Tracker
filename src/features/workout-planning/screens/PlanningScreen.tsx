import { DAYS_OF_WEEK } from '@/core/constants/days';
import { useTemplates } from '@/context/TemplatesContext';
import { usePersonalRecords } from '@/context/PersonalRecordsContext';
import { AppScreen } from '@/core/ui/AppScreen';
import { appTheme } from '@/shared/constants/theme';
import { sharedScreenStyles } from '@/shared/styles/screenStyles';
import { Overlay } from '@/shared/ui/Overlay';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { hapticNotify } from '@/core/utils/haptics';
import { useEffect, useState } from 'react';
import { Alert, Keyboard, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ExercisePickerModal } from '@/shared/ui/ExercisePickerModal';
import { PlansModal } from '../components/PlansModal';
import { PrBadge } from '@/shared/ui/PrBadge';
import { usePlanningBlocks } from '../hooks/usePlanningBlocks';
import { buildBlockStructure, findDuplicateBlockSignatures } from '../utils/blockSerializer';
import type { WorkoutBlock } from '../utils/blockSerializer';
import type { PlannedExercise } from '@/types/workout';
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
  const [isSplitExpanded, setIsSplitExpanded] = useState(true);

  const orphanBlocks = blocks.filter(
    (b) => b.exercises.length > 0 && !Object.values(daySplit).includes(b.id),
  );

  const totalExercises = blocks.reduce((sum, b) => sum + b.exercises.length, 0);

  const groupedExercises = Array.from(
    selectedBlock?.exercises
      .reduce<Map<string, { exercise: PlannedExercise; index: number }[]>>(
        (map, exercise, index) => {
          const list = map.get(exercise.muscleGroup);
          if (list) list.push({ exercise, index });
          else map.set(exercise.muscleGroup, [{ exercise, index }]);
          return map;
        },
        new Map(),
      )
      .entries() ?? [],
  );

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
      Keyboard.dismiss();
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
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.presetButton} onPress={handleNewPlan}>
            <Feather name="refresh-cw" size={14} color={appTheme.colors.white} />
            <Text style={styles.presetButtonText}>Limpar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.presetButton}
            onPress={() => setIsPlansModalVisible(true)}
          >
            <Feather name="folder" size={14} color={appTheme.colors.white} />
            <Text style={styles.presetButtonText}>Planos</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.contentBody} showsVerticalScrollIndicator={false}>
        {/* Hero summary */}
        <View style={styles.heroCard}>
          <Text style={styles.heroTag}>
            {currentActivePlan ? 'PLANO ATUAL' : 'NOVO PLANEJAMENTO'}
          </Text>
          <Text style={styles.heroCardTitle}>
            {currentActivePlan ? currentActivePlan.name.toUpperCase() : 'FAÇA SUA ROTINA'}
          </Text>
          <Text style={styles.heroCardSubtitle}>
            {currentActivePlan
              ? 'Sua divisão ativa. Toque em um bloco para revisar o volume e os exercícios.'
              : 'Crie blocos, adicione exercícios e atribua os dias da semana para montar sua divisão de treino.'}
          </Text>
          <View style={styles.heroMetaRow}>
            <Text style={styles.heroMeta}>{trainingDaysCount}/7 DIAS PREENCHIDOS</Text>
            <Text style={styles.heroMetaDot}>·</Text>
            <Text style={styles.heroMeta}>{totalExercises} EXERCÍCIOS</Text>
          </View>
        </View>

        {/* Blocks section */}
        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionTitleText}>BLOCOS DE TREINO</Text>
          <View style={styles.sectionDivider} />
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
                  <View style={[styles.blockAvatar, isSelected && styles.blockAvatarSelected]}>
                    <Text
                      style={[styles.blockAvatarText, isSelected && styles.blockAvatarTextSelected]}
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
              <Feather name="plus" size={20} color={appTheme.colors.white} />
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
                <Feather name="edit-2" size={15} color={appTheme.colors.textTertiary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconGhostButton}
                onPress={() => confirmDeleteBlock(selectedBlock.id)}
              >
                <Feather name="trash-2" size={15} color={appTheme.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.workoutList}>
              {selectedBlock.exercises.length === 0 ? (
                <View style={styles.emptyState}>
                  <Feather name="zap-off" size={32} color={appTheme.colors.gray} />
                  <Text style={styles.emptyStateText}>
                    Este bloco está vazio. Adicione exercícios para montar seu treino.
                  </Text>
                </View>
              ) : (
                groupedExercises.map(([muscleGroup, items]) => (
                  <View key={muscleGroup}>
                    <View style={styles.groupHeader}>
                      <Text style={styles.groupHeaderLabel}>{muscleGroup}</Text>
                      <View style={styles.groupHeaderDivider} />
                    </View>
                    {items.map(({ exercise, index }) => {
                      const mainListPR = getExercisePR(exercise.id);
                      return (
                        <View key={`${exercise.id}-${index}`} style={styles.exerciseCard}>
                          <View style={styles.cardInfo}>
                            <Text style={styles.cardExerciseName}>{exercise.name}</Text>
                            {mainListPR && (
                              <View style={styles.prRow}>
                                <PrBadge weight={mainListPR.weight} reps={mainListPR.reps} />
                              </View>
                            )}
                          </View>

                          <View style={styles.stepperContainer}>
                            <TouchableOpacity
                              style={styles.stepperButton}
                              onPress={() =>
                                handleUpdateSetsInBlock(selectedBlock.id, index, exercise.sets - 1)
                              }
                            >
                              <Feather
                                name="minus"
                                size={14}
                                color={appTheme.colors.textTertiary}
                              />
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
                              <Feather name="plus" size={14} color={appTheme.colors.white} />
                            </TouchableOpacity>
                          </View>

                          <TouchableOpacity
                            style={styles.deleteCardButton}
                            onPress={() => handleRemoveExerciseFromBlock(selectedBlock.id, index)}
                          >
                            <Feather name="trash-2" size={17} color={appTheme.colors.textPrimary} />
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </View>
                ))
              )}

              <TouchableOpacity
                style={styles.addExerciseInlineButton}
                onPress={() => setIsExerciseModalVisible(true)}
              >
                <Feather name="plus-circle" size={16} color={appTheme.colors.white} />
                <Text style={styles.addExerciseInlineText}>ADICIONAR EXERCÍCIO</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Weekly split */}
        <View style={styles.splitDivider} />

        <TouchableOpacity
          style={styles.splitSectionHeader}
          onPress={() => setIsSplitExpanded((v) => !v)}
        >
          <Text style={styles.splitTitle}>DIVISÃO SEMANAL</Text>
          <Text style={styles.splitSummary}>
            {trainingDaysCount} DIAS DE TREINO · {restDaysCount} DE DESCANSO
          </Text>
          <Feather
            name={isSplitExpanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={appTheme.colors.textSecondary}
          />
        </TouchableOpacity>

        {isSplitExpanded && (
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
                  <Text style={styles.daySplitLabel}>
                    {day.label.substring(0, 3).toUpperCase()}
                  </Text>
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
        )}
      </ScrollView>

      <View style={styles.footerActions}>
        <TouchableOpacity style={styles.saveMainButton} onPress={() => setIsSaveModalVisible(true)}>
          <Feather name="check" size={16} color={appTheme.colors.textInverse} />
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
          autoCapitalize="none"
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
