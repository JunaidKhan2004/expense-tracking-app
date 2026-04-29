import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import { AuthGuard } from '../components/auth/AuthGuard';
import { OfflineBanner } from '../components/ui/OfflineBanner';
import { Radius, Shadow } from '../constants/theme';
import '../global.css';
import { useTheme } from '../hooks/useTheme';
import { useAuthStore } from '../store/useAuthStore';
import { useBudgetStore } from '../store/useBudgetStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useTransactionStore } from '../store/useTransactionStore';
import { useWalletStore } from '../store/useWalletStore';
import { registerForPushNotificationsAsync } from '../utils/notifications';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  const { hydrate: hydrateAuth } = useAuthStore();
  const { hydrate: hydrateTransactions } = useTransactionStore();
  const { hydrate: hydrateWallets } = useWalletStore();
  const { hydrate: hydrateSettings } = useSettingsStore();
  const { hydrate: hydrateBudgets } = useBudgetStore();
  const { hydrate: hydrateNotifications } = useNotificationStore();
  const { isDark, colors } = useTheme();

  useEffect(() => {
    // Hydrate all stores from AsyncStorage on app start
    Promise.all([
      hydrateAuth(),
      hydrateTransactions(),
      hydrateWallets(),
      hydrateSettings(),
      hydrateBudgets(),
      hydrateNotifications(),
    ]);

    // Register for notifications
    registerForPushNotificationsAsync();
  }, []);

  // Premium Toast Configuration
  const toastConfig = {
    success: (props: any) => (
      <BaseToast
        {...props}
        style={{ borderLeftColor: colors.success, backgroundColor: colors.card, height: 70, borderRadius: Radius.lg, ...Shadow.md }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{ fontSize: 16, fontWeight: '700', color: colors.text }}
        text2Style={{ fontSize: 13, color: colors.textSecondary }}
      />
    ),
    error: (props: any) => (
      <ErrorToast
        {...props}
        style={{ borderLeftColor: colors.danger, backgroundColor: colors.card, height: 70, borderRadius: Radius.lg, ...Shadow.md }}
        text1Style={{ fontSize: 16, fontWeight: '700', color: colors.text }}
        text2Style={{ fontSize: 13, color: colors.textSecondary }}
      />
    ),
    info: (props: any) => (
      <BaseToast
        {...props}
        style={{ borderLeftColor: colors.primary, backgroundColor: colors.card, height: 70, borderRadius: Radius.lg, ...Shadow.md }}
        text1Style={{ fontSize: 16, fontWeight: '700', color: colors.text }}
        text2Style={{ fontSize: 13, color: colors.textSecondary }}
      />
    ),
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthGuard>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <OfflineBanner />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="transaction/add"
              options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
            />
            <Stack.Screen
              name="transaction/scan"
              options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
            />
            <Stack.Screen
              name="transaction/[id]"
              options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
            />
            <Stack.Screen
              name="category/manage"
              options={{ animation: 'slide_from_right', headerTitle: 'Manage Categories' }}
            />
            <Stack.Screen
              name="budget/manage"
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="wallet/manage"
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="settings/security/pin"
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="settings/privacy"
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="settings/support"
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="settings/terms"
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="premium"
              options={{ animation: 'slide_from_bottom', presentation: 'modal', headerShown: false }}
            />
            <Stack.Screen
              name="notifications"
              options={{ animation: 'slide_from_bottom', presentation: 'modal', headerShown: false }}
            />
          </Stack>
          <Toast config={toastConfig} />
        </AuthGuard>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
