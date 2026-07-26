import { appTheme } from '@/shared/constants/theme';
import { StyleSheet } from 'react-native';

export const exerciseCardStyles = StyleSheet.create({
  card: {
    backgroundColor: appTheme.colors.surfaceElevated,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: appTheme.colors.borderStrong,
  },
  leftZone: {
    flex: 1,
    padding: 14,
  },
  rightZone: {
    width: 48,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    color: appTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  meta: {
    color: appTheme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  setsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  prRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: appTheme.colors.border,
  },
  prBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 159, 10, 0.1)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  prBadgeText: {
    color: appTheme.colors.textPrimary,
    fontSize: 11,
    fontWeight: '800',
  },
  prDate: {
    color: appTheme.colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
});

export const setSegmentStyles = StyleSheet.create({
  segment: {
    width: 12,
    height: 12,
    borderRadius: 8,
    backgroundColor: appTheme.colors.gray,
    marginRight: 6,
  },
  segmentCompleted: {
    backgroundColor: appTheme.colors.textPrimary,
  },
});

export const telemetryStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingBottom: 12,
  },
  text: {
    color: appTheme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
});
