import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { appTheme } from '@/shared/constants/theme';
import { telemetryStyles as styles } from '../styles/componentsStyles';

interface TelemetryDisplayProps {
  completed: number;
  total: number;
  percentage: number;
  onReset: () => void;
}

export const TelemetryDisplay = React.memo(function TelemetryDisplay({
  completed,
  total,
  percentage,
  onReset,
}: TelemetryDisplayProps) {
  const pct = Math.round(percentage);
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.label}>PROGRESSO DA SESSÃO</Text>
        <View style={styles.statsRow}>
          <Text style={styles.setsText}>
            {completed}/{total} SETS
          </Text>
          <Text style={styles.percentageText}>{pct}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${pct}%` }]} />
        </View>
      </View>

      <Pressable
        onPress={onReset}
        hitSlop={8}
        style={({ pressed }) => [styles.resetZone, pressed && styles.resetZonePressed]}
      >
        {({ pressed }) => (
          <Ionicons
            name="refresh-outline"
            size={22}
            color={pressed ? appTheme.colors.textPrimary : appTheme.colors.textSecondary}
          />
        )}
      </Pressable>
    </View>
  );
});
