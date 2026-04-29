import { create } from 'zustand';
import { AppSettings, ThemeMode } from '../types';
import { Storage } from '../utils/storage';

interface SettingsState {
  settings: AppSettings;
  isLoading: boolean;

  hydrate: () => Promise<void>;
  updateSettings: (data: Partial<AppSettings>) => Promise<void>;
  setTheme: (theme: ThemeMode) => Promise<void>;
  setCurrency: (currency: string) => Promise<void>;
  toggleNotifications: () => Promise<void>;
  toggleBiometric: () => Promise<void>;
  resetSettings: () => Promise<void>;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  currency: 'USD',
  language: 'en',
  notificationsEnabled: true,
  biometricEnabled: false,
  pinEnabled: false,
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

  setCurrency: async (currency) => {
    const updated = { ...get().settings, currency };
    set({ settings: updated });
    await Storage.setItem(Storage.KEYS.SETTINGS, updated);
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
    const updated = {
      ...get().settings,
      biometricEnabled: !get().settings.biometricEnabled,
    };
    set({ settings: updated });
    await Storage.setItem(Storage.KEYS.SETTINGS, updated);
  },

  resetSettings: async () => {
    set({ settings: DEFAULT_SETTINGS });
    await Storage.setItem(Storage.KEYS.SETTINGS, DEFAULT_SETTINGS);
  },
}));
