import { appTheme } from '@/shared/constants/theme';
import { StyleSheet, TextStyle, ViewStyle } from 'react-native';

export const sharedScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appTheme.colors.background,
  } satisfies ViewStyle,
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: appTheme.spacing.xl,
    paddingTop: appTheme.spacing.xl,
    paddingBottom: appTheme.spacing.lg,
    backgroundColor: appTheme.colors.surface,
    borderBottomWidth: 1,
    borderColor: appTheme.colors.border,
  } satisfies ViewStyle,
  pageTitleBlock: {
    flex: 1,
  } satisfies ViewStyle,
  pageSubtitle: {
    color: appTheme.colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 4,
  } satisfies TextStyle,
  pageTitle: {
    color: appTheme.colors.textPrimary,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -1,
    marginBottom: 6,
  } satisfies TextStyle,
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: appTheme.spacing.xl,
    marginBottom: appTheme.spacing.lg,
  } satisfies ViewStyle,
  sectionTitleText: {
    color: appTheme.colors.textPrimary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginRight: 10,
  } satisfies TextStyle,
  sectionDivider: {
    flex: 1,
    height: 1,
    backgroundColor: appTheme.colors.border,
  } satisfies ViewStyle,
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: appTheme.spacing.xl,
    backgroundColor: appTheme.colors.background,
  } satisfies ViewStyle,
  emptyStateTitle: {
    color: appTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 8,
  } satisfies TextStyle,
  emptyStateText: {
    color: appTheme.colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  } satisfies TextStyle,
  cardSurface: {
    backgroundColor: appTheme.colors.surface,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  } satisfies ViewStyle,
  heroCard: {
    marginHorizontal: appTheme.spacing.xl,
    marginTop: appTheme.spacing.xl,
    padding: appTheme.spacing.xl,
    marginBottom: 32,
  } satisfies ViewStyle,
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  } satisfies ViewStyle,
  modalTitle: {
    color: appTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  } satisfies TextStyle,
  modalSubtitle: {
    color: appTheme.colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  } satisfies TextStyle,
  closeModalBtn: {
    padding: 4,
  } satisfies ViewStyle,
});
