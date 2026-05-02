import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { FontSize, Radius, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../store/useAuthStore';

export default function ForgotPasswordScreen() {
  const { colors } = useTheme();
  const { forgotPassword, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [sent, setSent] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 70, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleSend = async () => {
    setEmailError('');
    if (!email.trim()) { setEmailError('Email is required'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailError('Enter a valid email'); return; }
    const ok = await forgotPassword(email.trim());
    if (ok) router.replace('/(auth)/verify?type=recovery');
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.orb, { backgroundColor: colors.primaryGlow }]} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.kav}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Animated.View style={{ opacity: fadeAnim, marginBottom: 32 }}>
            <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="arrow-back" size={20} color={colors.text} />
            </TouchableOpacity>
          </Animated.View>
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            {!sent ? (
              <>
                <LinearGradient colors={colors.gradient.card2} style={styles.iconBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <Ionicons name="key" size={36} color="#fff" />
                </LinearGradient>
                <Text style={[styles.title, { color: colors.text }]}>Forgot Password?</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Enter your email and we'll send you a reset link.</Text>
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Input label="Email Address" placeholder="you@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" leftIcon="mail-outline" error={emailError} />
                  <Button title={isLoading ? 'Sending...' : 'Send Reset Link'} onPress={handleSend} loading={isLoading} size="lg" />
                </View>
              </>
            ) : (
              <View style={styles.successContainer}>
                <LinearGradient colors={colors.gradient.income} style={styles.successIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <Ionicons name="checkmark" size={44} color="#fff" />
                </LinearGradient>
                <Text style={[styles.title, { color: colors.text, textAlign: 'center' }]}>Email Sent!</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary, textAlign: 'center' }]}>
                  Reset instructions sent to{'\n'}<Text style={{ color: colors.primary, fontWeight: '700' }}>{email}</Text>
                </Text>
                <Button title="Back to Login" onPress={() => router.replace('/(auth)/login')} size="lg" style={{ marginTop: Spacing.xl }} />
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  kav: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.base, paddingTop: 50, paddingBottom: 40 },
  orb: { position: 'absolute', width: 300, height: 300, borderRadius: 150, top: -100, right: -80, opacity: 0.6 },
  backBtn: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  iconBox: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xl },
  title: { fontSize: FontSize.xxxl, fontWeight: '800', marginBottom: Spacing.sm },
  subtitle: { fontSize: FontSize.base, lineHeight: 24, marginBottom: Spacing.xl },
  card: { borderRadius: Radius.xxl, padding: Spacing.xl, borderWidth: 1 },
  successContainer: { alignItems: 'center', paddingTop: 40 },
  successIcon: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xl },
});
