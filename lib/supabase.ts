import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import 'react-native-url-polyfill/auto';

// ⚠️ Replace these with your actual Supabase project credentials
const supabaseUrl = 'https://swilmziiamhyfyggscug.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3aWxtemlpYW1oeWZ5Z2dzY3VnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NTQ0NjYsImV4cCI6MjA5MzAzMDQ2Nn0.JpK1EAlaAbTH8vgJbh_OSBeucxvH-g2-5ktJwTKt4zo';

// Custom storage for Supabase to persist auth session securely in Expo
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    return SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
