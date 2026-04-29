import * as LocalAuthentication from 'expo-local-authentication';
import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { AppSettings, ThemeMode } from '../types';
import { getExchangeRates } from '../utils/currencyConverter';
import { Storage } from '../utils/storage';
import { useTransactionStore } from './useTransactionStore';
import { useWalletStore } from './useWalletStore';

interface SettingsState {
  settings: AppSettings;
  isLoading: boolean;

  hydrate: () => Promise<void>;
  updateSettings: (data: Partial<AppSettings>) => Promise<void>;
  setTheme: (theme: ThemeMode) => Promise<void>;
  setCurrency: (currency: string) => Promise<void>;
  toggleNotifications: () => Promise<void>;
  toggleBiometric: () => Promise<void>;
  setPin: (pin: string | null) => Promise<void>;
  resetSettings: () => Promise<void>;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  currency: 'USD',
  language: 'en',
  notificationsEnabled: true,
  biometricEnabled: false,
  pinEnabled: false,
  pin: undefined,
  budgetAlerts: true,
  weeklyReport: true,
  monthlyReport: true,
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  isLoading: false,

  hydrate: async () => {
    set({ isLoading: true });
    try {
      const saved = await Storage.getItem<AppSettings>(Storage.KEYS.SETTINGS);
      if (saved) set({ settings: { ...DEFAULT_SETTINGS, ...saved } });

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('currency')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          const updated = { 
            ...get().settings, 
            currency: profile.currency || get().settings.currency,
          };
          set({ settings: updated });
          await Storage.setItem(Storage.KEYS.SETTINGS, updated);
        }
      }
    } catch {
      // keep defaults
    } finally {
      set({ isLoading: false });
    }
  },

  updateSettings: async (data) => {
    const updated = { ...get().settings, ...data };
    set({ settings: updated });
    await Storage.setItem(Storage.KEYS.SETTINGS, updated);
  },

  setTheme: async (theme) => {
    const updated = { ...get().settings, theme };
    set({ settings: updated });
    await Storage.setItem(Storage.KEYS.SETTINGS, updated);
  },

  setCurrency: async (newCurrency) => {
    const oldCurrency = get().settings.currency;
    if (oldCurrency === newCurrency) return;

    set({ isLoading: true });
    try {
      const rates = await getExchangeRates(oldCurrency);
      if (!rates || !rates[newCurrency]) {
        throw new Error(`Could not fetch rate for ${newCurrency}`);
      }

      const rate = rates[newCurrency];

      await Promise.all([
        useTransactionStore.getState().convertAllTransactions(rate),
        useWalletStore.getState().convertAllWallets(rate),
      ]);

      const updated = { ...get().settings, currency: newCurrency };
      set({ settings: updated });
      await Storage.setItem(Storage.KEYS.SETTINGS, updated);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ currency: newCurrency })
          .eq('id', user.id);
      }
    } catch (err) {
      console.error('Currency conversion error:', err);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  toggleNotifications: async () => {
    const updated = {
      ...get().settings,
      notificationsEnabled: !get().settings.notificationsEnabled,
    };
    set({ settings: updated });
    await Storage.setItem(Storage.KEYS.SETTINGS, updated);
  },

  toggleBiometric: async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware || !isEnrolled) {
      throw new Error('Biometric authentication is not available on this device.');
    }

    const updated = {
      ...get().settings,
      biometricEnabled: !get().settings.biometricEnabled,
    };
    set({ settings: updated });
    await Storage.setItem(Storage.KEYS.SETTINGS, updated);
  },

  setPin: async (pin) => {
    const updated = {
      ...get().settings,
      pinEnabled: !!pin,
      pin: pin || undefined,
    };
    set({ settings: updated });
    await Storage.setItem(Storage.KEYS.SETTINGS, updated);
  },

  resetSettings: async () => {
    set({ settings: DEFAULT_SETTINGS });
    await Storage.setItem(Storage.KEYS.SETTINGS, DEFAULT_SETTINGS);
  },
}));
