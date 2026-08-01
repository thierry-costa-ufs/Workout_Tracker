import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// ponytail: expo-haptics rejects on web — single guarded entry point, drop raw calls
function hapticImpact(style: Haptics.ImpactFeedbackStyle) {
  if (Platform.OS === 'web') return;
  Haptics.impactAsync(style).catch(() => {});
}

export const hapticLight = () => hapticImpact(Haptics.ImpactFeedbackStyle.Light);
export const hapticMedium = () => hapticImpact(Haptics.ImpactFeedbackStyle.Medium);

export function hapticNotify() {
  if (Platform.OS === 'web') return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}
