import { WorkoutProvider } from '@/context/WorkoutContext';
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary';
import { Stack } from 'expo-router';
import React from 'react';

export default function RootLayout() {
  return (
    <WorkoutProvider>
      <ErrorBoundary>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
      </ErrorBoundary>
    </WorkoutProvider>
  );
}
