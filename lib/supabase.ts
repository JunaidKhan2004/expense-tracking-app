import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import 'react-native-url-polyfill/auto';

const supabaseUrl = 'https://swilmziiamhyfyggscug.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3aWxtemlpYW1oeWZ5Z2dzY3VnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NTQ0NjYsImV4cCI6MjA5MzAzMDQ2Nn0.JpK1EAlaAbTH8vgJbh_OSBeucxvH-g2-5ktJwTKt4zo';

// SecureStore enforces a 2048-byte limit per key.
// Supabase sessions routinely exceed this, so we chunk large values
// across multiple keys and reassemble them on read.
const CHUNK_SIZE = 1800; // safely under the 2048-byte limit
const CHUNK_COUNT_SUFFIX = '__chunks';

async function setItemChunked(key: string, value: string): Promise<void> {
  if (value.length <= CHUNK_SIZE) {
    // Small enough — single key, clear any old chunks
    await SecureStore.setItemAsync(key, value);
    await SecureStore.deleteItemAsync(`${key}${CHUNK_COUNT_SUFFIX}`);
    return;
  }

  const chunks: string[] = [];
  for (let i = 0; i < value.length; i += CHUNK_SIZE) {
    chunks.push(value.slice(i, i + CHUNK_SIZE));
  }

  await Promise.all(
    chunks.map((chunk, i) => SecureStore.setItemAsync(`${key}.chunk_${i}`, chunk))
  );
  await SecureStore.setItemAsync(`${key}${CHUNK_COUNT_SUFFIX}`, String(chunks.length));
  // Remove the old single-key value if it existed
  await SecureStore.deleteItemAsync(key);
}

async function getItemChunked(key: string): Promise<string | null> {
  const countStr = await SecureStore.getItemAsync(`${key}${CHUNK_COUNT_SUFFIX}`);

  if (!countStr) {
    // Not chunked — read directly
    return SecureStore.getItemAsync(key);
  }

  const count = parseInt(countStr, 10);
  const chunks = await Promise.all(
    Array.from({ length: count }, (_, i) => SecureStore.getItemAsync(`${key}.chunk_${i}`))
  );

  if (chunks.some((c) => c === null)) return null;
  return chunks.join('');
}

async function removeItemChunked(key: string): Promise<void> {
  const countStr = await SecureStore.getItemAsync(`${key}${CHUNK_COUNT_SUFFIX}`);

  if (countStr) {
    const count = parseInt(countStr, 10);
    await Promise.all([
      ...Array.from({ length: count }, (_, i) => SecureStore.deleteItemAsync(`${key}.chunk_${i}`)),
      SecureStore.deleteItemAsync(`${key}${CHUNK_COUNT_SUFFIX}`),
    ]);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}

const ChunkedSecureStoreAdapter = {
  getItem: getItemChunked,
  setItem: setItemChunked,
  removeItem: removeItemChunked,
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ChunkedSecureStoreAdapter as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
