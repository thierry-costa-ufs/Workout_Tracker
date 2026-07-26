import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import React from "react";
import { StatusBar, StyleSheet, View, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {appTheme} from "@/shared/constants/theme";

interface AppScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  backgroundColor?: string;
  edges?: ("top" | "bottom" | "left" | "right")[];
  barStyle?: "light-content" | "dark-content";
}

export function AppScreen({
  children,
  style,
  backgroundColor = "#121214",
  edges = ["top"],
  barStyle = "light-content",
}: AppScreenProps) {
  const tabBarHeight = useBottomTabBarHeight();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor }, style]}
      edges={edges}
    >
      <StatusBar barStyle={barStyle} backgroundColor={backgroundColor} />
      <View style={{ flex: 1, paddingBottom: tabBarHeight + 30}}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
