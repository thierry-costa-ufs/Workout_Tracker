import { Ionicons } from '@expo/vector-icons';
import { usePathname } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import { TabView, type SceneRendererProps } from 'react-native-tab-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabNavigationProvider, useSwitchTab } from '@/shared/context/TabNavigationContext';
import {
  TAB_BAR_BOTTOM_OFFSET,
  TAB_BAR_HEIGHT,
  TAB_BAR_SIDE_PADDING,
  TAB_BAR_BORDER_RADIUS,
} from '@/shared/constants/layout';
import DashboardScreen from '@/features/workout-dashboard/screens/DashboardScreen';
import SessionScreen from '@/features/workout-session/screens/SessionScreen';
import TimerScreen from '@/features/workout-timer/screens/TimerScreen';
import PlanningScreen from '@/features/workout-planning/screens/PlanningScreen';
import { appTheme } from '@/shared/constants/theme';

const EXIT_CONFIRM_WINDOW_MS = 2000;

type Route = {
  key: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const TAB_ROUTES: Route[] = [
  { key: 'index', title: 'INÍCIO', icon: 'home' },
  { key: 'session', title: 'SESSÃO', icon: 'flash' },
  { key: 'timer', title: 'PAUSA', icon: 'time' },
  { key: 'planning', title: 'PLANO', icon: 'document-text' },
];

const SCENES: Record<string, React.FC> = {
  index: DashboardScreen,
  session: SessionScreen,
  timer: TimerScreen,
  planning: PlanningScreen,
};

function getIndexFromPathname(pathname: string): number {
  if (pathname === '/(tabs)' || pathname === '/(tabs)/') return 0;
  const idx = TAB_ROUTES.findIndex((r) => pathname === `/(tabs)/${r.key}`);
  return idx >= 0 ? idx : 0;
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const [index, setIndex] = useState(() => getIndexFromPathname(pathname));

  const handleIndexChange = (newIndex: number) => {
    setIndex(newIndex);
  };

  const renderScene = ({ route }: SceneRendererProps & { route: { key: string } }) => {
    const Screen = SCENES[route.key];
    return Screen ? <Screen /> : null;
  };

  return (
    <TabNavigationProvider value={handleIndexChange}>
      <View style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={appTheme.colors.textInverse} />

        <TabView
          navigationState={{ index, routes: TAB_ROUTES }}
          renderScene={renderScene}
          onIndexChange={handleIndexChange}
          renderTabBar={() => null}
          lazy
          renderLazyPlaceholder={() => null}
          pagerStyle={styles.pagerBg}
          style={styles.pager}
        />

        <View style={[styles.tabBar, { bottom: insets.bottom + TAB_BAR_BOTTOM_OFFSET }]}>
          {TAB_ROUTES.map((route) => {
            const isActive = TAB_ROUTES[index]?.key === route.key;
            return (
              <Pressable
                key={route.key}
                style={styles.tabItem}
                onPress={() => handleIndexChange(TAB_ROUTES.indexOf(route))}
              >
                <Ionicons
                  name={route.icon}
                  size={isActive ? 19 : 18}
                  color={isActive ? appTheme.colors.textPrimary : appTheme.colors.borderLight}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    { color: isActive ? appTheme.colors.textPrimary : appTheme.colors.borderLight },
                  ]}
                >
                  {route.title}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <TabBackHandler currentIndex={index} />
    </TabNavigationProvider>
  );
}

function TabBackHandler({ currentIndex }: { currentIndex: number }) {
  const switchTab = useSwitchTab();
  const pathname = usePathname();
  const lastPress = useRef(0);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!pathname.startsWith('/(tabs)')) return false;

      if (currentIndex === 0) {
        const now = Date.now();
        if (now - lastPress.current < EXIT_CONFIRM_WINDOW_MS) {
          BackHandler.exitApp();
        } else {
          lastPress.current = now;
          ToastAndroid.show('Pressione novamente para sair', ToastAndroid.SHORT);
        }
      } else {
        switchTab(0);
      }

      return true;
    });

    return () => backHandler.remove();
  }, [currentIndex, switchTab, pathname]);

  return null;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: appTheme.colors.background,
  },
  pager: {
    flex: 1,
  },
  pagerBg: {
    backgroundColor: appTheme.colors.background,
  },
  tabBar: {
    position: 'absolute',
    left: TAB_BAR_SIDE_PADDING,
    right: TAB_BAR_SIDE_PADDING,
    height: TAB_BAR_HEIGHT,
    borderRadius: TAB_BAR_BORDER_RADIUS,
    backgroundColor: appTheme.colors.surfaceElevated,
    borderTopWidth: 1,
    borderWidth: 2,
    borderColor: appTheme.colors.border,
    overflow: 'hidden',
    zIndex: 1,
    elevation: 8,
    shadowColor: appTheme.colors.textInverse,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 4,
  },
});
