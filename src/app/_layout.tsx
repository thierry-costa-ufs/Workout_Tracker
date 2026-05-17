import { WorkoutProvider } from "@/context/WorkoutContext";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <WorkoutProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </WorkoutProvider>
  );
}
