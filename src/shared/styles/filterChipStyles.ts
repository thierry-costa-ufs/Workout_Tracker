import { appTheme } from '@/shared/constants/theme';
import { StyleSheet, TextStyle, ViewStyle } from 'react-native';

export const filterChipStyles = StyleSheet.create({
  chip: {
    flexShrink: 0,
    height: 36,
    backgroundColor: appTheme.colors.background,
    paddingHorizontal: 14,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: appTheme.colors.borderStrong,
    justifyContent: 'center',
    alignItems: 'center',
  } satisfies ViewStyle,
  chipActive: {
    borderColor: appTheme.colors.textPrimary,
  } satisfies ViewStyle,
  chipText: {
    color: appTheme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  } satisfies TextStyle,
  chipTextActive: {
    color: appTheme.colors.textPrimary,
  } satisfies TextStyle,
});
