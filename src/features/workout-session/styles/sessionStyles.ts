import { appTheme } from '@/shared/constants/theme';
import { StyleSheet } from 'react-native';

export const sessionStyles = StyleSheet.create({
  daySubtitle: {
    color: appTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  contentBody: {
    flex: 1,
    backgroundColor: appTheme.colors.background,
    margin: 15,
    marginTop: 18,
  },
});
