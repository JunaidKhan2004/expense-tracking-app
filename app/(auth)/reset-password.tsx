import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Spacing, FontSize } from '../../constants/theme';

export default function ResetPasswordScreen() {
  const { colors } = useTheme();
  const { resetPassword, isLoading, error } = useAuthStore();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleReset = async () => {
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    const success = await resetPassword(password);
    if (success) {
      Alert.alert('Success', 'Your password has been reset successfully. Please login with your new password.', [
        { text: 'OK', onPress: () => router.replace('/(auth)/login') }
      ]);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>New Password</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Please enter your new password below.
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="New Password"
            placeholder="Enter new password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            icon="lock-closed-outline"
          />
          <Input
            label="Confirm Password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            icon="lock-closed-outline"
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          <Button
            title="Update Password"
            onPress={handleReset}
            loading={isLoading}
            style={styles.button}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flex: 1, padding: Spacing.xl, paddingTop: 80 },
  header: { marginBottom: Spacing.xxl },
  title: { fontSize: FontSize.xxl, fontWeight: '800', marginBottom: Spacing.sm },
  subtitle: { fontSize: FontSize.base },
  form: { gap: Spacing.md },
  errorText: { color: '#EF4444', fontSize: FontSize.sm, textAlign: 'center' },
  button: { marginTop: Spacing.lg },
});
