import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../../../hooks/useTheme';
import { useSettingsStore } from '../../../store/useSettingsStore';
import { FontSize, Radius, Spacing } from '../../../constants/theme';
import { showToast } from '../../../utils/toast';

export default function ChangePinScreen() {
  const { colors } = useTheme();
  const { settings, setPin } = useSettingsStore();
  const [step, setStep] = useState<'current' | 'new' | 'confirm'>(settings.pin ? 'current' : 'new');
  const [pin, setPinInput] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  
  const shakeAnim = React.useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handlePress = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPinInput(nextPin);

      if (nextPin.length === 4) {
        setTimeout(() => processPin(nextPin), 200);
      }
    }
  };

  const handleDelete = () => {
    setPinInput(pin.slice(0, -1));
  };

  const processPin = async (enteredPin: string) => {
    if (step === 'current') {
      if (enteredPin === settings.pin) {
        setStep('new');
        setPinInput('');
      } else {
        shake();
        setPinInput('');
        showToast.error('Incorrect PIN', 'Please try again');
      }
    } else if (step === 'new') {
      setNewPin(enteredPin);
      setStep('confirm');
      setPinInput('');
    } else if (step === 'confirm') {
      if (enteredPin === newPin) {
        await setPin(enteredPin);
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
