import { EXERCISES_LIST } from '@/core/constants/exercises';
import { MuscleFilterType } from '@/core/constants/days';
import { usePersonalRecords } from '@/context/WorkoutContext';
import { PersonalRecord } from '@/types/workout';
import { appTheme } from '@/shared/constants/theme';
import { sharedScreenStyles } from '@/shared/styles/screenStyles';
import { Overlay } from '@/shared/ui/Overlay';
import { ExercisePickerModal } from '@/shared/ui/ExercisePickerModal';
import { MuscleFilterChips } from '@/shared/ui/MuscleFilterChips';
import { SearchBar } from '@/shared/ui/SearchBar';
import { confirmDelete } from '@/shared/utils/confirmDelete';
import { WeightProgressionChart } from '../components/WeightProgressionChart';
import { AppScreen } from '@/core/ui/AppScreen';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { hapticLight, hapticMedium, hapticNotify } from '@/core/utils/haptics';
import { MAX_PER_EXERCISE } from '@/core/utils/capPersonalRecords';
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
  const router = useRouter();
  const { personalRecords, savePR, deletePR } = usePersonalRecords();

  const [modalVisible, setModalVisible] = useState(false);
  const [exerciseModalVisible, setExerciseModalVisible] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [activeGroupKey, setActiveGroupKey] = useState<string | null>(null);

  const [selectedExercise, setSelectedExercise] = useState<(typeof EXERCISES_LIST)[0] | null>(null);
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [muscleFilter, setMuscleFilter] = useState<MuscleFilterType>('Todos');
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const [chartMode, setChartMode] = useState<'weight' | '1rm'>('weight');

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

  const historyAnalytics = useMemo(() => {
    if (sortedHistory.length === 0) return null;
    const avgWeight = sortedHistory.reduce((s, r) => s + r.weight, 0) / sortedHistory.length;
    const avgReps = sortedHistory.reduce((s, r) => s + r.reps, 0) / sortedHistory.length;
    return { avgWeight, avgReps };
  }, [sortedHistory]);

  const currentBestGroup = selectedExercise
    ? groups.find(
        (g) => g.exerciseName.trim().toLowerCase() === selectedExercise.name.trim().toLowerCase(),
      )
    : null;
  const currentBestRecord = currentBestGroup ? getBestRecord(currentBestGroup) : null;

  const adjustReps = (delta: number) => {
    if (delta === 0) return;
    const current = parseInt(reps, 10) || 0;
    const next = current + delta;
    if (next < 1) return;
    setReps(String(next));
    hapticLight();
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

    if (!Number.isInteger(parsedReps) || parsedReps < 1) {
      Alert.alert('Erro', 'Repetições devem ser um número inteiro positivo.');
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
      hapticNotify();
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
    confirmDelete('Remover Recorde', 'Excluir permanentemente este PR?', async () => {
      await deletePR(id);
      hapticMedium();
    });
  };

  return (
    <AppScreen style={styles.container} backgroundColor={appTheme.colors.background}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={appTheme.colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={sharedScreenStyles.pageTitle}>RECORDES</Text>
        </View>
      </View>

      {personalRecords.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="trophy-outline" size={42} color={appTheme.colors.borderStrong} />
          <Text style={styles.emptyStateText}>Nenhuma carga máxima computada.</Text>
        </View>
      ) : (
        <>
          <View style={styles.searchBarContainer}>
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </View>

          <View style={styles.filterContainer}>
            <MuscleFilterChips value={muscleFilter} onChange={setMuscleFilter} />
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
              <Ionicons name="search-outline" size={36} color={appTheme.colors.borderStrong} />
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
                        hapticLight();
                      }}
                    >
                      <View style={styles.groupCardBodyRow}>
                        <View style={styles.flex1}>
                          <Text style={styles.prExerciseName}>{item.exerciseName}</Text>
                          <Text style={styles.prMeta}>
                            {item.muscleGroup.toUpperCase()} • {item.records.length}{' '}
                            {item.records.length === 1 ? 'REGISTRO' : 'REGISTROS'}
                            {item.records.length >= MAX_PER_EXERCISE && ' ⚠️'}
                          </Text>
                        </View>

                        <Ionicons
                          name="chevron-forward"
                          size={16}
                          color={appTheme.colors.borderLight}
                        />
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
        animationType="fade"
        position="center"
      >
        <View style={sharedScreenStyles.modalHeader}>
          <Text style={sharedScreenStyles.modalTitle}>REGISTRAR MARCA</Text>
          <TouchableOpacity
            onPress={() => {
              setModalVisible(false);
              setSelectedExercise(null);
              setWeight('');
              setReps('');
            }}
          >
            <Ionicons name="close" size={22} color={appTheme.colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.prModalBody}>
          <TouchableOpacity
            style={styles.exerciseSelector}
            onPress={() => setExerciseModalVisible(true)}
          >
            <Ionicons
              name="fitness"
              size={18}
              color={selectedExercise ? appTheme.colors.white : appTheme.colors.muted}
            />
            <Text
              style={[
                styles.exerciseSelectorText,
                {
                  color: selectedExercise ? appTheme.colors.white : appTheme.colors.muted,
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

          <View style={styles.prInputGroup}>
            <Text style={styles.prInputLabel}>CARGA TOTAL (KG)</Text>
            <TextInput
              style={styles.prInput}
              placeholder="0.0"
              placeholderTextColor={appTheme.colors.muted}
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
              maxLength={6}
              blurOnSubmit
            />
          </View>

          <View style={styles.prInputGroup}>
            <Text style={styles.prInputLabel}>REPETIÇÕES MÁXIMAS</Text>
            <View style={styles.stepperRow}>
              <TouchableOpacity style={styles.stepperBtn} onPress={() => adjustReps(-REP_STEP)}>
                <Ionicons name="remove" size={16} color={appTheme.colors.textTertiary} />
              </TouchableOpacity>
              <TextInput
                style={styles.stepperInput}
                placeholder="0"
                placeholderTextColor={appTheme.colors.muted}
                keyboardType="numeric"
                value={reps}
                onChangeText={setReps}
                maxLength={4}
                blurOnSubmit
              />
              <TouchableOpacity style={styles.stepperBtn} onPress={() => adjustReps(REP_STEP)}>
                <Ionicons name="add" size={16} color={appTheme.colors.white} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.saveRecordBtn} onPress={handleSavePR}>
            <Text style={styles.saveRecordText}>SALVAR RECORDE</Text>
          </TouchableOpacity>
        </View>
      </Overlay>

      {/* Modal de Biblioteca de Exercícios */}
      <ExercisePickerModal
        visible={exerciseModalVisible}
        onClose={() => setExerciseModalVisible(false)}
        selectedBlock={null}
        getExercisePR={(id) => personalRecords.find((r) => r.exerciseId === id)}
        onAddExercise={(exercise) => {
          setSelectedExercise(exercise);
          setExerciseModalVisible(false);
        }}
      />

      {/* Modal de Histórico do Exercício */}
      <Overlay
        visible={historyModalVisible}
        onClose={() => setHistoryModalVisible(false)}
        animationType="fade"
        style={{ height: '80%' }}
      >
        <View style={sharedScreenStyles.modalHeader}>
          <View>
            <Text style={sharedScreenStyles.modalTitle}>
              {activeGroup ? activeGroup.exerciseName.toUpperCase() : ''}
            </Text>
            <Text style={sharedScreenStyles.modalSubtitle}>
              {activeGroup ? activeGroup.muscleGroup.toUpperCase() : ''}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setHistoryModalVisible(false)}>
            <Ionicons name="close" size={22} color={appTheme.colors.white} />
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
                            : appTheme.colors.white,
                    },
                  ]}
                >
                  {historyEvolution > 0 ? '+' : ''}
                  {historyEvolution.toFixed(1)}
                </Text>
                <Text style={styles.historyStatLabel}>EVOLUÇÃO</Text>
              </View>
            </View>

            {sortedHistory.length > 1 && (
              <View style={styles.chartToggleRow}>
                {(['weight', '1rm'] as const).map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.chartToggleBtn, chartMode === m && styles.chartToggleBtnActive]}
                    onPress={() => setChartMode(m)}
                  >
                    <Text
                      style={[
                        styles.chartToggleText,
                        chartMode === m && styles.chartToggleTextActive,
                      ]}
                    >
                      {m === 'weight' ? 'PESO' : '1RM'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {sortedHistory.length > 1 && (
              <WeightProgressionChart records={sortedHistory} mode={chartMode} />
            )}

            {historyAnalytics && (
              <View style={styles.historyStatsRow}>
                <View style={styles.historyStatBadge}>
                  <Ionicons name="scale-outline" size={13} color={appTheme.colors.textSecondary} />
                  <Text style={styles.historyStatValue}>
                    {historyAnalytics.avgWeight.toFixed(1)}
                  </Text>
                  <Text style={styles.historyStatLabel}>MÉDIA KG</Text>
                </View>
                <View style={styles.historyStatBadge}>
                  <Ionicons name="repeat-outline" size={13} color={appTheme.colors.textSecondary} />
                  <Text style={styles.historyStatValue}>{historyAnalytics.avgReps.toFixed(1)}</Text>
                  <Text style={styles.historyStatLabel}>MÉDIA REPS</Text>
                </View>
              </View>
            )}

            <View style={styles.historyCardList}>
              {[...sortedHistory].reverse().map((item, idx, rev) => {
                const isBest = item.id === historyBest?.id;
                const delta = idx < rev.length - 1 ? item.weight - rev[idx + 1].weight : null;

                return (
                  <View
                    key={item.id}
                    style={[styles.historyCard, isBest && styles.historyCardBest]}
                  >
                    {isBest && <View style={styles.historyCardAccent} />}
                    <View style={styles.flex1}>
                      <Text style={styles.historyCardDate}>{item.date}</Text>
                      {item.timestamp && (
                        <Text style={styles.historyCardDate}>
                          {new Date(item.timestamp).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                      )}
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
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={18} color={appTheme.colors.textInverse} />
        <Text style={styles.fabText}>NOVO PR</Text>
      </TouchableOpacity>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: appTheme.colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: appTheme.spacing.xl,
    paddingTop: appTheme.spacing.xl,
    paddingBottom: appTheme.spacing.lg,
    backgroundColor: appTheme.colors.surface,
    borderBottomWidth: 1,
    borderColor: appTheme.colors.border,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: appTheme.spacing.xl - 4,
    padding: 6,
    top: appTheme.spacing.xl,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 100,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: appTheme.colors.white,
    paddingVertical: 22,
    paddingHorizontal: 26,
    borderRadius: 28,
    gap: 6,
    shadowColor: appTheme.colors.textInverse,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    zIndex: 10,
  },
  fabText: {
    color: appTheme.colors.textInverse,
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 0.5,
  },

  searchBarContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
    marginTop: 12,
  },
  filterContainer: {
    marginBottom: 10,
    paddingHorizontal: 16,
  },
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
    borderColor: appTheme.colors.white,
  },
  sortButtonText: {
    color: appTheme.colors.textTertiary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  sortButtonTextActive: { color: appTheme.colors.accent },
  emptyState: { ...sharedScreenStyles.emptyStateContainer, flex: 0.7, gap: 12 },
  emptyStateText: {
    ...sharedScreenStyles.emptyStateText,
    color: appTheme.colors.muted,
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
    color: appTheme.colors.white,
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
    backgroundColor: appTheme.colors.background,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
    minWidth: 60,
    borderWidth: 1,
    borderColor: appTheme.colors.borderStrong,
  },
  metricValue: {
    color: appTheme.colors.textPrimary,
    fontSize: 12,
    fontWeight: '900',
  },
  metricLabel: {
    color: appTheme.colors.borderLight,
    fontSize: 7,
    fontWeight: '700',
    marginTop: 1,
  },
  deltaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(229, 229, 234, 0.1)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  deltaBadgeText: {
    color: appTheme.colors.textPrimary,
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

  prModalBody: {
    gap: 16,
  },
  exerciseSelector: {
    backgroundColor: appTheme.colors.background,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: appTheme.colors.borderStrong,
  },
  exerciseSelectorText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
  },
  currentBestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(229, 229, 234, 0.08)',
    borderRadius: 10,
    padding: 14,
  },
  currentBestBannerText: {
    color: appTheme.colors.textPrimary,
    fontSize: 10,
    fontWeight: '700',
    flex: 1,
  },
  prInputGroup: {},
  prInputLabel: {
    color: appTheme.colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  prInput: {
    backgroundColor: appTheme.colors.background,
    color: appTheme.colors.white,
    padding: 16,
    borderRadius: 10,
    fontSize: 18,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: appTheme.colors.borderStrong,
    textAlign: 'center',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepperBtn: {
    backgroundColor: appTheme.colors.surfaceElevated,
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: appTheme.colors.borderStrong,
  },
  stepperInput: {
    flex: 1,
    backgroundColor: appTheme.colors.background,
    color: appTheme.colors.white,
    padding: 16,
    borderRadius: 10,
    fontSize: 18,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: appTheme.colors.borderStrong,
    textAlign: 'center',
  },
  saveRecordBtn: {
    backgroundColor: appTheme.colors.white,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  saveRecordText: {
    color: appTheme.colors.textInverse,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  emptyPlansText: {
    color: appTheme.colors.muted,
    paddingVertical: 20,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },

  historyStatsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  historyStatBadge: {
    flex: 1,
    backgroundColor: appTheme.colors.background,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 3,
    borderWidth: 1,
    borderColor: appTheme.colors.borderStrong,
  },
  historyStatValue: {
    color: appTheme.colors.white,
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
    backgroundColor: appTheme.colors.background,
    borderRadius: 10,
    paddingVertical: 10,
    paddingLeft: 14,
    paddingRight: 10,
    borderWidth: 1,
    borderColor: appTheme.colors.borderStrong,
    overflow: 'hidden',
  },
  historyCardBest: {
    borderColor: 'rgba(229, 229, 234, 0.3)',
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
    color: appTheme.colors.white,
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
  historyContent: { paddingBottom: 16 },
  historyCardList: { gap: 6 },
  trophyMargin: { marginLeft: 6 },
  chartToggleRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  chartToggleBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: appTheme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: appTheme.colors.borderStrong,
  },
  chartToggleBtnActive: {
    borderColor: appTheme.colors.white,
  },
  chartToggleText: {
    color: appTheme.colors.textTertiary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  chartToggleTextActive: { color: appTheme.colors.accent },
});
