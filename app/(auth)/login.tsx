import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '../../store/useAuthStore';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Radius, FontSize, Spacing } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const { colors, isDark } = useTheme();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 8, useNativeDriver: true }),
      Animated.spring(logoScale, { toValue: 1, tension: 80, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  const validate = () => {
    let valid = true;
    setEmailError('');
    setPasswordError('');
    clearError();
    if (!email.trim()) { setEmailError('Email is required'); valid = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailError('Enter a valid email'); valid = false; }
    if (!password) { setPasswordError('Password is required'); valid = false; }
    else if (password.length < 6) { setPasswordError('At least 6 characters'); valid = false; }
    return valid;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    const success = await login(email.trim(), password);
    if (success) router.replace('/(tabs)');
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Background orbs */}
      <View style={[styles.orb1, { backgroundColor: colors.primaryGlow }]} />
      <View style={[styles.orb2, { backgroundColor: colors.secondaryGlow }]} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kav}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <Animated.View style={[styles.logoSection, { opacity: fadeAnim, transform: [{ scale: logoScale }] }]}>
            <LinearGradient colors={colors.gradient.primary} style={styles.logoBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Ionicons name="wallet" size={36} color="#fff" />
            </LinearGradient>
            <Text style={[styles.appName, { color: colors.text }]}>FinVault</Text>
            <Text style={[styles.tagline, { color: colors.textSecondary }]}>Your Smart Money Manager</Text>
          </Animated.View>

          {/* Form Card */}
          <Animated.View
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.border, opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <Text style={[styles.title, { color: colors.text }]}>Welcome Back 👋</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Sign in to continue tracking your expenses</Text>

            <View style={styles.form}>
              <Input
                label="Email Address"
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon="mail-outline"
                error={emailError}
              />
              <Input
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                isPassword
                leftIcon="lock-closed-outline"
                error={passwordError}
              />

              {error && (
                <View style={[styles.errorBanner, { backgroundColor: colors.dangerGlow, borderColor: colors.danger }]}>
                  <Ionicons name="alert-circle" size={16} color={colors.danger} />
                  <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
                </View>
              )}

              <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')} style={styles.forgotBtn}>
                <Text style={[styles.forgotText, { color: colors.primary }]}>Forgot Password?</Text>
              </TouchableOpacity>

              <Button title={isLoading ? 'Signing In...' : 'Sign In'} onPress={handleLogin} loading={isLoading} size="lg" />

              {/* Divider */}
              <View style={styles.divider}>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                <Text style={[styles.dividerText, { color: colors.textMuted }]}>OR</Text>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              </View>

              {/* Google Sign-In */}
              <TouchableOpacity
                style={[styles.googleBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                activeOpacity={0.8}
                onPress={handleLogin}
              >
                <Text style={styles.googleLetter}>G</Text>
                <Text style={[styles.googleText, { color: colors.text }]}>Continue with Google</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Sign Up Link */}
          <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text style={[styles.footerLink, { color: colors.primary }]}>Create Account</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  kav: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.base, paddingTop: 60, paddingBottom: 40 },
  orb1: { position: 'absolute', width: 300, height: 300, borderRadius: 150, top: -80, left: -80, opacity: 0.6 },
  orb2: { position: 'absolute', width: 250, height: 250, borderRadius: 125, bottom: 100, right: -80, opacity: 0.5 },
  logoSection: { alignItems: 'center', marginBottom: 36 },
  logoBox: {
    width: 76, height: 76, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#7C6FFF', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 10,
  },
  appName: { fontSize: FontSize.xxxl, fontWeight: '800', letterSpacing: 0.5 },
  tagline: { fontSize: FontSize.sm, marginTop: 4, letterSpacing: 0.3 },
  card: {
    borderRadius: Radius.xxl, padding: Spacing.xl,
    borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 10,
  },
  title: { fontSize: FontSize.xxl, fontWeight: '800', marginBottom: 6 },
  subtitle: { fontSize: FontSize.sm, marginBottom: Spacing.xl, lineHeight: 20 },
  form: { gap: 4 },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, marginBottom: Spacing.sm,
  },
  errorText: { fontSize: FontSize.sm, fontWeight: '500', flex: 1 },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: Spacing.base, marginTop: -4 },
  forgotText: { fontSize: FontSize.sm, fontWeight: '600' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: Spacing.base },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: FontSize.sm, fontWeight: '500' },
  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: 52, borderRadius: Radius.lg, borderWidth: 1.5, gap: 10,
  },
  googleLetter: { fontSize: 18, fontWeight: '800', color: '#4285F4' },
  googleText: { fontSize: FontSize.base, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: Spacing.xl },
  footerText: { fontSize: FontSize.base },
  footerLink: { fontSize: FontSize.base, fontWeight: '700' },
});
