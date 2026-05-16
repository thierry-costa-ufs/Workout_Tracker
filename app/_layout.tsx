import { WorkoutProvider } from "@/hooks/useWorkouts";
import { DarkTheme, ThemeProvider } from "@react-navigation/native"; // 1. Importe o tema escuro
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar"; // 2. Importe a StatusBar

export default function RootLayout() {
  return (
    <WorkoutProvider>
      <ThemeProvider value={DarkTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="dark" />
      </ThemeProvider>
    </WorkoutProvider>
  );
}
