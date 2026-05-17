import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
            fontSize: 11,
            fontWeight: "900",
            letterSpacing: 1,
            textTransform: "uppercase",
            marginTop: 4,
            marginBottom: Platform.OS === "ios" ? 0 : 4,
          },
          tabBarStyle: {
            backgroundColor: "#1A1A1E",
            borderTopWidth: 1,
            borderTopColor: "#26262B",
            paddingTop: 8,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 6,
            elevation: 0,
            shadowOpacity: 0,
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
            title: "INTERVALO",
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
            title: "ROTINA",
            tabBarIcon: ({ color, focused }) => (
              <Feather
                name="clipboard"
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
