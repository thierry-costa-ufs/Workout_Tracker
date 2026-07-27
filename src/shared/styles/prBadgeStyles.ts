import { appTheme } from '@/shared/constants/theme';
import { StyleSheet, TextStyle, ViewStyle } from 'react-native';

export const prBadgeStyles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: appTheme.colors.prBadgeBackground,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  } satisfies ViewStyle,
  text: {
    color: appTheme.colors.textPrimary,
    fontSize: 9,
    fontWeight: '800',
  } satisfies TextStyle,
});
