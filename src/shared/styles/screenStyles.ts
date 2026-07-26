import { appTheme } from "@/shared/constants/theme";
import { StyleSheet } from "react-native";

export const sharedScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appTheme.colors.background,
  },
  pageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: appTheme.colors.surface,
    borderBottomWidth: 1,
    borderColor: appTheme.colors.border,
  },
  pageHeaderCentered: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: appTheme.colors.surface,
    borderBottomWidth: 1,
    borderColor: appTheme.colors.border,
  },
  pageTitleBlock: {
    flex: 1,
  },
  pageSubtitle: {
    color: appTheme.colors.textMuted,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  pageTitle: {
    color: appTheme.colors.textPrimary,
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -1,
    marginBottom: 6,
  },
  sectionHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitleText: {
    color: appTheme.colors.textPrimary,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    marginRight: 10,
  },
  sectionDivider: {
    flex: 1,
    height: 1,
    backgroundColor: appTheme.colors.border,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: appTheme.colors.background,
  },
  emptyStateTitle: {
    color: appTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.5,
    textAlign: "center",
    marginBottom: 8,
  },
  emptyStateText: {
    color: appTheme.colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
  cardSurface: {
    backgroundColor: appTheme.colors.surface,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
  },
  heroCard: {
    marginHorizontal: 24,
    marginTop: 24,
    padding: 24,
    marginBottom: 32,
  },
  compactCard: {
    padding: 16,
    minHeight: 140,
    justifyContent: "space-between",
  },
});
