import { appTheme } from '@/shared/constants/theme';
import { Feather } from '@expo/vector-icons';
import { Portal } from '@/shared/ui/Portal';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { BackHandler, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useCallback } from 'react';

interface SidebarItem {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  route: string;
}

const MENU_ITEMS: SidebarItem[] = [{ label: 'RECORDES', icon: 'bar-chart-2', route: '/record' }];

interface SidebarDrawerProps {
  visible: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
  currentRoute?: string;
}

export function SidebarDrawer({ visible, onClose, onNavigate, currentRoute }: SidebarDrawerProps) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const SIDEBAR_WIDTH = windowWidth * 0.72;
  const translateX = useSharedValue(SIDEBAR_WIDTH);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (!visible) translateX.value = SIDEBAR_WIDTH;
  }, [windowWidth, SIDEBAR_WIDTH, translateX, visible]);

  useEffect(() => {
    if (visible) {
      translateX.value = withTiming(0, { duration: 250, easing: Easing.out(Easing.cubic) });
      backdropOpacity.value = withTiming(1, { duration: 250 });
    } else {
      translateX.value = withTiming(SIDEBAR_WIDTH, {
        duration: 220,
        easing: Easing.in(Easing.cubic),
      });
      backdropOpacity.value = withTiming(0, { duration: 220 });
    }
  }, [visible, translateX, backdropOpacity, SIDEBAR_WIDTH]);

  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (visible) {
        onClose();
        return true;
      }
      return false;
    });
    return () => handler.remove();
  }, [visible, onClose]);

  const handleItemPress = useCallback(
    (route: string) => {
      onClose();
      onNavigate(route);
    },
    [onClose, onNavigate],
  );

  const panelGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .onUpdate((e) => {
      if (e.translationX > 0) {
        translateX.value = Math.min(SIDEBAR_WIDTH, e.translationX);
        backdropOpacity.value = Math.max(0, 1 - e.translationX / SIDEBAR_WIDTH);
      }
    })
    .onEnd((e) => {
      if (e.translationX > SIDEBAR_WIDTH * 0.3) {
        runOnJS(onClose)();
      } else {
        translateX.value = withTiming(0, { duration: 250, easing: Easing.out(Easing.cubic) });
        backdropOpacity.value = withTiming(1, { duration: 250 });
      }
    });

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  return (
    <Portal>
      {/* Backdrop */}
      <Animated.View
        style={[styles.backdrop, backdropStyle]}
        pointerEvents={visible ? 'auto' : 'none'}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Panel */}
      <GestureDetector gesture={panelGesture}>
        <Animated.View
          style={[styles.panel, { top: insets.top, width: SIDEBAR_WIDTH }, panelStyle]}
        >
          <View style={styles.panelHeader}>
            <Feather name="activity" size={20} color={appTheme.colors.textPrimary} />
            <Text style={styles.panelBrand}>PRÁXIS</Text>
          </View>

          <View style={styles.menuList}>
            {MENU_ITEMS.map((item) => {
              const isActive = currentRoute === item.route;
              return (
                <Pressable
                  key={item.route}
                  style={[styles.menuItem, isActive && styles.menuItemActive]}
                  onPress={() => handleItemPress(item.route)}
                >
                  <Feather
                    name={item.icon}
                    size={18}
                    color={isActive ? appTheme.colors.textPrimary : appTheme.colors.textSecondary}
                  />
                  <Text style={[styles.menuItemText, isActive && styles.menuItemTextActive]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>
      </GestureDetector>
    </Portal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 9998,
    elevation: 10,
  },
  panel: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: appTheme.colors.surface,
    borderLeftWidth: 1,
    borderColor: appTheme.colors.border,
    zIndex: 9999,
    elevation: 10,
    justifyContent: 'space-between',
    paddingTop: 16,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderColor: appTheme.colors.border,
  },
  panelBrand: {
    color: appTheme.colors.textPrimary,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  menuList: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  menuItemActive: {
    backgroundColor: appTheme.colors.surfaceElevated,
  },
  menuItemText: {
    color: appTheme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  menuItemTextActive: {
    color: appTheme.colors.textPrimary,
  },
});
