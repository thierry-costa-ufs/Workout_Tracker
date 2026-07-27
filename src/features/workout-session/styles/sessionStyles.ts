import { appTheme } from '@/shared/constants/theme';
import { StyleSheet, TextStyle, ViewStyle } from 'react-native';

export const sessionStyles = StyleSheet.create({
  daySubtitle: {
    color: appTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  } satisfies TextStyle,
  contentBody: {
    flex: 1,
    backgroundColor: appTheme.colors.background,
    margin: 15,
    marginTop: 18,
  } satisfies ViewStyle,
});
