import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PersonalRecord } from '@/types/workout';
import { appTheme } from '@/shared/constants/theme';
import { SetSegment } from './SetSegment';
import { exerciseCardStyles as styles } from '../styles/componentsStyles';

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
            <View style={styles.prBadge}>
              <Ionicons name="trophy" size={10} color={appTheme.colors.accent} />
              <Text style={styles.prBadgeText}>
                {personalRecord.weight} KG × {personalRecord.reps}
              </Text>
            </View>
            <Text style={styles.prDate}>{personalRecord.date}</Text>
          </View>
        )}
      </Pressable>

      <Pressable hitSlop={8} onPress={onPress} style={styles.rightZone} />
    </View>
  );
});
