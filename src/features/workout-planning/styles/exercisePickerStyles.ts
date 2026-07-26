import { appTheme } from '@/shared/constants/theme';
import { StyleSheet } from 'react-native';

export const exercisePickerStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121212',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: appTheme.colors.borderStrong,
  },
  info: {
    flex: 1,
  },
  name: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 3,
  },
  meta: {
    color: appTheme.colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  prBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 159, 10, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
    marginLeft: 8,
  },
  prText: {
    color: appTheme.colors.accent,
    fontSize: 9,
    fontWeight: '700',
  },
  addButton: {
    backgroundColor: appTheme.colors.surfaceElevated,
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: appTheme.colors.borderStrong,
  },
});
