import { create } from 'zustand';
import { User } from '../types';
import { Storage } from '../utils/storage';
import { generateId } from '../utils/formatters';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  forgotPassword: (email: string) => Promise<boolean>;
  clearError: () => void;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  hydrate: async () => {
    set({ isLoading: true });
    try {
      const user = await Storage.getItem<User>(Storage.KEYS.USER);
      const token = await Storage.getItem<string>(Storage.KEYS.AUTH_TOKEN);
      if (user && token) {
        set({ user, isAuthenticated: true });
      }
    } catch {
      // ignore
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      // Simulated auth — replace with real API/Firebase
      await new Promise((r) => setTimeout(r, 1200));

      if (!email || !password) {
        set({ error: 'Please enter email and password', isLoading: false });
        return false;
      }
      if (password.length < 6) {
        set({ error: 'Invalid credentials. Please try again.', isLoading: false });
        return false;
      }

      const user: User = {
        id: generateId(),
        name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        email,
        isPremium: false,
        createdAt: new Date().toISOString(),
        currency: 'USD',
        streakDays: 1,
        totalBadges: 0,
      };

      await Storage.setItem(Storage.KEYS.USER, user);
      await Storage.setItem(Storage.KEYS.AUTH_TOKEN, `token_${generateId()}`);
      set({ user, isAuthenticated: true, isLoading: false });
      return true;
    } catch (err) {
      set({ error: 'Login failed. Please try again.', isLoading: false });
      return false;
    }
  },

  signup: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      await new Promise((r) => setTimeout(r, 1200));

      if (!name || !email || !password) {
        set({ error: 'All fields are required', isLoading: false });
        return false;
      }
      if (password.length < 6) {
        set({ error: 'Password must be at least 6 characters', isLoading: false });
        return false;
      }

      const user: User = {
        id: generateId(),
        name,
        email,
        isPremium: false,
        createdAt: new Date().toISOString(),
        currency: 'USD',
        streakDays: 1,
        totalBadges: 0,
      };

      await Storage.setItem(Storage.KEYS.USER, user);
      await Storage.setItem(Storage.KEYS.AUTH_TOKEN, `token_${generateId()}`);
      set({ user, isAuthenticated: true, isLoading: false });
      return true;
    } catch {
      set({ error: 'Signup failed. Please try again.', isLoading: false });
      return false;
    }
  },

  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });
    await new Promise((r) => setTimeout(r, 1000));
    set({ isLoading: false });
    return !!email;
  },

  logout: async () => {
    await Storage.removeItem(Storage.KEYS.AUTH_TOKEN);
    await Storage.removeItem(Storage.KEYS.USER);
    set({ user: null, isAuthenticated: false, error: null });
  },

  updateUser: async (data) => {
    const current = get().user;
    if (!current) return;
    const updated = { ...current, ...data };
    await Storage.setItem(Storage.KEYS.USER, updated);
    set({ user: updated });
  },

  clearError: () => set({ error: null }),
}));
