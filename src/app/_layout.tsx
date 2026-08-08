import { TemplatesProvider } from '@/context/TemplatesContext';
import { PersonalRecordsProvider } from '@/context/PersonalRecordsContext';
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary';
import { ModalPortalProvider } from '@/shared/context/PortalContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { appTheme } from '@/shared/constants/theme';
import React, { useEffect } from 'react';

// ponytail: no fonts or async bootstrap to await — the splash gate is a controlled hand-off, not a loading gate
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: appTheme.colors.background }}>
      <ModalPortalProvider>
        <TemplatesProvider>
          <PersonalRecordsProvider>
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
          </PersonalRecordsProvider>
        </TemplatesProvider>
      </ModalPortalProvider>
    </GestureHandlerRootView>
  );
}
