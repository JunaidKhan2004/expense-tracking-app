import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, TextInput, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../../components/ui/Button';
import { Spacing, FontSize, Radius } from '../../constants/theme';

export default function VerifyScreen() {
  const { type } = useLocalSearchParams<{ type: 'signup' | 'recovery' }>();
  const { colors } = useTheme();
  const { verifyOtp, resendOtp, tempEmail, isLoading, error, clearError } = useAuthStore();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputs = useRef<Array<TextInput | null>>([]);

  const handleTextChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otp = code.join('');
    if (otp.length < 6) {
      Alert.alert('Error', 'Please enter the 6-digit code');
      return;
    }

    if (!tempEmail) {
      Alert.alert('Error', 'Email not found. Please try signing up again.');
      router.back();
      return;
    }

    const success = await verifyOtp(tempEmail, otp, type);
    if (success) {
      if (type === 'signup') {
        router.replace('/(tabs)/index');
      } else {
        router.replace('/(auth)/reset-password');
      }
    }
  };

  const handleResend = async () => {
    if (!tempEmail) return;
    const success = await resendOtp(tempEmail, type);
    if (success) {
      Alert.alert('Success', 'A new code has been sent to your email.');
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Verify Email</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            We've sent a 6-digit verification code to {tempEmail}
          </Text>
        </View>

        <View style={styles.otpContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputs.current[index] = ref)}
              style={[
                styles.otpInput,
                {
                  backgroundColor: colors.card,
                  borderColor: digit ? colors.primary : colors.border,
                  color: colors.text,
                },
              ]}
              value={digit}
              onChangeText={(text) => handleTextChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <Button
          title="Verify"
          onPress={handleVerify}
          loading={isLoading}
          style={styles.verifyBtn}
        />

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>Didn't receive the code? </Text>
          <TouchableOpacity onPress={handleResend}>
            <Text style={[styles.resendText, { color: colors.primary }]}>Resend</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flex: 1, padding: Spacing.xl, paddingTop: 60 },
  backBtn: { marginBottom: Spacing.xl },
  header: { marginBottom: Spacing.xxl },
  title: { fontSize: FontSize.xxl, fontWeight: '800', marginBottom: Spacing.sm },
  subtitle: { fontSize: FontSize.base, lineHeight: 22 },
  otpContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.xl },
  otpInput: {
    width: 45,
    height: 55,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    textAlign: 'center',
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  verifyBtn: { marginTop: Spacing.lg },
  errorText: { color: '#EF4444', fontSize: FontSize.sm, textAlign: 'center', marginBottom: Spacing.md },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xl },
  footerText: { fontSize: FontSize.sm },
  resendText: { fontSize: FontSize.sm, fontWeight: '700' },
});
