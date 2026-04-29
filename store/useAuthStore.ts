import { create } from 'zustand';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from '../lib/supabase';
import { User } from '../types';

WebBrowser.maybeCompleteAuthSession();

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  tempEmail: string | null;

  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  verifyOtp: (email: string, token: string, type: 'signup' | 'recovery') => Promise<boolean>;
  resendOtp: (email: string, type: 'signup' | 'recovery') => Promise<boolean>;
  resetPassword: (password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  forgotPassword: (email: string) => Promise<boolean>;
  clearError: () => void;
  hydrate: () => Promise<void>;
  setTempEmail: (email: string | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  tempEmail: null,

  setTempEmail: (email) => set({ tempEmail: email }),

  hydrate: async () => {
    set({ isLoading: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          const userData: User = {
            id: session.user.id,
            email: session.user.email!,
            name: profile.name,
            isPremium: profile.is_premium,
            createdAt: profile.created_at,
            currency: profile.currency,
            streakDays: profile.streak_days,
            totalBadges: profile.total_badges,
          };
          set({ user: userData, isAuthenticated: true });
        }
      }
    } catch (err) {
      console.error('Hydrate error:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profile) {
          const userData: User = {
            id: data.user.id,
            email: data.user.email!,
            name: profile.name,
            isPremium: profile.is_premium,
            createdAt: profile.created_at,
            currency: profile.currency,
            streakDays: profile.streak_days,
            totalBadges: profile.total_badges,
          };
          set({ user: userData, isAuthenticated: true, isLoading: false });
          return true;
        }
      }
      return false;
    } catch (err: any) {
      set({ error: err.message || 'Login failed', isLoading: false });
      return false;
    }
  },

  signInWithGoogle: async () => {
    set({ isLoading: true, error: null });
    try {
      const redirectUri = Linking.createURL('/(auth)/login');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;

      const res = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);

      if (res.type === 'success' && res.url) {
        // Extract token from URL (Supabase returns it in the hash)
        const url = new URL(res.url.replace('#', '?'));
        const accessToken = url.searchParams.get('access_token');
        const refreshToken = url.searchParams.get('refresh_token');

        if (accessToken && refreshToken) {
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) throw sessionError;

          if (sessionData.user) {
            // Re-hydrate to get profile
            await get().hydrate();
            return true;
          }
        }
      }
      set({ isLoading: false });
      return false;
    } catch (err: any) {
      set({ error: err.message || 'Google login failed', isLoading: false });
      return false;
    }
  },

  signup: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
        },
      });

      if (error) throw error;

      if (data.user) {
        set({ tempEmail: email, isLoading: false });
        return true;
      }
      return false;
    } catch (err: any) {
      set({ error: err.message || 'Signup failed', isLoading: false });
      return false;
    }
  },

  verifyOtp: async (email, token, type) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: type === 'signup' ? 'signup' : 'recovery',
      });

      if (error) throw error;

      if (data.user && type === 'signup') {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profile) {
          const userData: User = {
            id: data.user.id,
            email: data.user.email!,
            name: profile.name,
            isPremium: profile.is_premium,
            createdAt: profile.created_at,
            currency: profile.currency,
            streakDays: profile.streak_days,
            totalBadges: profile.total_badges,
          };
          set({ user: userData, isAuthenticated: true, isLoading: false, tempEmail: null });
        }
      } else {
        set({ isLoading: false });
      }
      return true;
    } catch (err: any) {
      set({ error: err.message || 'Verification failed', isLoading: false });
      return false;
    }
  },

  resendOtp: async (email, type) => {
    set({ isLoading: true, error: null });
    try {
      if (type === 'signup') {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
      }
      set({ isLoading: false });
      return true;
    } catch (err: any) {
      set({ error: err.message || 'Resend failed', isLoading: false });
      return false;
    }
  },

  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    set({ isLoading: false });
    if (error) {
      set({ error: error.message });
      return false;
    }
    set({ tempEmail: email });
    return true;
  },

  resetPassword: async (password) => {
    set({ isLoading: true, error: null });
    const { error } = await supabase.auth.updateUser({
      password,
    });
    set({ isLoading: false });
    if (error) {
      set({ error: error.message });
      return false;
    }
    return true;
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false, error: null });
  },

  updateUser: async (data) => {
    const current = get().user;
    if (!current) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        name: data.name,
        currency: data.currency,
        is_premium: data.isPremium,
      })
      .eq('id', current.id);

    if (!error) {
      set({ user: { ...current, ...data } });
    }
  },

  clearError: () => set({ error: null }),
}));
