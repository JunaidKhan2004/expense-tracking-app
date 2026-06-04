import { create } from 'zustand';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
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
    } catch (err: any) {
      // Invalid/expired refresh token — wipe the broken session and go to login
      if (
        err?.message?.toLowerCase().includes('refresh token') ||
        err?.message?.toLowerCase().includes('invalid token') ||
        err?.status === 400 ||
        err?.status === 401
      ) {
        await supabase.auth.signOut();
        set({ user: null, isAuthenticated: false });
      }
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
      // makeRedirectUri automatically picks the right URI per environment:
      // Expo Go (Android/iOS) → exp://192.x.x.x:8081/
      // Dev build / Production → spendly://
      // This URI must be added to Supabase Dashboard → Auth → URL Config → Redirect URLs
      const redirectUri = AuthSession.makeRedirectUri({ scheme: 'spendly' });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;
      if (!data.url) throw new Error('No OAuth URL returned');

      // Warm up Chrome Custom Tab on Android for faster, more reliable redirect detection
      await WebBrowser.warmUpAsync();
      const res = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);
      await WebBrowser.coolDownAsync();

      if (res.type === 'success' && res.url) {
        // Supabase v2 defaults to PKCE flow: callback URL contains ?code=…
        // Implicit flow (legacy) returns #access_token=… in the hash.
        // Detect which flow was used and handle accordingly.
        const hashPart = res.url.includes('#') ? res.url.split('#')[1] : '';
        const queryPart = res.url.includes('?') ? res.url.split('?')[1].split('#')[0] : '';
        const hashParams = new URLSearchParams(hashPart);
        const queryParams = new URLSearchParams(queryPart);

        const code = queryParams.get('code');
        const accessToken = hashParams.get('access_token') || queryParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token') || queryParams.get('refresh_token');

        let authUser: { id: string; email?: string; user_metadata?: Record<string, any> } | null = null;

        if (code) {
          // PKCE flow — exchange the one-time code for a session
          const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(res.url);
          if (sessionError) throw sessionError;
          authUser = sessionData.session?.user ?? null;
        } else if (accessToken && refreshToken) {
          // Implicit flow (older Supabase projects)
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (sessionError) throw sessionError;
          authUser = sessionData.user ?? null;
        } else {
          set({ error: 'Google sign-in failed. Please try again.', isLoading: false });
          return false;
        }

        if (authUser) {
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
      } else if (res.type === 'cancel' || res.type === 'dismiss') {
        // User closed the browser or browser dismissed without completing OAuth
        set({ isLoading: false });
        return false;
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
    if (!current) {
      set({ error: 'You must be logged in to purchase premium.' });
      return false;
    }

    if (current.isPremium) return true;

    set({ isLoading: true, error: null });
    try {
      // Requires Supabase RLS policy: allow users to set is_premium = true on their own row.
      // SQL: CREATE POLICY "users can upgrade to premium" ON profiles
      //   FOR UPDATE USING (auth.uid() = id)
      //   WITH CHECK (auth.uid() = id AND is_premium = true);
      const { error } = await retryWithBackoff(() =>
        supabase.from('profiles').update({ is_premium: true }).eq('id', current.id)
      );
      if (error) throw error;
      set({ user: { ...current, isPremium: true }, isLoading: false });
      return true;
    } catch (err: any) {
      const msg = err?.message ?? 'Premium purchase failed';
      set({ error: msg, isLoading: false });
      console.error('Premium purchase error:', err);
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
