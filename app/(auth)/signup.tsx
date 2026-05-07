import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView, Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { FontSize, Radius, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../store/useAuthStore';
import { AuthHeader } from '../../components/auth/AuthHeader';

export default function SignupScreen() {
  const { colors } = useTheme();
  const { signup, isLoading, error, clearError } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    clearError();
    if (!name.trim()) e.name = 'Full name is required';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'At least 6 characters';
    if (password !== confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;
    const success = await signup(name.trim(), email.trim(), password);
    if (success) router.replace('/(auth)/verify?type=signup');
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.orb1, { backgroundColor: colors.successGlow }]} />
      <View style={[styles.orb2, { backgroundColor: colors.primaryGlow }]} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.kav}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Header */}
          <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
            <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="arrow-back" size={20} color={colors.text} />
            </TouchableOpacity>
          </Animated.View>

          {/* Auth Header */}
          <AuthHeader 
            title="Create Account" 
            subtitle="Start your financial journey today and master your savings"
            icon="person-add-outline"
          />

          {/* Form Card */}
          <Animated.View
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
          >

            <Input label="Full Name" placeholder="John Doe" value={name} onChangeText={setName} leftIcon="person-outline" error={errors.name} autoCapitalize="words" />
            <Input label="Email Address" placeholder="you@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" leftIcon="mail-outline" error={errors.email} />
            <Input label="Password" placeholder="Min 6 characters" value={password} onChangeText={setPassword} isPassword leftIcon="lock-closed-outline" error={errors.password} />
            <Input label="Confirm Password" placeholder="Repeat your password" value={confirm} onChangeText={setConfirm} isPassword leftIcon="shield-checkmark-outline" error={errors.confirm} />

            {error && (
              <View style={[styles.errorBanner, { backgroundColor: colors.dangerGlow, borderColor: colors.danger }]}>
                <Ionicons name="alert-circle" size={16} color={colors.danger} />
                <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
              </View>
            )}

            {/* Terms */}
            <Text style={[styles.terms, { color: colors.textMuted }]}>
              By creating an account, you agree to our{' '}
              <Text style={{ color: colors.primary, fontWeight: '600' }}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={{ color: colors.primary, fontWeight: '600' }}>Privacy Policy</Text>
            </Text>

            <Button title={isLoading ? 'Creating Account...' : 'Create Account'} onPress={handleSignup} loading={isLoading} size="lg" />
          </Animated.View>

          {/* Login Link */}
          <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={[styles.footerLink, { color: colors.primary }]}>Sign In</Text>
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
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.base, paddingTop: 40, paddingBottom: 40 },
  orb1: { position: 'absolute', width: 280, height: 280, borderRadius: 140, top: -60, right: -60, opacity: 0.5 },
  orb2: { position: 'absolute', width: 220, height: 220, borderRadius: 110, bottom: 80, left: -60, opacity: 0.5 },
  header: { marginBottom: 24 },
  backBtn: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  card: { borderRadius: Radius.xxl, padding: Spacing.xl, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 24, elevation: 8 },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, marginBottom: Spacing.sm },
  errorText: { fontSize: FontSize.sm, fontWeight: '500', flex: 1 },
  terms: { fontSize: FontSize.xs, textAlign: 'center', lineHeight: 18, marginBottom: Spacing.base, marginTop: 4 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: Spacing.xl },
  footerText: { fontSize: FontSize.base },
  footerLink: { fontSize: FontSize.base, fontWeight: '700' },
});
