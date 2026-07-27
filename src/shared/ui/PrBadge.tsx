import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { appTheme } from '@/shared/constants/theme';

interface PrBadgeProps {
  weight: number;
}

export function PrBadge({ weight }: PrBadgeProps) {
  return (
    <View style={s.badge}>
      <Ionicons name="trophy" size={10} color={appTheme.colors.accent} />
      <Text style={s.text}>MAX: {weight}KG</Text>
    </View>
  );
}

const s = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: appTheme.colors.prBadgeBackground,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  text: {
    color: appTheme.colors.textPrimary,
    fontSize: 9,
    fontWeight: '800',
  },
});
