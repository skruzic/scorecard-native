import { IconSymbol } from "@/components/ui/IconSymbol";
import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#8E8E93",
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#e5e7eb",
          height:
            Platform.OS === "ios"
              ? 80 + insets.bottom
              : Math.max(70, 50 + insets.bottom),
          paddingBottom: Math.max(Platform.OS === "ios" ? insets.bottom : 8, 8),
          paddingTop: 10,
          paddingLeft: Math.max(insets.left, 0),
          paddingRight: Math.max(insets.right, 0),
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Scorecard",
          tabBarIcon: ({ color }) => (
            <IconSymbol name="list.bullet" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Tournaments",
          tabBarIcon: ({ color }) => (
            <IconSymbol name="trophy" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
