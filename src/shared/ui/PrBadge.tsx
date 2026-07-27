import { Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native';
import { prBadgeStyles as styles } from '@/shared/styles/prBadgeStyles';
import { appTheme } from '@/shared/constants/theme';

interface PrBadgeProps {
  weight: number;
  variant?: 'default' | 'orange';
}

export function PrBadge({ weight, variant = 'default' }: PrBadgeProps) {
  return (
    <View style={styles.badge}>
      <Ionicons name="trophy" size={10} color={appTheme.colors.accent} />
      <Text style={styles.text}>MAX: {weight}KG</Text>
    </View>
  );
}
