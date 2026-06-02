import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as LocalAuthentication from 'expo-local-authentication';
import React, { useEffect, useState } from 'react';
import { Animated, AppState, AppStateStatus, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FontSize, Radius, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../store/useAuthStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { showToast } from '../../utils/toast';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { settings } = useSettingsStore();
  const { user } = useAuthStore();
  const { colors } = useTheme();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPinFallback, setShowPinFallback] = useState(false);
  const [pinInput, setPinInput] = useState('');

  const shakeAnim = React.useRef(new Animated.Value(0)).current;

  const shouldLock = (settings.biometricEnabled || settings.pinEnabled) && user;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const authenticate = async () => {
    if (!shouldLock) return;

    if (settings.biometricEnabled) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock Spendly',
        fallbackLabel: 'Use PIN',
      });

      if (result.success) {
        setIsAuthenticated(true);
        setShowPinFallback(false);
      } else {
        if (settings.pinEnabled) setShowPinFallback(true);
      }
    } else if (settings.pinEnabled) {
      setShowPinFallback(true);
    }
  };

  const handlePinPress = (num: string) => {
    if (pinInput.length < 4) {
      const nextPin = pinInput + num;
      setPinInput(nextPin);
      if (nextPin.length === 4) {
        if (nextPin === settings.pin) {
          setIsAuthenticated(true);
          setShowPinFallback(false);
          setPinInput('');
        } else {
          shake();
          setPinInput('');
          showToast.error('Invalid PIN', 'Please try again');
        }
      }
    }
  };

  useEffect(() => {
    if (shouldLock) {
      setIsAuthenticated(false);
      authenticate();
    } else {
      setIsAuthenticated(true);
    }
  }, [shouldLock]);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (shouldLock && nextAppState === 'background') {
        setIsAuthenticated(false);
        setShowPinFallback(false);
        setPinInput('');
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [shouldLock]);

  return (
    <View style={{ flex: 1 }}>
      {children}
      {shouldLock && !isAuthenticated && (
        <View style={[StyleSheet.absoluteFill, styles.container, { backgroundColor: colors.background, zIndex: 9999 }]}>
          {!showPinFallback ? (
            <>
              <LinearGradient colors={colors.gradient.primary} style={styles.iconBox}>
                <Ionicons name="lock-closed" size={40} color="#fff" />
              </LinearGradient>
              <Text style={[styles.title, { color: colors.text }]}>Spendly Locked</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Authentication required to access your data
              </Text>

              <TouchableOpacity style={styles.unlockBtn} onPress={authenticate}>
                <LinearGradient colors={colors.gradient.primary} style={styles.btnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Ionicons name="finger-print" size={20} color="#fff" />
                  <Text style={styles.btnText}>Unlock with Biometrics</Text>
                </LinearGradient>
              </TouchableOpacity>

              {settings.pinEnabled && (
                <TouchableOpacity style={{ marginTop: 20 }} onPress={() => setShowPinFallback(true)}>
                  <Text style={{ color: colors.primary, fontWeight: '700' }}>Use Security PIN</Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <View style={{ alignItems: 'center', width: '100%' }}>
              <Text style={[styles.title, { color: colors.text }]}>Enter PIN</Text>
              <Animated.View style={[styles.dots, { transform: [{ translateX: shakeAnim }] }]}>
                {[1, 2, 3, 4].map((i) => (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      {
                        backgroundColor: pinInput.length >= i ? colors.primary : colors.border,
                        borderColor: pinInput.length >= i ? colors.primary : colors.border,
                      }
                    ]}
                  />
                ))}
              </Animated.View>

              <View style={styles.pad}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                  <TouchableOpacity key={n} style={styles.numBtn} onPress={() => handlePinPress(String(n))}>
                    <Text style={[styles.numText, { color: colors.text }]}>{n}</Text>
                  </TouchableOpacity>
                ))}
                <View style={styles.numBtn} />
                <TouchableOpacity style={styles.numBtn} onPress={() => handlePinPress('0')}>
                  <Text style={[styles.numText, { color: colors.text }]}>0</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.numBtn} onPress={() => setPinInput(pinInput.slice(0, -1))}>
                  <Ionicons name="backspace-outline" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              {settings.biometricEnabled && (
                <TouchableOpacity style={{ marginTop: 30 }} onPress={() => setShowPinFallback(false)}>
                  <Ionicons name="finger-print" size={40} color={colors.primary} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  iconBox: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xl },
  title: { fontSize: FontSize.xxl, fontWeight: '800', marginBottom: 8 },
  subtitle: { fontSize: FontSize.base, textAlign: 'center', marginBottom: Spacing.xxl, opacity: 0.8 },
  unlockBtn: { width: '100%', maxWidth: 280 },
  btnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, height: 56, borderRadius: Radius.xl },
  btnText: { color: '#fff', fontSize: FontSize.base, fontWeight: '700' },
  dots: { flexDirection: 'row', gap: 20, marginVertical: 40 },
  dot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2 },
  pad: { flexDirection: 'row', flexWrap: 'wrap', width: 280, justifyContent: 'center', gap: 20 },
  numBtn: { width: 70, height: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center' },
  numText: { fontSize: 28, fontWeight: '600' },
});
