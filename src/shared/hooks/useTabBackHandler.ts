import { useEffect, useRef } from 'react';
import { BackHandler, Platform, ToastAndroid } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { useSwitchTab } from '@/shared/context/TabNavigationContext';

export function useTabBackHandler() {
  const pathname = usePathname();
  const router = useRouter();
  const switchTab = useSwitchTab();
  const lastPress = useRef(0);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      const isTabScreen = pathname.startsWith('/(tabs)');
      const isHomeTab =
        isTabScreen &&
        (pathname === '/(tabs)' || pathname === '/(tabs)/' || pathname.endsWith('/index'));

      if (isHomeTab) {
        const now = Date.now();
        if (now - lastPress.current < 2000) {
          BackHandler.exitApp();
        } else {
          lastPress.current = now;
          ToastAndroid.show('Pressione novamente para sair', ToastAndroid.SHORT);
        }
      } else if (isTabScreen) {
        switchTab(0);
      } else {
        router.back();
      }

      return true;
    });

    return () => backHandler.remove();
  }, [pathname, switchTab, router]);
}
