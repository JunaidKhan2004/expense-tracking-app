import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect, router, Tabs } from "expo-router";
import React, { useEffect } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Shadow } from "../../constants/theme";
import { useTheme } from "../../hooks/useTheme";
import { useAuthStore } from "../../store/useAuthStore";

function TabBarIcon({
  name,
  focused,
  color,
  label,
}: {
  name: string;
  focused: boolean;
  color: string;
  label: string;
}) {
  const { colors } = useTheme();
  const transition = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    transition.value = withSpring(focused ? 1 : 0, { damping: 15 });
  }, [focused]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(transition.value, [0, 1], [1, 1.1]) },
      { translateY: interpolate(transition.value, [0, 1], [0, -2]) },
    ],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: transition.value,
    transform: [{ translateY: interpolate(transition.value, [0, 1], [10, 0]) }],
    height: interpolate(transition.value, [0, 1], [0, 16]),
  }));

  return (
    <View style={styles.tabItem}>
      <Animated.View style={iconStyle}>
        <Ionicons
          name={focused ? (name as any) : (`${name}-outline` as any)}
          size={20}
          color={focused ? colors.primary : colors.textMuted}
        />
      </Animated.View>
      <Animated.View style={[styles.labelWrapper, labelStyle]}>
        <Text style={[styles.tabLabel, { color: colors.primary }]}>
          {label}
        </Text>
      </Animated.View>
    </View>
  );
}

function FloatingAddButton() {
  const { colors } = useTheme();

  return (
    <View style={styles.fabContainer}>
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push("/transaction/add");
        }}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={colors.gradient.primary}
          style={[styles.fab, { shadowColor: colors.primary }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.fabInner}>
            <Ionicons name="add" size={32} color="#fff" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

export default function TabsLayout() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const { colors, isDark } = useTheme();

  if (!isLoading && !isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 0,
          height: Platform.OS === "ios" ? 95 : 75,
          paddingBottom: Platform.OS === "ios" ? 35 : 15,
          paddingTop: 12,
          ...Shadow.lg,
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: (props) => (
            <TabBarIcon name="home" label="Home" {...props} />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          tabBarIcon: (props) => (
            <TabBarIcon name="receipt" label="History" {...props} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          tabBarIcon: () => <FloatingAddButton />,
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          tabBarIcon: (props) => (
            <TabBarIcon name="stats-chart" label="Stats" {...props} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: (props) => (
            <TabBarIcon name="person" label="Profile" {...props} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 60,
  },
  labelWrapper: {
    overflow: "hidden",
    marginTop: 4,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "800",
    // textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fabContainer: {
    top: -25,
    height: 70,
    width: 70,
    justifyContent: "center",
    alignItems: "center",
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    padding: 3,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  fabInner: {
    flex: 1,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
});
