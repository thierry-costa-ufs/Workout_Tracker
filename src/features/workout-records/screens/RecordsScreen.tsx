import { EXERCISES_LIST } from '@/core/constants/exercises';
import { MUSCLE_FILTERS } from '@/core/constants/days';
import { usePersonalRecords } from '@/context/WorkoutContext';
import { PersonalRecord } from '@/types/workout';
import { appTheme } from '@/shared/constants/theme';
import { sharedScreenStyles } from '@/shared/styles/screenStyles';
import { Overlay } from '@/shared/ui/Overlay';
import { useTabBackHandler } from '@/shared/hooks/useTabBackHandler';
import { WeightProgressionChart } from '../components/WeightProgressionChart';
import { AppScreen } from '@/core/ui/AppScreen';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const REP_STEP = 1;

type SortMode = 'recent' | 'heaviest' | 'az';

interface RecordGroup {
  key: string;
  exerciseName: string;
  muscleGroup: string;
  records: PersonalRecord[];
}

function groupRecordsByExercise(records: PersonalRecord[]): RecordGroup[] {
  const map = new Map<string, RecordGroup>();

  records.forEach((record) => {
    const key = String(record.exerciseName).trim().toLowerCase();
    if (!map.has(key)) {
      map.set(key, {
        key,
        exerciseName: record.exerciseName,
        muscleGroup: record.muscleGroup,
        records: [],
      });
    }
    map.get(key)!.records.push(record);
  });

  return Array.from(map.values());
}

function getBestRecord(group: RecordGroup) {
  return group.records.reduce((best, r) => (r.weight > best.weight ? r : best), group.records[0]);
}

function getSecondBestRecord(group: RecordGroup) {
  const sorted = [...group.records].sort((a, b) => b.weight - a.weight);
  return sorted[1] ?? null;
}

export default function RecordsScreen() {
  useTabBackHandler();
  const { personalRecords, savePR, deletePR } = usePersonalRecords();

  const [modalVisible, setModalVisible] = useState(false);
  const [exerciseModalVisible, setExerciseModalVisible] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [activeGroupKey, setActiveGroupKey] = useState<string | null>(null);

  const [selectedExercise, setSelectedExercise] = useState<(typeof EXERCISES_LIST)[0] | null>(null);
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [muscleFilter, setMuscleFilter] = useState('Todos');
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const [exerciseMuscleFilter, setExerciseMuscleFilter] = useState('Todos');

  const groups = useMemo(() => groupRecordsByExercise(personalRecords), [personalRecords]);

  const filteredGroups = useMemo(() => {
    let list = groups;

    if (muscleFilter !== 'Todos') {
      list = list.filter((g) => g.muscleGroup === muscleFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      list = list.filter((g) => g.exerciseName.toLowerCase().includes(query));
    }

    if (sortMode === 'heaviest') {
      list = [...list].sort((a, b) => getBestRecord(b).weight - getBestRecord(a).weight);
    } else if (sortMode === 'az') {
      list = [...list].sort((a, b) => a.exerciseName.localeCompare(b.exerciseName));
    }

    return list;
  }, [groups, muscleFilter, searchQuery, sortMode]);

  const activeGroup = groups.find((g) => g.key === activeGroupKey) || null;

  const sortedHistory = useMemo(() => {
    if (!activeGroup) return [];
    return [...activeGroup.records].sort((a, b) => {
      const parseD = (d: string) => {
        const p = d.split('/');
        return p.length === 3
          ? new Date(Number(p[2]), Number(p[1]) - 1, Number(p[0])).getTime()
          : new Date(d).getTime();
      };
      return parseD(a.date) - parseD(b.date);
    });
  }, [activeGroup]);

  const historyBest = useMemo(
    () => (activeGroup ? getBestRecord(activeGroup) : null),
    [activeGroup],
  );

  const historyEvolution = useMemo(() => {
    if (sortedHistory.length < 2) return 0;
    return sortedHistory[sortedHistory.length - 1].weight - sortedHistory[0].weight;
  }, [sortedHistory]);

  const currentBestGroup = selectedExercise
    ? groups.find(
        (g) => g.exerciseName.trim().toLowerCase() === selectedExercise.name.trim().toLowerCase(),
      )
    : null;
  const currentBestRecord = currentBestGroup ? getBestRecord(currentBestGroup) : null;

  const adjustReps = (delta: number) => {
    const current = parseFloat(reps.replace(',', '.')) || 0;
    if (current + delta < 0) delta = 0;
    const next = current + delta;
    setReps(String(Number(next.toFixed(2))));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSavePR = async () => {
    if (!selectedExercise || !weight || !reps) {
      Alert.alert('Erro', 'Preencha todos os campos técnicos.');
      return;
    }

    const parsedWeight = parseFloat(weight.replace(',', '.'));
    const parsedReps = parseInt(reps, 10);

    if (isNaN(parsedWeight) || isNaN(parsedReps)) {
      Alert.alert('Erro', 'Insira valores numéricos válidos.');
      return;
    }

    const isImprovement = !!currentBestRecord && parsedWeight > currentBestRecord.weight;
    const improvementDelta = currentBestRecord ? parsedWeight - currentBestRecord.weight : 0;

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
      setWeight('');
      setReps('');

      if (isImprovement) {
        Alert.alert('Novo recorde!', `+${improvementDelta.toFixed(1)} kg sobre a marca anterior.`);
      }
    } catch {
      Alert.alert('Erro', 'Falha ao salvar o recorde no sistema central.');
    }
  };

  const handleDeletePR = (id: string) => {
    Alert.alert('Remover Recorde', 'Excluir permanentemente este PR?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          await deletePR(id);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        },
      },
    ]);
  };

  return (
    <AppScreen style={styles.container} backgroundColor={appTheme.colors.background}>
      <View style={sharedScreenStyles.pageHeaderCentered}>
        <View style={sharedScreenStyles.pageTitleBlock}>
          <Text style={sharedScreenStyles.pageTitle}>SEUS RECORDES</Text>
          <Text style={sharedScreenStyles.pageSubtitle}>Mapeamento de Força</Text>
        </View>
        <TouchableOpacity style={styles.addPresetButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={14} color="#000" />
          <Text style={styles.addPresetText}>NOVO PR</Text>
        </TouchableOpacity>
      </View>

      {personalRecords.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="trophy-outline" size={42} color="#2C2C2E" />
          <Text style={styles.emptyStateText}>Nenhuma carga máxima computada.</Text>
        </View>
      ) : (
        <>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={16} color={appTheme.colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar exercício..."
              placeholderTextColor="#444"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={16} color="#444" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.filterContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
            >
              {MUSCLE_FILTERS.map((item) => {
                const isSelected = muscleFilter === item;
                return (
                  <TouchableOpacity
                    key={item}
                    onPress={() => setMuscleFilter(item)}
                    style={[styles.filterChip, isSelected && styles.filterChipActive]}
                  >
                    <Text
                      style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}
                    >
                      {item.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.sortRow}>
            {(
              [
                { id: 'recent', label: 'RECENTES' },
                { id: 'heaviest', label: 'MAIS PESADOS' },
                { id: 'az', label: 'A-Z' },
              ] as { id: SortMode; label: string }[]
            ).map((option) => {
              const isActive = sortMode === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[styles.sortButton, isActive && styles.sortButtonActive]}
                  onPress={() => setSortMode(option.id)}
                >
                  <Text style={[styles.sortButtonText, isActive && styles.sortButtonTextActive]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {filteredGroups.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={36} color="#2C2C2E" />
              <Text style={styles.emptyStateText}>Nenhum exercício encontrado.</Text>
            </View>
          ) : (
            <FlatList
              data={filteredGroups}
              keyExtractor={(item) => item.key}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const best = getBestRecord(item);
                const secondBest = getSecondBestRecord(item);
                const delta = secondBest ? best.weight - secondBest.weight : 0;

                return (
                  <View style={[sharedScreenStyles.cardSurface, styles.groupCard]}>
                    <TouchableOpacity
                      style={styles.groupCardBody}
                      activeOpacity={0.7}
                      onPress={() => {
                        setActiveGroupKey(item.key);
                        setHistoryModalVisible(true);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                    >
                      <View style={styles.groupCardBodyRow}>
                        <View style={styles.flex1}>
                          <Text style={styles.prExerciseName}>{item.exerciseName}</Text>
                          <Text style={styles.prMeta}>
                            {item.muscleGroup.toUpperCase()} • {item.records.length}{' '}
                            {item.records.length === 1 ? 'REGISTRO' : 'REGISTROS'}
                          </Text>
                        </View>

                        <Ionicons name="chevron-forward" size={16} color="#545456" />
                      </View>
                    </TouchableOpacity>

                    <View style={styles.groupMetricsRow}>
                      <View style={styles.metricBadge}>
                        <Text style={styles.metricValue}>{best.weight} KG</Text>
                        <Text style={styles.metricLabel}>MELHOR CARGA</Text>
                      </View>
                      <View style={styles.metricBadge}>
                        <Text style={styles.metricValue}>x{best.reps}</Text>
                        <Text style={styles.metricLabel}>REPS</Text>
                      </View>
                      {delta > 0 && (
                        <View style={styles.deltaBadge}>
                          <Ionicons name="trending-up" size={11} color={appTheme.colors.accent} />
                          <Text style={styles.deltaBadgeText}>+{delta.toFixed(1)}</Text>
                        </View>
                      )}
                      <TouchableOpacity
                        style={styles.deleteButton}
                        activeOpacity={0.7}
                        onPress={() => handleDeletePR(best.id)}
                      >
                        <Ionicons name="trash-outline" size={14} color={appTheme.colors.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }}
            />
          )}
        </>
      )}

      {/* Modal de Registro de Marca */}
      <Overlay
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setSelectedExercise(null);
          setWeight('');
          setReps('');
        }}
        animationType="slide"
      >
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>REGISTRAR MARCA</Text>
          <TouchableOpacity
            onPress={() => {
              setModalVisible(false);
              setSelectedExercise(null);
              setWeight('');
              setReps('');
            }}
          >
            <Ionicons name="close" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.selectSelectable}
          onPress={() => setExerciseModalVisible(true)}
        >
          <Text
            style={[
              styles.selectedExerciseText,
              {
                color: selectedExercise ? '#FFF' : '#444',
              },
            ]}
          >
            {selectedExercise ? selectedExercise.name.toUpperCase() : 'SELECIONE O EXERCÍCIO'}
          </Text>
          <Ionicons name="chevron-down" size={16} color={appTheme.colors.textSecondary} />
        </TouchableOpacity>

        {currentBestRecord && (
          <View style={styles.currentBestBanner}>
            <Ionicons name="trophy" size={13} color={appTheme.colors.accent} />
            <Text style={styles.currentBestBannerText}>
              {`RECORDE ATUAL: ${currentBestRecord.weight} KG x ${currentBestRecord.reps} — supere isso`}
            </Text>
          </View>
        )}

        <View style={styles.rowInputs}>
          <View style={styles.flex13}>
            <Text style={styles.inputLabel}>CARGA TOTAL (KG)</Text>
            <TextInput
              style={[styles.technicalInput, styles.flex1]}
              placeholder="0.0"
              placeholderTextColor="#444"
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
            />
          </View>
          <View style={styles.flex1}>
            <Text style={styles.inputLabel}>REPETIÇÕES MÁX.</Text>
            <View style={styles.weightStepperRow}>
              <TouchableOpacity
                style={styles.weightStepperButton}
                onPress={() => adjustReps(-REP_STEP)}
              >
                <Ionicons name="remove" size={14} color="#A2A2A7" />
              </TouchableOpacity>
              <TextInput
                style={styles.technicalInput}
                placeholder="0"
                placeholderTextColor="#444"
                keyboardType="numeric"
                value={reps}
                onChangeText={setReps}
              />
              <TouchableOpacity
                style={styles.weightStepperButton}
                onPress={() => adjustReps(REP_STEP)}
              >
                <Ionicons name="add" size={14} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.confirmSaveButton} onPress={handleSavePR}>
          <Text style={styles.confirmSaveText}>SALVAR RECORDE</Text>
        </TouchableOpacity>
      </Overlay>

      {/* Modal de Biblioteca de Exercícios */}
      <Overlay
        visible={exerciseModalVisible}
        onClose={() => {
          setExerciseModalVisible(false);
          setExerciseMuscleFilter('Todos');
        }}
        animationType="slide"
        style={{ height: '85%' }}
      >
        <View style={styles.modalHeader}>
          <View>
            <Text style={styles.modalTitle}>BIBLIOTECA</Text>
            <Text style={styles.modalSubtitle}>SELECIONE O EXERCÍCIO PARA REGISTRAR</Text>
          </View>
          <TouchableOpacity
            style={styles.closeModalButton}
            onPress={() => {
              setExerciseModalVisible(false);
              setExerciseMuscleFilter('Todos');
            }}
          >
            <Ionicons name="close" size={20} color="#000" />
          </TouchableOpacity>
        </View>

        <View style={styles.exerciseFilterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {MUSCLE_FILTERS.map((muscle) => {
              const isSelected = exerciseMuscleFilter === muscle;
              return (
                <TouchableOpacity
                  key={muscle}
                  onPress={() => setExerciseMuscleFilter(muscle)}
                  style={[styles.exerciseFilterChip, isSelected && styles.exerciseFilterChipActive]}
                >
                  <Text
                    style={[
                      styles.exerciseFilterChipText,
                      isSelected && styles.exerciseFilterChipTextActive,
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
              exerciseMuscleFilter === 'Todos' || exercise.muscleGroup === exerciseMuscleFilter,
          )}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isComposto = item.mechanic === 'Composto';
            return (
              <TouchableOpacity
                style={styles.exerciseSelectionRow}
                onPress={() => {
                  setSelectedExercise(item);
                  setExerciseModalVisible(false);
                  setExerciseMuscleFilter('Todos');
                }}
              >
                <View style={styles.flex1}>
                  <Text style={styles.exerciseSelectionText}>{item.name}</Text>

                  <View style={styles.exerciseMetaRow}>
                    <View
                      style={[
                        styles.mechanicBadge,
                        isComposto ? styles.mechanicBadgeComposto : styles.mechanicBadgeIsolado,
                      ]}
                    >
                      <Text
                        style={[
                          styles.mechanicBadgeText,
                          {
                            color: isComposto
                              ? appTheme.colors.accent
                              : appTheme.colors.textSecondary,
                          },
                        ]}
                      >
                        {item.mechanic.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.exerciseSelectionSub}>
                      {item.equipment.toUpperCase()} • {item.muscleGroup.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#545456" />
              </TouchableOpacity>
            );
          }}
        />
      </Overlay>

      {/* Modal de Histórico do Exercício */}
      <Overlay
        visible={historyModalVisible}
        onClose={() => setHistoryModalVisible(false)}
        animationType="fade"
        style={{ height: '80%' }}
      >
        <View style={styles.modalHeader}>
          <View>
            <Text style={styles.modalTitle}>
              {activeGroup ? activeGroup.exerciseName.toUpperCase() : ''}
            </Text>
            <Text style={styles.modalSubtitle}>
              {activeGroup ? activeGroup.muscleGroup.toUpperCase() : ''}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setHistoryModalVisible(false)}>
            <Ionicons name="close" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>

        {!activeGroup || activeGroup.records.length === 0 ? (
          <Text style={styles.emptyPlansText}>Nenhum registro restante para este exercício.</Text>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.historyContent}
          >
            <View style={styles.historyStatsRow}>
              <View style={styles.historyStatBadge}>
                <Ionicons name="trophy" size={13} color={appTheme.colors.accent} />
                <Text style={styles.historyStatValue}>
                  {historyBest ? `${historyBest.weight}` : '—'}
                </Text>
                <Text style={styles.historyStatLabel}>RECORDE</Text>
              </View>
              <View style={styles.historyStatBadge}>
                <Ionicons name="layers-outline" size={13} color={appTheme.colors.textSecondary} />
                <Text style={styles.historyStatValue}>{activeGroup.records.length}</Text>
                <Text style={styles.historyStatLabel}>REGISTROS</Text>
              </View>
              <View style={styles.historyStatBadge}>
                <Ionicons
                  name="trending-up"
                  size={13}
                  color={
                    historyEvolution > 0
                      ? appTheme.colors.success
                      : historyEvolution < 0
                        ? appTheme.colors.danger
                        : appTheme.colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.historyStatValue,
                    {
                      color:
                        historyEvolution > 0
                          ? appTheme.colors.success
                          : historyEvolution < 0
                            ? appTheme.colors.danger
                            : '#FFF',
                    },
                  ]}
                >
                  {historyEvolution > 0 ? '+' : ''}
                  {historyEvolution.toFixed(1)}
                </Text>
                <Text style={styles.historyStatLabel}>EVOLUÇÃO</Text>
              </View>
            </View>

            {sortedHistory.length > 1 && <WeightProgressionChart records={sortedHistory} />}

            <View style={styles.historyCardList}>
              {[...sortedHistory].reverse().map((item, idx) => {
                const isBest = item.id === historyBest?.id;
                const reversedIdx = idx;
                const prevRecord =
                  reversedIdx < sortedHistory.length - 1
                    ? sortedHistory[sortedHistory.length - 1 - reversedIdx - 1]
                    : null;
                const delta = prevRecord ? item.weight - prevRecord.weight : null;

                return (
                  <View
                    key={item.id}
                    style={[styles.historyCard, isBest && styles.historyCardBest]}
                  >
                    {isBest && <View style={styles.historyCardAccent} />}
                    <View style={styles.flex1}>
                      <Text style={styles.historyCardDate}>{item.date}</Text>
                      <View style={styles.historyCardWeightRow}>
                        <Text style={styles.historyCardWeight}>{item.weight}</Text>
                        <Text style={styles.historyCardUnit}>KG</Text>
                        <Text style={styles.historyCardReps}>
                          × {item.reps} {item.reps === 1 ? 'rep' : 'reps'}
                        </Text>
                        {isBest && (
                          <Ionicons
                            name="trophy"
                            size={11}
                            color={appTheme.colors.accent}
                            style={styles.trophyMargin}
                          />
                        )}
                      </View>
                    </View>
                    {delta !== null && delta !== 0 && (
                      <View
                        style={[
                          styles.historyDeltaBadge,
                          {
                            backgroundColor:
                              delta > 0 ? 'rgba(52, 199, 89, 0.12)' : 'rgba(255, 69, 58, 0.12)',
                          },
                        ]}
                      >
                        <Ionicons
                          name={delta > 0 ? 'arrow-up' : 'arrow-down'}
                          size={9}
                          color={delta > 0 ? appTheme.colors.success : appTheme.colors.danger}
                        />
                        <Text
                          style={[
                            styles.historyDeltaText,
                            {
                              color: delta > 0 ? appTheme.colors.success : appTheme.colors.danger,
                            },
                          ]}
                        >
                          {delta > 0 ? '+' : ''}
                          {delta.toFixed(1)}
                        </Text>
                      </View>
                    )}
                    <TouchableOpacity
                      style={styles.historyDeleteBtn}
                      onPress={() => handleDeletePR(item.id)}
                    >
                      <Ionicons name="trash-outline" size={13} color={appTheme.colors.danger} />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        )}
      </Overlay>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: appTheme.colors.background },
  header: {
    ...sharedScreenStyles.pageHeader,
    paddingHorizontal: 16,
    paddingVertical: 20,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  headerSubtitle: {
    color: appTheme.colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  addPresetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 4,
  },
  addPresetText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 0.5,
  },

  statsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 14,
  },
  statChip: {
    flex: 1,
    backgroundColor: appTheme.colors.surfaceElevated,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: appTheme.colors.borderStrong,
  },
  statValue: { color: '#FFF', fontSize: 16, fontWeight: '900' },
  statLabel: {
    color: '#636366',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 1,
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: appTheme.colors.surfaceElevated,
    marginHorizontal: 16,
    marginBottom: 12,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: appTheme.colors.borderStrong,
  },
  searchInput: { flex: 1, color: '#FFF', fontSize: 13, fontWeight: '600' },
  filterContainer: {
    marginBottom: 10,
  },
  filterRow: { paddingHorizontal: 16, gap: 6 },
  filterChip: {
    flexShrink: 0,
    height: 36,
    backgroundColor: '#121212',
    paddingHorizontal: 14,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: appTheme.colors.borderStrong,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChipActive: {
    backgroundColor: appTheme.colors.textPrimary,
    borderColor: appTheme.colors.textPrimary,
  },
  filterChipText: {
    color: appTheme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  filterChipTextActive: { color: '#000' },
  sortRow: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  sortButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: appTheme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: appTheme.colors.borderStrong,
  },
  sortButtonActive: {
    backgroundColor: 'rgba(255, 159, 10, 0.12)',
    borderColor: appTheme.colors.accent,
  },
  sortButtonText: {
    color: '#A2A2A7',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  sortButtonTextActive: { color: appTheme.colors.accent },
  emptyState: { ...sharedScreenStyles.emptyStateContainer, flex: 0.7, gap: 12 },
  emptyStateText: {
    ...sharedScreenStyles.emptyStateText,
    color: '#444',
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: { paddingHorizontal: 16, paddingBottom: 40 },

  groupCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  groupCardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  prExerciseName: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  prMeta: {
    color: appTheme.colors.textSecondary,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  groupMetricsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metricBadge: {
    backgroundColor: '#121212',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
    minWidth: 60,
    borderWidth: 1,
    borderColor: appTheme.colors.borderStrong,
  },
  metricValue: {
    color: appTheme.colors.accent,
    fontSize: 12,
    fontWeight: '900',
  },
  metricLabel: {
    color: '#545456',
    fontSize: 7,
    fontWeight: '700',
    marginTop: 1,
  },
  deltaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255, 159, 10, 0.1)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  deltaBadgeText: {
    color: appTheme.colors.accent,
    fontSize: 10,
    fontWeight: '800',
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 69, 58, 0.12)',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginLeft: 'auto',
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  modalSubtitle: {
    color: appTheme.colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  selectSelectable: {
    width: '100%',
    backgroundColor: '#121212',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: appTheme.colors.borderStrong,
    marginBottom: 12,
  },
  currentBestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 159, 10, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  currentBestBannerText: {
    color: appTheme.colors.accent,
    fontSize: 10,
    fontWeight: '700',
    flex: 1,
  },
  rowInputs: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  inputLabel: {
    color: appTheme.colors.textSecondary,
    fontSize: 9,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  technicalInput: {
    backgroundColor: '#121212',
    color: '#FFF',
    padding: 14,
    borderRadius: 8,
    fontSize: 16,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: appTheme.colors.borderStrong,
    textAlign: 'center',
  },
  weightStepperRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  weightStepperButton: {
    backgroundColor: appTheme.colors.surfaceElevated,
    width: 36,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: appTheme.colors.borderStrong,
  },
  repPickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 20,
  },
  repPickChip: {
    width: 38,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: appTheme.colors.borderStrong,
  },
  repPickChipActive: {
    backgroundColor: '#FFF',
    borderColor: '#FFF',
  },
  repPickChipText: { color: '#A2A2A7', fontSize: 12, fontWeight: '800' },
  repPickChipTextActive: { color: '#000' },
  confirmSaveButton: {
    backgroundColor: '#FFF',
    width: '100%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmSaveText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  exerciseSelectionRow: {
    backgroundColor: '#121212',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: appTheme.colors.borderStrong,
  },
  exerciseSelectionText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  exerciseMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  mechanicBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  mechanicBadgeComposto: { backgroundColor: 'rgba(255, 159, 10, 0.1)' },
  mechanicBadgeIsolado: { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
  mechanicBadgeText: { fontSize: 9, fontWeight: '800' },
  exerciseSelectionSub: {
    color: appTheme.colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
  },
  closeModalButton: {
    backgroundColor: '#FFF',
    padding: 6,
    borderRadius: 8,
  },
  exerciseFilterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  exerciseFilterChip: {
    flexShrink: 0,
    backgroundColor: '#121212',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 6,
    borderWidth: 1,
    borderColor: appTheme.colors.borderStrong,
    justifyContent: 'center',
  },
  exerciseFilterChipActive: {
    backgroundColor: appTheme.colors.textPrimary,
    borderColor: appTheme.colors.textPrimary,
  },
  exerciseFilterChipText: {
    color: appTheme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  exerciseFilterChipTextActive: { color: '#000' },
  emptyPlansText: {
    color: '#444',
    paddingVertical: 20,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121212',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: appTheme.colors.borderStrong,
  },
  historyRowWeight: { color: '#FFF', fontSize: 13, fontWeight: '800' },
  historyRowMeta: {
    color: appTheme.colors.textMuted,
    fontSize: 9,
    fontWeight: '600',
    marginTop: 3,
    letterSpacing: 0.3,
  },

  historyStatsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  historyStatBadge: {
    flex: 1,
    backgroundColor: '#121212',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 3,
    borderWidth: 1,
    borderColor: appTheme.colors.borderStrong,
  },
  historyStatValue: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
  },
  historyStatLabel: {
    color: appTheme.colors.textMuted,
    fontSize: 7,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121212',
    borderRadius: 10,
    paddingVertical: 10,
    paddingLeft: 14,
    paddingRight: 10,
    borderWidth: 1,
    borderColor: appTheme.colors.borderStrong,
    overflow: 'hidden',
  },
  historyCardBest: {
    borderColor: 'rgba(255, 159, 10, 0.3)',
  },
  historyCardAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: appTheme.colors.accent,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  historyCardDate: {
    color: appTheme.colors.textMuted,
    fontSize: 8,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  historyCardWeightRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  historyCardWeight: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '900',
  },
  historyCardUnit: {
    color: appTheme.colors.textSecondary,
    fontSize: 9,
    fontWeight: '700',
  },
  historyCardReps: {
    color: appTheme.colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  historyDeltaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginRight: 8,
  },
  historyDeltaText: {
    fontSize: 9,
    fontWeight: '800',
  },
  historyDeleteBtn: {
    padding: 7,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 69, 58, 0.1)',
  },
  groupCardBodyRow: { flex: 1, flexDirection: 'row' },
  flex1: { flex: 1 },
  flex13: { flex: 1.3 },
  historyContent: { paddingBottom: 16 },
  historyCardList: { gap: 6 },
  trophyMargin: { marginLeft: 6 },
  selectedExerciseText: { fontWeight: '600' },
});
