import React from 'react';
import { StatusBar, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { appTheme } from '@/shared/constants/theme';
import { tabContentBottomPadding } from '@/shared/constants/layout';

interface AppScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  backgroundColor?: string;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  barStyle?: 'light-content' | 'dark-content';
}

export function AppScreen({
  children,
  style,
  backgroundColor = appTheme.colors.background,
  edges = ['top'],
  barStyle = 'light-content',
}: AppScreenProps) {
  const insets = useSafeAreaInsets();
  const bottomPadding = insets.bottom + tabContentBottomPadding;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }, style]} edges={edges}>
      <StatusBar barStyle={barStyle} backgroundColor={backgroundColor} />
      <View style={{ flex: 1, paddingBottom: bottomPadding }}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
