import { LinearGradient } from 'expo-linear-gradient';
import { Redirect } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { FontSize, FontWeight } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';

const { width } = Dimensions.get('window');

export default function Index() {
  const { isAuthenticated } = useAuthStore();
  const { isHydrating } = useAppStore();
  const { colors, isDark } = useTheme();
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  // Animation shared values
  const logoScale = useSharedValue(0.3);
  const logoOpacity = useSharedValue(0);
  const loadingProgress = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    SplashScreen.hideAsync();

    logoScale.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.back(1.5)) });
    logoOpacity.value = withTiming(1, { duration: 800 });

    // Animate bar to 85% while hydrating, then complete to 100% when done
    loadingProgress.value = withTiming(0.85, { duration: 2000 });

    pulse.value = withDelay(1200, withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    ));

    const timer = setTimeout(() => setMinTimeElapsed(true), 1800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isHydrating) {
      loadingProgress.value = withTiming(1, { duration: 300 });
    }
  }, [isHydrating]);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value * pulse.value }],
    opacity: logoOpacity.value,
  }));

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${loadingProgress.value * 100}%` as any,
  }));

  // Wait for both minimum animation time AND store hydration to complete
  if (minTimeElapsed && !isHydrating) {
    return isAuthenticated ? <Redirect href="/(tabs)" /> : <Redirect href="/(auth)/login" />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <LinearGradient
        colors={isDark ? ['#091413', '#122625'] : ['#F0F8F6', '#E1F2ED']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        <Animated.View style={[styles.logoContainer, logoStyle]}>
          <Image
            source={require('../assets/images/AppLogo.png')}
            style={styles.logoImage}
          />
        </Animated.View>
        {/* 
        <Animated.View style={[styles.textContainer, textStyle]}>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Smart Expense Tracker</Text>
        </Animated.View> */}
      </View>

      <Animated.View
        entering={FadeIn.delay(1500)}
        style={styles.footer}
      >
        <View style={[styles.loadingBar, { backgroundColor: colors.borderLight }]}>
          <Animated.View
            style={[
              styles.loadingProgress,
              { backgroundColor: colors.primary },
              progressBarStyle,
            ]}
          />
        </View>
        <Text style={[styles.footerText, { color: colors.textMuted }]}>
          Secure & Private
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 140,
    height: 140,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    overflow: 'hidden',
  },
  logoImage: {
    width: 140,
    height: 140,
    resizeMode: 'contain',
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: FontSize.display,
    fontWeight: FontWeight.bold,
    letterSpacing: 1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    opacity: 0.8,
  },
  footer: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
    width: '100%',
  },
  loadingBar: {
    width: width * 0.4,
    height: 4,
    borderRadius: 2,
    marginBottom: 16,
    overflow: 'hidden',
  },
  loadingProgress: {
    height: '100%',
    borderRadius: 2,
  },
  footerText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
});
