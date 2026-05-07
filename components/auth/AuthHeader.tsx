import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View, Dimensions, Platform } from 'react-native';
import { FontSize, FontWeight, Radius, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

const { width } = Dimensions.get('window');

interface AuthHeaderProps {
  title: string;
  subtitle: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({ 
  title, 
  subtitle, 
  icon = "wallet-outline" 
}) => {
  const { colors, isDark } = useTheme();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 40, friction: 8, useNativeDriver: true }),
      Animated.spring(logoScale, { toValue: 1, tension: 35, friction: 6, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: 1, duration: 2500, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <View style={styles.container}>
      {/* Decorative Blur Elements */}
      <View style={[styles.blurCircle, { backgroundColor: colors.primary, top: -20, left: width * 0.1, opacity: 0.15 }]} />
      <View style={[styles.blurCircle, { backgroundColor: colors.secondary, top: 40, right: width * 0.05, opacity: 0.1 }]} />

      <Animated.View 
        style={[
          styles.content, 
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        {/* Animated Logo */}
        <Animated.View style={{ transform: [{ scale: logoScale }, { translateY }] }}>
          <LinearGradient
            colors={colors.gradient.primary}
            style={styles.logoContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={[styles.logoGlass, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.2)' }]}>
               <Ionicons name={icon} size={44} color="#fff" />
            </View>
          </LinearGradient>
          
          {/* Subtle Glow beneath logo */}
          <View style={[styles.logoGlow, { backgroundColor: colors.primary, opacity: 0.4 }]} />
        </Animated.View>

        <View style={styles.textSection}>
          <Text style={[styles.brandName, { color: colors.primary }]}>FINVAULT</Text>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          
          <View style={styles.subtitleContainer}>
            <View style={[styles.line, { backgroundColor: colors.border }]} />
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
            <View style={[styles.line, { backgroundColor: colors.border }]} />
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
    paddingTop: 30,
    marginBottom: Spacing.xl,
    overflow: 'visible',
  },
  blurCircle: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 35,
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
    zIndex: 2,
  },
  logoGlass: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  logoGlow: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    bottom: -10,
    alignSelf: 'center',
    zIndex: 1,
  },
  textSection: {
    alignItems: 'center',
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.xl,
  },
  brandName: {
    fontSize: 12,
    fontWeight: FontWeight.black,
    letterSpacing: 6,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 40,
    fontWeight: FontWeight.black,
    textAlign: 'center',
    letterSpacing: -1,
    lineHeight: 46,
    marginBottom: Spacing.md,
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: Spacing.base,
  },
  line: {
    height: 1,
    flex: 1,
    opacity: 0.5,
  },
  subtitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    textAlign: 'center',
    maxWidth: '75%',
    lineHeight: 22,
  },
});
