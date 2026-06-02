import { create } from 'zustand';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from '../lib/supabase';
import { retryWithBackoff } from '../utils/retryWithBackoff';
import { User } from '../types';

WebBrowser.maybeCompleteAuthSession();

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  tempEmail: string | null;
  isInRecoveryFlow: boolean;

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
  purchasePremium: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  tempEmail: null,
  isInRecoveryFlow: false,

  setTempEmail: (email) => set({ tempEmail: email }),

  hydrate: async () => {
    set({ isLoading: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const authUser = session.user;

        let { data: profile } = await retryWithBackoff(() =>
          supabase.from('profiles').select('*').eq('id', authUser.id).single()
        );

        // OAuth users (Google) may not have a profile row — create one automatically
        if (!profile) {
          const name =
            authUser.user_metadata?.full_name ||
            authUser.user_metadata?.name ||
            authUser.email?.split('@')[0] ||
            'User';

          const { data: newProfile } = await supabase
            .from('profiles')
            .insert([{
              id: authUser.id,
              name,
              email: authUser.email,
              currency: 'USD',
              is_premium: false,
              streak_days: 0,
              total_badges: 0,
            }])
            .select()
            .single();

          profile = newProfile;
        }

        if (profile) {
          set({
            user: {
              id: authUser.id,
              email: authUser.email!,
              name: profile.name,
              isPremium: profile.is_premium,
              createdAt: profile.created_at,
              currency: profile.currency,
              streakDays: profile.streak_days,
              totalBadges: profile.total_badges,
            },
            isAuthenticated: true,
          });
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
      // Linking.createURL without a forced scheme works in ALL environments:
      // Expo Go → exp://192.x.x.x:8081
      // EAS Dev build / Production → spendly://
      const redirectUri = Linking.createURL('/');

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
        // Supabase returns tokens in the URL hash (#) for implicit flow
        const urlParts = res.url.split('#');
        const hash = urlParts[1];
        const query = res.url.split('?')[1];
        const params = new URLSearchParams(hash || query || '');

        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken && refreshToken) {
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) throw sessionError;

          if (sessionData.user) {
            const authUser = sessionData.user;

            // Try to get existing profile
            let { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', authUser.id)
              .single();

            // Google OAuth users may not have a profiles row yet — create one
            if (!profile) {
              const name =
                authUser.user_metadata?.full_name ||
                authUser.user_metadata?.name ||
                authUser.email?.split('@')[0] ||
                'User';

              const { data: newProfile } = await supabase
                .from('profiles')
                .insert([{
                  id: authUser.id,
                  name,
                  email: authUser.email,
                  currency: 'USD',
                  is_premium: false,
                  streak_days: 0,
                  total_badges: 0,
                }])
                .select()
                .single();

              profile = newProfile;
            }

            if (profile) {
              set({
                user: {
                  id: authUser.id,
                  email: authUser.email!,
                  name: profile.name,
                  isPremium: profile.is_premium,
                  createdAt: profile.created_at,
                  currency: profile.currency,
                  streakDays: profile.streak_days,
                  totalBadges: profile.total_badges,
                },
                isAuthenticated: true,
                isLoading: false,
              });
              return true;
            }
          }
        } else {
          set({ error: 'Google sign-in failed. Please try again.' });
        }
      } else if (res.type === 'cancel') {
        // User closed browser — not an error
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
      } else if (type === 'recovery') {
        // Mark that the user has a valid recovery session — only now can resetPassword be called
        set({ isInRecoveryFlow: true, isLoading: false });
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
    try {
      const { error } = await retryWithBackoff(() =>
        supabase.auth.resetPasswordForEmail(email)
      );
      if (error) throw error;
      set({ tempEmail: email, isLoading: false });
      return true;
    } catch (err: any) {
      set({ error: err?.message ?? 'Failed to send reset email', isLoading: false });
      return false;
    }
  },

  resetPassword: async (password) => {
    // Guard: only allow password reset after verifyOtp(type='recovery') has succeeded
    if (!get().isInRecoveryFlow) {
      set({ error: 'Password reset is not authorized. Please verify your identity first.' });
      return false;
    }

    set({ isLoading: true, error: null });
    const { error } = await supabase.auth.updateUser({ password });
    set({ isLoading: false });
    if (error) {
      set({ error: error.message });
      return false;
    }
    // Clear recovery flag after successful reset
    set({ isInRecoveryFlow: false, tempEmail: null });
    return true;
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false, error: null, isInRecoveryFlow: false, tempEmail: null });
  },

  updateUser: async (data) => {
    const current = get().user;
    if (!current) return;

    try {
      const { error } = await retryWithBackoff(() =>
        supabase
          .from('profiles')
          .update({ name: data.name, currency: data.currency, is_premium: data.isPremium })
          .eq('id', current.id)
      );
      if (error) throw error;
      set({ user: { ...current, ...data } });
    } catch (err: any) {
      set({ error: err?.message ?? 'Failed to update profile' });
      console.error('Update user error:', err);
    }
  },

  purchasePremium: async () => {
    const current = get().user;
    if (!current) return false;

    set({ isLoading: true, error: null });
    try {
      // In a real app, this would integrate with RevenueCat, Stripe, or Apple/Google IAP
      const { error } = await retryWithBackoff(() =>
        supabase.from('profiles').update({ is_premium: true }).eq('id', current.id)
      );
      if (error) throw error;
      set({ user: { ...current, isPremium: true }, isLoading: false });
      return true;
    } catch (err: any) {
      set({ error: err?.message ?? 'Premium purchase failed', isLoading: false });
      console.error('Premium purchase error:', err);
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
