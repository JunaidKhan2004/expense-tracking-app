import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useTheme } from '../../../hooks/useTheme';
import { PIN_SECURE_KEY, useSettingsStore } from '../../../store/useSettingsStore';
import { FontSize, Radius, Spacing } from '../../../constants/theme';
import { showToast } from '../../../utils/toast';

export default function ChangePinScreen() {
  const { colors } = useTheme();
  const { settings, setPin } = useSettingsStore();
  const [step, setStep] = useState<'current' | 'new' | 'confirm'>(settings.pinEnabled ? 'current' : 'new');
  const [pin, setPinInput] = useState('');
  const [newPin, setNewPin] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const lockoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handlePress = (num: string) => {
    if (isLocked || pin.length >= 4) return;
    const nextPin = pin + num;
    setPinInput(nextPin);
    if (nextPin.length === 4) {
      setTimeout(() => processPin(nextPin), 200);
    }
  };

  const handleDelete = () => {
    if (!isLocked) setPinInput(pin.slice(0, -1));
  };

  const processPin = async (enteredPin: string) => {
    if (step === 'current') {
      try {
        const storedPin = await SecureStore.getItemAsync(PIN_SECURE_KEY);
        if (enteredPin === storedPin) {
          setAttempts(0);
          setStep('new');
          setPinInput('');
        } else {
          const next = attempts + 1;
          setAttempts(next);
          if (next >= 3) {
            setIsLocked(true);
            lockoutRef.current = setTimeout(() => {
              setIsLocked(false);
              setAttempts(0);
            }, 60_000);
            setPinInput('');
            showToast.error('Too Many Attempts', 'Try again in 1 minute');
          } else {
            shake();
            setPinInput('');
            showToast.error('Incorrect PIN', `${3 - next} attempt${3 - next !== 1 ? 's' : ''} remaining`);
          }
        }
      } catch {
        setPinInput('');
        showToast.error('Error', 'Failed to verify PIN');
      }
    } else if (step === 'new') {
      setNewPin(enteredPin);
      setStep('confirm');
      setPinInput('');
    } else if (step === 'confirm') {
      if (enteredPin === newPin) {
        await setPin(enteredPin);
        if (lockoutRef.current) clearTimeout(lockoutRef.current);
        showToast.success('PIN Updated', 'Your security PIN has been saved');
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/(tabs)/settings');
        }
      } else {
        shake();
        setPinInput('');
        setStep('new');
        showToast.error('Mismatch', 'PINs do not match. Try again.');
      }
    }
  };

  const getTitle = () => {
    if (step === 'current') return 'Enter Current PIN';
    if (step === 'new') return 'Create New PIN';
    return 'Confirm New PIN';
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/settings')} 
          style={styles.backBtn}
        >
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Security PIN</Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.stepTitle, { color: colors.text }]}>{getTitle()}</Text>
        <Text style={[styles.stepSub, { color: colors.textSecondary }]}>
          Protect your financial data with a 4-digit code
        </Text>

        <Animated.View style={[styles.dots, { transform: [{ translateX: shakeAnim }] }]}>
          {[1, 2, 3, 4].map((i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { 
                  backgroundColor: pin.length >= i ? colors.primary : colors.border,
                  borderColor: pin.length >= i ? colors.primary : colors.border,
                }
              ]}
            />
          ))}
        </Animated.View>

        <View style={styles.pad}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <TouchableOpacity key={n} style={styles.numBtn} onPress={() => handlePress(String(n))}>
              <Text style={[styles.numText, { color: colors.text }]}>{n}</Text>
            </TouchableOpacity>
          ))}
          <View style={styles.numBtn} />
          <TouchableOpacity style={styles.numBtn} onPress={() => handlePress('0')}>
            <Text style={[styles.numText, { color: colors.text }]}>0</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.numBtn} onPress={handleDelete}>
            <Ionicons name="backspace-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingTop: 60 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.base, marginBottom: 40 },
  backBtn: { marginRight: Spacing.md },
  title: { fontSize: FontSize.lg, fontWeight: '700' },
  content: { flex: 1, alignItems: 'center', paddingHorizontal: Spacing.xl },
  stepTitle: { fontSize: FontSize.xxl, fontWeight: '800', marginBottom: 8 },
  stepSub: { fontSize: FontSize.sm, textAlign: 'center', marginBottom: 40 },
  dots: { flexDirection: 'row', gap: 20, marginBottom: 60 },
  dot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2 },
  pad: { flexDirection: 'row', flexWrap: 'wrap', width: 280, justifyContent: 'center', gap: 20 },
  numBtn: { width: 70, height: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center' },
  numText: { fontSize: 28, fontWeight: '600' },
});
