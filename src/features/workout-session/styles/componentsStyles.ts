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
  undoZone: {
    width: 44,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  } satisfies ViewStyle,
  completeZone: {
    width: 48,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  } satisfies ViewStyle,
  zonePressable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  } satisfies ViewStyle,
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
    backgroundColor: appTheme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: appTheme.colors.borderStrong,
    borderRadius: 12,
    overflow: 'hidden',
  } satisfies ViewStyle,
  content: {
    flex: 1,
    padding: 14,
  } satisfies ViewStyle,
  label: {
    color: appTheme.colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 8,
  } satisfies TextStyle,
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  } satisfies ViewStyle,
  setsText: {
    color: appTheme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    fontVariant: ['tabular-nums'],
  } satisfies TextStyle,
  percentageText: {
    color: appTheme.colors.textPrimary,
    fontSize: 18,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  } satisfies TextStyle,
  progressTrack: {
    height: 3,
    backgroundColor: appTheme.colors.surfaceDark,
    borderRadius: 2,
    overflow: 'hidden',
  } satisfies ViewStyle,
  progressFill: {
    height: '100%',
    backgroundColor: appTheme.colors.textPrimary,
    borderRadius: 2,
  } satisfies ViewStyle,
  resetZone: {
    width: 52,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: appTheme.colors.border,
  } satisfies ViewStyle,
  resetZonePressed: {
    backgroundColor: 'rgba(229, 229, 234, 0.06)',
  } satisfies ViewStyle,
});
