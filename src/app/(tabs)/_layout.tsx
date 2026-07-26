import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import { Platform, StatusBar, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { appTheme } from '@/shared/constants/theme';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={appTheme.colors.textInverse} />

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: appTheme.colors.textPrimary,
          tabBarInactiveTintColor: appTheme.colors.borderLight,
          tabBarShowLabel: true,
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '900',
            letterSpacing: 0.8,
            textTransform: 'uppercase',
          },
          tabBarItemStyle: { paddingTop: 12 },

          tabBarBackground: () =>
            Platform.OS === 'ios' ? (
              <BlurView tint="dark" intensity={80} style={StyleSheet.absoluteFill} />
            ) : null,

          tabBarStyle: {
            position: 'absolute',
            left: 16,
            right: 16,
            bottom: insets.bottom + 4,
            height: 64,
            borderRadius: 24,
            backgroundColor: appTheme.colors.surfaceElevated,
            borderTopWidth: 1,
            borderWidth: 2,
            borderColor: appTheme.colors.border,
            overflow: 'hidden',
            elevation: 8,
            shadowColor: appTheme.colors.textInverse,
            shadowOpacity: 0.4,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'INÍCIO',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name="home"
                size={focused ? 19 : 18}
                color={focused ? appTheme.colors.textPrimary : color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="session"
          options={{
            title: 'SESSÃO',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name="flash"
                size={focused ? 19 : 18}
                color={focused ? appTheme.colors.textPrimary : color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="timer"
          options={{
            title: 'PAUSA',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name="time"
                size={focused ? 19 : 18}
                color={focused ? appTheme.colors.textPrimary : color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="planning"
          options={{
            title: 'PLANO',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name="document-text"
                size={focused ? 19 : 18}
                color={focused ? appTheme.colors.textPrimary : color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="record"
          options={{
            title: 'MARCO',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name="ribbon"
                size={focused ? 19 : 18}
                color={focused ? appTheme.colors.textPrimary : color}
              />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
