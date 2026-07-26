import React from 'react';
import { Text, View } from 'react-native';
import { telemetryStyles as styles } from '../styles/componentsStyles';

interface TelemetryDisplayProps {
  completed: number;
  total: number;
  percentage: number;
}

export const TelemetryDisplay = React.memo(function TelemetryDisplay({
  completed,
  total,
  percentage,
}: TelemetryDisplayProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {completed}/{total} sets
      </Text>
      <Text style={styles.text}>{Math.round(percentage)}%</Text>
    </View>
  );
});
