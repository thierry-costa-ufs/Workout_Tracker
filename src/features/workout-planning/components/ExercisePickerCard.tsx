import { appTheme } from '@/shared/constants/theme';
import { ExerciseData, PersonalRecord } from '@/types/workout';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';

interface ExercisePickerCardProps {
  item: ExerciseData;
  pr: PersonalRecord | undefined;
  onAdd: () => void;
}

export const ExercisePickerCard = React.memo(function ExercisePickerCard({
  item,
  pr,
  onAdd,
}: ExercisePickerCardProps) {
  const [isAdded, setIsAdded] = useState(false);

  const handlePress = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onAdd();
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
            <Text
              style={[
                styles.metaBadgeText,
                { color: isComposto ? appTheme.colors.accent : appTheme.colors.textSecondary },
              ]}
            >
              {item.mechanic.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.subtleTargetText}>
            {item.equipment.toUpperCase()} • {item.muscleGroup.toUpperCase()}
          </Text>
        </View>
      </View>

      {pr && (
        <View style={styles.prBadge}>
          <Ionicons name="trophy" size={10} color={appTheme.colors.accent} />
          <Text style={styles.prText}>MAX: {String(pr.weight)}KG</Text>
        </View>
      )}

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
    color: appTheme.colors.white,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  metaBadgeContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeComposto: { backgroundColor: 'rgba(255, 159, 10, 0.1)' },
  badgeIsolado: { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
  metaBadgeText: { fontSize: 9, fontWeight: '800' },
  subtleTargetText: { color: appTheme.colors.textMuted, fontSize: 9, fontWeight: '700' },
  prBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 159, 10, 0.1)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  prText: { color: appTheme.colors.accent, fontSize: 9, fontWeight: '800' },
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
    backgroundColor: 'rgba(255, 159, 10, 0.1)',
    borderColor: appTheme.colors.textPrimary,
  },
});
