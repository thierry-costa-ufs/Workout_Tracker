import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { Platform, StatusBar, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {appTheme} from "@/shared/constants/theme";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#E5E5EA",
          tabBarInactiveTintColor: "#545456",
          tabBarShowLabel: true,
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: "900",
            letterSpacing: 0.8,
            textTransform: "uppercase",
          },
          tabBarItemStyle: { paddingTop: 12 },

          tabBarBackground: () =>
            Platform.OS === "ios" ? (
              <BlurView
                tint="dark"
                intensity={80}
                style={StyleSheet.absoluteFill}
              />
            ) : null,

          tabBarStyle: {
            position: "absolute",
            left: 16,
            right: 16,
            bottom: insets.bottom + 4,
            height: 64,
            borderRadius: 24,
            backgroundColor: appTheme.colors.surfaceElevated,
            borderTopWidth: 1,
            borderWidth: 2,
            borderColor: "#26262B",
            overflow: "hidden",
            elevation: 8,
            shadowColor: "#000",
            shadowOpacity: 0.4,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "INÍCIO",
            tabBarIcon: ({ color, focused }) => (
              <Feather
                name="home"
                size={focused ? 19 : 18}
                color={focused ? "#E5E5EA" : color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="session"
          options={{
            title: "SESSÃO",
            tabBarIcon: ({ color, focused }) => (
              <Feather
                name="zap"
                size={focused ? 19 : 18}
                color={focused ? "#E5E5EA" : color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="timer"
          options={{
            title: "PAUSA",
            tabBarIcon: ({ color, focused }) => (
              <Feather
                name="clock"
                size={focused ? 19 : 18}
                color={focused ? "#E5E5EA" : color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="planning"
          options={{
            title: "PLANO",
            tabBarIcon: ({ color, focused }) => (
              <Feather
                name="clipboard"
                size={focused ? 19 : 18}
                color={focused ? "#E5E5EA" : color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="record"
          options={{
            title: "MARCO",
            tabBarIcon: ({ color, focused }) => (
              <Feather
                name="target"
                size={focused ? 19 : 18}
                color={focused ? "#E5E5EA" : color}
              />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
