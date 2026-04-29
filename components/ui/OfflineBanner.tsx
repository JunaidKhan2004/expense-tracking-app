import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { Spacing, FontSize, Radius, Shadow } from '../../constants/theme';

export const OfflineBanner = () => {
  const [isOffline, setIsOffline] = useState(false);
  const { colors } = useTheme();
  const slideAnim = React.useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const offline = state.isConnected === false;
      setIsOffline(offline);

      Animated.spring(slideAnim, {
        toValue: offline ? (Platform.OS === 'ios' ? 50 : 30) : -100,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    });

    return () => unsubscribe();
  }, []);

  if (!isOffline && slideAnim === new Animated.Value(-100)) return null;

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          backgroundColor: colors.danger,
          transform: [{ translateY: slideAnim }],
          ...Shadow.md
        }
      ]}
    >
      <View style={styles.content}>
        <Ionicons name="cloud-offline" size={20} color="#fff" />
        <View style={styles.textContainer}>
          <Text style={styles.title}>You're Offline</Text>
          <Text style={styles.subtitle}>Data will sync when you're back online</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: Spacing.base,
    right: Spacing.base,
    zIndex: 9999,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#fff',
    fontSize: FontSize.sm,
    fontWeight: '800',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    fontWeight: '500',
  },
});
