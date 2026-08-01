import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { appTheme } from '@/shared/constants/theme';

interface PrBadgeProps {
  weight: number;
  reps?: number;
  date?: string;
  size?: 'sm' | 'md';
}

export function PrBadge({ weight, reps, date, size = 'sm' }: PrBadgeProps) {
  const md = size === 'md';
  return (
    <>
      <View style={[s.badge, md && s.badgeMd]}>
        <Ionicons name="trophy" size={md ? 11 : 9} color={appTheme.colors.accent} />
        <Text style={[s.text, md && s.textMd]}>
          {reps != null ? `${weight} KG × ${reps}` : `MAX: ${weight}KG`}
        </Text>
      </View>
      {date ? <Text style={s.date}>{date}</Text> : null}
    </>
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
  badgeMd: {
    gap: 4,
  },
  text: {
    color: appTheme.colors.textPrimary,
    fontSize: 9,
    fontWeight: '800',
  },
  textMd: {
    fontSize: 11,
  },
  date: {
    color: appTheme.colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
});
