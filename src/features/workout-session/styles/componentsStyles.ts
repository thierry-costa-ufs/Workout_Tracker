import { appTheme } from '@/shared/constants/theme';
import { StyleSheet, TextStyle, ViewStyle } from 'react-native';

export const exerciseCardStyles = StyleSheet.create({
  card: {
    backgroundColor: appTheme.colors.surfaceElevated,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: appTheme.colors.borderStrong,
  } satisfies ViewStyle,
  leftZone: {
    flex: 1,
    padding: 14,
  } satisfies ViewStyle,
  rightZone: {
    width: 48,
  } satisfies ViewStyle,
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  } satisfies ViewStyle,
  name: {
    color: appTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  } satisfies TextStyle,
  meta: {
    color: appTheme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  } satisfies TextStyle,
  setsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  } satisfies ViewStyle,
  prRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: appTheme.colors.border,
  } satisfies ViewStyle,
  prBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: appTheme.colors.prBadgeBackground,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  } satisfies ViewStyle,
  prBadgeText: {
    color: appTheme.colors.textPrimary,
    fontSize: 11,
    fontWeight: '800',
  } satisfies TextStyle,
  prDate: {
    color: appTheme.colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  } satisfies TextStyle,
});

export const setSegmentStyles = StyleSheet.create({
  segment: {
    width: 12,
    height: 12,
    borderRadius: 8,
    backgroundColor: appTheme.colors.gray,
    marginRight: 6,
  } satisfies ViewStyle,
  segmentCompleted: {
    backgroundColor: appTheme.colors.textPrimary,
  } satisfies ViewStyle,
});

export const telemetryStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingBottom: 12,
  } satisfies ViewStyle,
  text: {
    color: appTheme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  } satisfies TextStyle,
});
