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
import { AuthHeader } from '../../components/auth/AuthHeader';

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
                <AuthHeader 
                  title="Forgot Password?" 
                  subtitle="Enter your email and we'll send you a reset link to regain access"
                  icon="key-outline"
                />
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Input label="Email Address" placeholder="you@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" leftIcon="mail-outline" error={emailError} />
                  <Button title={isLoading ? 'Sending...' : 'Send Reset Link'} onPress={handleSend} loading={isLoading} size="lg" />
                </View>
              </>
            ) : (
              <View style={styles.successContainer}>
                <AuthHeader 
                  title="Email Sent!" 
                  subtitle={`Reset instructions sent to ${email}. Please check your inbox and spam folder.`}
                  icon="checkmark-circle-outline"
                />
                <Button 
                  title="Back to Login" 
                  onPress={() => router.replace('/(auth)/login')} 
                  size="lg" 
                  style={{ marginTop: Spacing.xl, width: '100%' }} 
                />
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
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.base, paddingTop: 40, paddingBottom: 40 },
  orb: { position: 'absolute', width: 300, height: 300, borderRadius: 150, top: -100, right: -80, opacity: 0.6 },
  backBtn: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  card: { borderRadius: Radius.xxl, padding: Spacing.xl, borderWidth: 1 },
  successContainer: { alignItems: 'center', paddingTop: 40 },
  successIcon: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xl },
});
