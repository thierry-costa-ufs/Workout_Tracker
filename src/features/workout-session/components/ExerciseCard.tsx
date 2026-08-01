import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PersonalRecord } from '@/types/workout';
import { appTheme } from '@/shared/constants/theme';
import { SetSegment } from './SetSegment';
import { exerciseCardStyles as styles } from '../styles/componentsStyles';
import { PrBadge } from '@/shared/ui/PrBadge';

interface ExerciseCardProps {
  exercise: {
    id: string;
    name: string;
    muscleGroup?: string;
    sets?: number;
  };
  progressSets: boolean[];
  onPress: () => void;
  onUndo: () => void;
  personalRecord?: PersonalRecord;
}

export const ExerciseCard = React.memo(function ExerciseCard({
  exercise,
  progressSets,
  onPress,
  onUndo,
  personalRecord,
}: ExerciseCardProps) {
  return (
    <View style={styles.card}>
      <LinearGradient
        colors={[appTheme.colors.zoneGradStart, appTheme.colors.zoneGradEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.undoZone}
      >
        <Pressable hitSlop={12} onPress={onUndo} style={styles.zonePressable}>
          <Ionicons name="remove" size={20} color={appTheme.colors.textSecondary} />
        </Pressable>
      </LinearGradient>

      <Pressable hitSlop={8} onPress={onUndo} style={styles.leftZone}>
        <View style={styles.headerRow}>
          <Text style={styles.name}>{exercise.name}</Text>
          <Text style={styles.meta}>{exercise.muscleGroup || ''}</Text>
        </View>

        <View style={styles.setsRow}>
          {progressSets.map((isCompleted, index) => (
            <SetSegment key={`${exercise.id}-${index}`} isCompleted={isCompleted} />
          ))}
        </View>

        {personalRecord && (
          <View style={styles.prRow}>
            <PrBadge
              weight={personalRecord.weight}
              reps={personalRecord.reps}
              date={personalRecord.date}
              size="md"
            />
          </View>
        )}
      </Pressable>

      <LinearGradient
        colors={[appTheme.colors.zoneGradEnd, appTheme.colors.zoneGradStart]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.completeZone}
      >
        <Pressable hitSlop={12} onPress={onPress} style={styles.zonePressable}>
          <Ionicons name="add" size={22} color={appTheme.colors.textSecondary} />
        </Pressable>
      </LinearGradient>
    </View>
  );
});
