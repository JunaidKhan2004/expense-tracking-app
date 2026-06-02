import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  USER: '@spendly:user',
  TRANSACTIONS: '@spendly:transactions',
  WALLETS: '@spendly:wallets',
  CATEGORIES: '@spendly:categories',
  SETTINGS: '@spendly:settings',
  BUDGETS: '@spendly:budgets',
  GOALS: '@spendly:goals',
  ACHIEVEMENTS: '@spendly:achievements',
  AUTH_TOKEN: '@spendly:auth_token',
  IS_ONBOARDED: '@spendly:onboarded',
  NOTIFICATIONS: '@spendly:notifications_history',
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
