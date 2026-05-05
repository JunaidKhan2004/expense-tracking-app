import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/useAuthStore';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { useEffect, useState } from 'react';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withRepeat, 
  withSequence,
  withDelay,
  Easing,
  FadeIn
} from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Radius, FontSize, FontWeight } from '../constants/theme';
import * as SplashScreen from 'expo-splash-screen';

const { width } = Dimensions.get('window');

export default function Index() {
  const { isAuthenticated, isLoading: storeLoading } = useAuthStore();
  const { colors, isDark } = useTheme();
  const [isReady, setIsReady] = useState(false);

  // Animation shared values
  const logoScale = useSharedValue(0.3);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);
  const pulse = useSharedValue(1);

  useEffect(() => {
    // Hide native splash screen
    SplashScreen.hideAsync();

    // Start animations
    logoScale.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.back(1.5)) });
    logoOpacity.value = withTiming(1, { duration: 800 });
    
    textOpacity.value = withDelay(500, withTiming(1, { duration: 800 }));
    textTranslateY.value = withDelay(500, withTiming(0, { duration: 800, easing: Easing.out(Easing.exp) }));

    pulse.value = withDelay(1200, withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    ));

    // Simulate a minimum splash time for premium feel
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value * pulse.value }],
    opacity: logoOpacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  if (isReady && !storeLoading) {
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
        <Animated.View style={[styles.logoContainer, logoStyle, { backgroundColor: colors.primaryGlow }]}>
          <Image 
            source={isDark ? require('../assets/images/finVaultAppLogoDark.png') : require('../assets/images/finVaultAppLogoLight.png')}
            style={{ width: 80, height: 80, resizeMode: 'contain' }}
          />
        </Animated.View>

        <Animated.View style={[styles.textContainer, textStyle]}>
          <Text style={[styles.title, { color: colors.text }]}>FinVault</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Smart Expense Tracker</Text>
        </Animated.View>
      </View>

      <Animated.View 
        entering={FadeIn.delay(1500)}
        style={styles.footer}
      >
        <View style={[styles.loadingBar, { backgroundColor: colors.borderLight }]}>
          <Animated.View 
            style={[
              styles.loadingProgress, 
              { backgroundColor: colors.primary, width: '40%' }
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
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(64, 138, 113, 0.2)',
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
