import { appTheme } from '@/shared/constants/theme';
import { ExerciseData, PersonalRecord } from '@/types/workout';
import { PrBadge } from '@/shared/ui/PrBadge';
import { hapticNotify } from '@/core/utils/haptics';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ExercisePickerCardProps {
  item: ExerciseData;
  pr: PersonalRecord | undefined;
  onAdd: (exercise: ExerciseData) => void;
  isCreateAction: boolean;
  onCreateCustom: () => void;
}

export const ExercisePickerCard = React.memo(function ExercisePickerCard({
  item,
  pr,
  onAdd,
  isCreateAction = false,
  onCreateCustom,
}: ExercisePickerCardProps) {
  const [isAdded, setIsAdded] = useState(false);

  if (isCreateAction) {
    return (
      <TouchableOpacity
        style={[styles.card, { borderStyle: 'dashed', borderColor: appTheme.colors.border }]}
        activeOpacity={0.7}
        onPress={onCreateCustom}
      >
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={styles.title}>Criar exercício personalizado</Text>
          <Text style={styles.subtleTargetText}>ADICIONAR NOVO</Text>
        </View>
      </TouchableOpacity>
    );
  }

  if (!item) return null;

  const handlePress = () => {
    hapticNotify();
    onAdd(item);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 600);
  };

  const isComposto = item.mechanic === 'Composto';

  return (
    <TouchableOpacity
      style={[styles.card, isAdded && styles.cardFeedbackActive]}
      activeOpacity={0.7}
      onPress={handlePress}
    >
      <View style={{ flex: 1, marginRight: 10 }}>
        <Text style={styles.title}>{item.name}</Text>
        <View style={styles.metaBadgeContainer}>
          <View style={[styles.metaBadge, isComposto ? styles.badgeComposto : styles.badgeIsolado]}>
            <Text style={styles.metaBadgeText}>{item.mechanic.toUpperCase()}</Text>
          </View>
          <Text style={styles.subtleTargetText}>
            {item.equipment.toUpperCase()} • {item.muscleGroup.toUpperCase()}
          </Text>
        </View>
      </View>

      {pr && <PrBadge weight={pr.weight} />}

      <View style={[styles.addIconCircle, isAdded && styles.addIconCircleSuccess]}>
        <Ionicons
          name={isAdded ? 'checkmark' : 'add'}
          size={16}
          color={isAdded ? appTheme.colors.textPrimary : appTheme.colors.white}
        />
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: appTheme.colors.background,
    borderWidth: 1,
    borderColor: appTheme.colors.borderStrong,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    color: appTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  metaBadgeContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeComposto: { backgroundColor: appTheme.colors.prBadgeBackground },
  badgeIsolado: { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
  metaBadgeText: { color: appTheme.colors.textSecondary, fontSize: 9, fontWeight: '800' },
  subtleTargetText: { color: appTheme.colors.textMuted, fontSize: 9, fontWeight: '700' },
  addIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: appTheme.colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: appTheme.colors.borderStrong,
    marginLeft: 8,
  },
  cardFeedbackActive: { borderColor: appTheme.colors.textPrimary },
  addIconCircleSuccess: {
    backgroundColor: appTheme.colors.prBadgeBackground,
    borderColor: appTheme.colors.textPrimary,
  },
});
