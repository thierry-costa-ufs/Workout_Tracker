import { WorkoutProvider } from '@/context/WorkoutContext';
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary';
import { ModalPortalProvider } from '@/shared/context/PortalContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { appTheme } from '@/shared/constants/theme';
import React from 'react';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: appTheme.colors.background }}>
      <ModalPortalProvider>
        <WorkoutProvider>
          <ErrorBoundary>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: appTheme.colors.background },
              }}
            >
              <Stack.Screen name="(tabs)" options={{ animation: 'none' }} />
              <Stack.Screen name="record" options={{ animation: 'none' }} />
            </Stack>
          </ErrorBoundary>
        </WorkoutProvider>
      </ModalPortalProvider>
    </GestureHandlerRootView>
  );
}
