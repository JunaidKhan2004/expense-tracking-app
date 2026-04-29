import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  USER: '@finvault:user',
  TRANSACTIONS: '@finvault:transactions',
  WALLETS: '@finvault:wallets',
  CATEGORIES: '@finvault:categories',
  SETTINGS: '@finvault:settings',
  BUDGETS: '@finvault:budgets',
  GOALS: '@finvault:goals',
  ACHIEVEMENTS: '@finvault:achievements',
  AUTH_TOKEN: '@finvault:auth_token',
  IS_ONBOARDED: '@finvault:onboarded',
  NOTIFICATIONS: '@finvault:notifications_history',
};

async function getItem<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Storage setItem error for key ${key}:`, error);
  }
}

async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Storage removeItem error for key ${key}:`, error);
  }
}

async function clearAll(): Promise<void> {
  try {
    const allKeys = Object.values(KEYS);
    await AsyncStorage.multiRemove(allKeys);
  } catch (error) {
    console.error('Storage clearAll error:', error);
  }
}

export const Storage = {
  KEYS,
  getItem,
  setItem,
  removeItem,
  clearAll,
};
