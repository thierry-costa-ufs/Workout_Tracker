import { appTheme } from '@/shared/constants/theme';
import { Dimensions, StyleSheet, TextStyle, ViewStyle } from 'react-native';

const { width } = Dimensions.get('window');

export const dashboardStyles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  } satisfies ViewStyle,
  mainHeroCard: {
    backgroundColor: appTheme.colors.surface,
  } satisfies ViewStyle,
  heroHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  } satisfies ViewStyle,
  heroTag: {
    color: appTheme.colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  } satisfies TextStyle,
  heroCardTitle: {
    color: appTheme.colors.textPrimary,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 8,
  } satisfies TextStyle,
  heroCardSubtitle: {
    color: appTheme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 20,
  } satisfies TextStyle,
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: appTheme.colors.textPrimary,
    paddingVertical: appTheme.spacing.sm,
    borderRadius: 8,
    gap: 8,
  } satisfies ViewStyle,
  primaryButtonText: {
    color: appTheme.colors.textInverse,
    fontWeight: '900',
    letterSpacing: 1,
  } satisfies TextStyle,
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: appTheme.spacing.xl,
    gap: appTheme.spacing.sm,
  } satisfies ViewStyle,
  featureCard: {
    width: (width - appTheme.spacing.xl * 2 - appTheme.spacing.sm) / 2,
    backgroundColor: appTheme.colors.surfaceElevated,
    overflow: 'hidden',
    borderRadius: 4,
  } satisfies ViewStyle,
  cardHeader: {
    position: 'relative',
    overflow: 'hidden',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: appTheme.spacing.lg,
    paddingVertical: appTheme.spacing.sm,
    borderRadius: 4,
  } satisfies ViewStyle,
  cardBody: {
    paddingTop: 8,
    padding: appTheme.spacing.sm,
    height: 148,
  } satisfies ViewStyle,
  cardIndex: {
    color: appTheme.colors.textPrimary,
    fontSize: 10,
    fontWeight: '800',
  } satisfies TextStyle,
  cardTitle: {
    color: appTheme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: appTheme.spacing.sm,
  } satisfies TextStyle,
  cardDescription: {
    color: appTheme.colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  } satisfies TextStyle,
  footerBanner: {
    marginHorizontal: appTheme.spacing.xl,
    marginTop: appTheme.spacing.xl,
    paddingVertical: appTheme.spacing.lg,
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: appTheme.colors.border,
  } satisfies ViewStyle,
  footerText: {
    color: appTheme.colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  } satisfies TextStyle,
  menuBtn: {
    padding: 8,
    alignSelf: 'center',
  } satisfies ViewStyle,
});
