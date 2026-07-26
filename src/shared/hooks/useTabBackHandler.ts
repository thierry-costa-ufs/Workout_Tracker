import { useEffect, useRef } from 'react';
import { BackHandler, Platform, ToastAndroid } from 'react-native';
import { usePathname, useRouter } from 'expo-router';

export function useTabBackHandler() {
  const router = useRouter();
  const pathname = usePathname();
  const lastPress = useRef(0);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      const isHomeTab = pathname === '/(tabs)' || pathname.endsWith('/index');

      if (isHomeTab) {
        const now = Date.now();
        if (now - lastPress.current < 2000) {
          BackHandler.exitApp();
        } else {
          lastPress.current = now;
          ToastAndroid.show('Pressione novamente para sair', ToastAndroid.SHORT);
        }
      } else {
        router.navigate('/(tabs)' as never);
      }

      return true;
    });

    return () => backHandler.remove();
  }, [pathname, router]);
}
