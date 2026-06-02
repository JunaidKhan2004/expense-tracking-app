import { create } from 'zustand';
import { Wallet } from '../types';
import { supabase } from '../lib/supabase';
import { retryWithBackoff } from '../utils/retryWithBackoff';
import { storeEvents } from './storeEvents';
import { useAuthStore } from './useAuthStore';

interface WalletState {
  wallets: Wallet[];
  activeWalletId: string | null;
  isLoading: boolean;
  error: string | null;

  totalBalance: () => number;
  activeWallet: () => Wallet | null;

  hydrate: () => Promise<void>;
  addWallet: (w: Omit<Wallet, 'id'>) => Promise<void>;
  updateWallet: (id: string, data: Partial<Wallet>) => Promise<void>;
  deleteWallet: (id: string) => Promise<void>;
  setActiveWallet: (id: string) => void;
  transferBetweenWallets: (fromId: string, toId: string, amount: number) => Promise<void>;
  adjustBalance: (walletId: string, amount: number, type: 'income' | 'expense') => Promise<void>;
  convertAllWallets: (rate: number) => Promise<void>;
  clearError: () => void;
}

const mapWalletFromDB = (w: any): Wallet => ({
  id: w.id,
  name: w.name,
  type: w.type,
  balance: Number(w.balance),
  currency: w.currency,
  color: w.color,
  icon: w.icon,
  isDefault: w.is_default,
});

const mapWalletToDB = (w: any) => ({
  name: w.name,
  type: w.type,
  balance: w.balance,
  currency: w.currency,
  color: w.color,
  icon: w.icon,
  is_default: w.isDefault,
});

export const useWalletStore = create<WalletState>((set, get) => {
  // Subscribe to transaction:deleted events — reverse wallet balance automatically.
  // Registered once at store creation so there are no dynamic imports anywhere.
  storeEvents.on('transaction:deleted', ({ walletId, amount, type }) => {
    const reverseType = type === 'income' ? 'expense' : 'income';
    useWalletStore.getState().adjustBalance(walletId, amount, reverseType);
  });

  return {
    wallets: [],
    activeWalletId: null,
    isLoading: false,
    error: null,

    totalBalance: () => get().wallets.reduce((sum, w) => sum + w.balance, 0),

    activeWallet: () => {
      const { wallets, activeWalletId } = get();
      return wallets.find((w) => w.id === activeWalletId) ?? wallets[0] ?? null;
    },

    hydrate: async () => {
      set({ isLoading: true, error: null });
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await retryWithBackoff(() =>
          supabase.from('wallets').select('*').eq('user_id', user.id)
        );

        if (error) throw error;

        if (data && data.length > 0) {
          const mappedWallets = data.map((w: any) => {
            const mapped = mapWalletFromDB(w);
            // One-time color migration: old purple → emerald. Batched here, not per-record.
            if (mapped.color === '#7C6FFF') {
              mapped.color = '#408A71';
            }
            return mapped;
          });

          // Batch-update any migrated colors in a single parallel pass
          const toMigrate = (data as any[]).filter((w) => w.color === '#7C6FFF');
          if (toMigrate.length > 0) {
            Promise.all(
              toMigrate.map((w) =>
                supabase.from('wallets').update({ color: '#408A71' }).eq('id', w.id)
              )
            ).catch((err) => console.warn('Color migration error:', err));
          }

          set({
            wallets: mappedWallets,
            activeWalletId: mappedWallets.find((w) => w.isDefault)?.id ?? mappedWallets[0].id,
          });
        } else {
          const { data: newWallet } = await retryWithBackoff(() =>
            supabase
              .from('wallets')
              .insert([{ user_id: user.id, name: 'Main Wallet', type: 'cash', balance: 0, currency: 'USD', color: '#408A71', icon: 'wallet', is_default: true }])
              .select()
              .single()
          );
          if (newWallet) {
            set({ wallets: [mapWalletFromDB(newWallet)], activeWalletId: newWallet.id });
          }
        }
      } catch (err: any) {
        set({ error: err?.message ?? 'Failed to load wallets' });
        console.error('Hydrate wallets error:', err);
      } finally {
        set({ isLoading: false });
      }
    },

    addWallet: async (data) => {
      set({ error: null });
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // Use static import — no dynamic import needed
        const authUser = useAuthStore.getState().user;
        if (authUser && !authUser.isPremium && get().wallets.length >= 1) {
          throw new Error('LIMIT_REACHED');
        }

        const { data: newWallet, error } = await retryWithBackoff(() =>
          supabase.from('wallets').insert([{ ...mapWalletToDB(data), user_id: user.id }]).select().single()
        );

        if (error) throw error;
        if (newWallet) {
          set({ wallets: [...get().wallets, mapWalletFromDB(newWallet)] });
        }
      } catch (err: any) {
        if (err?.message !== 'LIMIT_REACHED') {
          set({ error: err?.message ?? 'Failed to add wallet' });
        }
        throw err;
      }
    },

    updateWallet: async (id, data) => {
      set({ error: null });
      try {
        const { error } = await retryWithBackoff(() =>
          supabase.from('wallets').update(mapWalletToDB(data)).eq('id', id)
        );
        if (error) throw error;
        set({ wallets: get().wallets.map((w) => (w.id === id ? { ...w, ...data } : w)) });
      } catch (err: any) {
        set({ error: err?.message ?? 'Failed to update wallet' });
        console.error('Update wallet error:', err);
      }
    },

    deleteWallet: async (id) => {
      set({ error: null });
      try {
        const { error } = await retryWithBackoff(() =>
          supabase.from('wallets').delete().eq('id', id)
        );
        if (error) throw error;
        set({ wallets: get().wallets.filter((w) => w.id !== id) });
      } catch (err: any) {
        set({ error: err?.message ?? 'Failed to delete wallet' });
        console.error('Delete wallet error:', err);
      }
    },

    setActiveWallet: (id) => set({ activeWalletId: id }),

    transferBetweenWallets: async (fromId, toId, amount) => {
      set({ error: null });
      try {
        const [resFrom, resTo] = await Promise.all([
          retryWithBackoff(() =>
            supabase.rpc('adjust_wallet_balance', { wallet_id: fromId, amount: -amount })
          ),
          retryWithBackoff(() =>
            supabase.rpc('adjust_wallet_balance', { wallet_id: toId, amount })
          ),
        ]);

        if (resFrom.error) throw resFrom.error;
        if (resTo.error) throw resTo.error;

        set({
          wallets: get().wallets.map((w) => {
            if (w.id === fromId) return { ...w, balance: w.balance - amount };
            if (w.id === toId) return { ...w, balance: w.balance + amount };
            return w;
          }),
        });
      } catch (err: any) {
        set({ error: err?.message ?? 'Transfer failed' });
        console.error('Transfer error:', err);
      }
    },

    adjustBalance: async (walletId, amount, type) => {
      const finalAmount = type === 'income' ? amount : -amount;
      const wallet = get().wallets.find((w) => w.id === walletId);
      if (!wallet) return;

      const newBalance = wallet.balance + finalAmount;

      try {
        const { data: updatedWallet, error } = await retryWithBackoff(() =>
          supabase.from('wallets').update({ balance: newBalance }).eq('id', walletId).select().single()
        );
        if (error) throw error;
        if (updatedWallet) {
          set({ wallets: get().wallets.map((w) => (w.id === walletId ? mapWalletFromDB(updatedWallet) : w)) });
        }
      } catch (err: any) {
        console.error('Adjust balance error:', err);
      }
    },

    convertAllWallets: async (rate) => {
      set({ isLoading: true, error: null });
      try {
        const updatedWallets = get().wallets.map((w) => ({
          ...w,
          balance: Number((w.balance * rate).toFixed(2)),
        }));

        set({ wallets: updatedWallets });

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Parallel updates — no sequential loop
          await Promise.all(
            updatedWallets.map((w) =>
              retryWithBackoff(() =>
                supabase.from('wallets').update({ balance: w.balance }).eq('id', w.id)
              )
            )
          );
        }
      } catch (err: any) {
        set({ error: err?.message ?? 'Currency conversion failed' });
        console.error('Convert wallets error:', err);
      } finally {
        set({ isLoading: false });
      }
    },

    clearError: () => set({ error: null }),
  };
});
