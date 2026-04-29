import { create } from 'zustand';
import { Wallet } from '../types';
import { supabase } from '../lib/supabase';

interface WalletState {
  wallets: Wallet[];
  activeWalletId: string | null;
  isLoading: boolean;

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
}

// Mapping helpers
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

export const useWalletStore = create<WalletState>((set, get) => ({
  wallets: [],
  activeWalletId: null,
  isLoading: false,

  totalBalance: () => get().wallets.reduce((sum, w) => sum + w.balance, 0),

  activeWallet: () => {
    const { wallets, activeWalletId } = get();
    return wallets.find((w) => w.id === activeWalletId) ?? wallets[0] ?? null;
  },

  hydrate: async () => {
    set({ isLoading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id);

      if (data && data.length > 0) {
        const mappedWallets = data.map(w => {
          const mapped = mapWalletFromDB(w);
          // Auto-migrate old purple to new emerald
          if (mapped.color === '#7C6FFF') {
            mapped.color = '#408A71';
            // Also update in DB
            supabase.from('wallets').update({ color: '#408A71' }).eq('id', mapped.id).then();
          }
          return mapped;
        });
        set({
          wallets: mappedWallets,
          activeWalletId: mappedWallets.find((w) => w.isDefault)?.id ?? mappedWallets[0].id,
        });
      } else {
        // Create a default wallet if none exist for new user
        const { data: newWallet } = await supabase
          .from('wallets')
          .insert([
            {
              user_id: user.id,
              name: 'Main Wallet',
              type: 'cash',
              balance: 0,
              currency: 'USD',
              color: '#408A71',
              icon: 'wallet',
              is_default: true,
            },
          ])
          .select()
          .single();
        
        if (newWallet) {
          set({ wallets: [mapWalletFromDB(newWallet)], activeWalletId: newWallet.id });
        }
      }
    } catch (err) {
      console.error('Hydrate wallets error:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  addWallet: async (data) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Premium Check: Limit free users to 1 wallet
    const { user: authUser } = (await import('./useAuthStore')).useAuthStore.getState();
    if (authUser && !authUser.isPremium && get().wallets.length >= 1) {
      throw new Error('LIMIT_REACHED');
    }

    const dbData = {
      ...mapWalletToDB(data),
      user_id: user.id,
    };

    const { data: newWallet, error } = await supabase
      .from('wallets')
      .insert([dbData])
      .select()
      .single();

    if (error) {
      console.error('Add wallet error:', error);
      return;
    }

    if (newWallet) {
      set({ wallets: [...get().wallets, mapWalletFromDB(newWallet)] });
    }
  },

  updateWallet: async (id, data) => {
    const dbData = mapWalletToDB(data);
    const { error } = await supabase
      .from('wallets')
      .update(dbData)
      .eq('id', id);

    if (error) {
      console.error('Update wallet error:', error);
      return;
    }

    set({
      wallets: get().wallets.map((w) => (w.id === id ? { ...w, ...data } : w)),
    });
  },

  deleteWallet: async (id) => {
    const { error } = await supabase.from('wallets').delete().eq('id', id);

    if (error) {
      console.error('Delete wallet error:', error);
      return;
    }

    set({
      wallets: get().wallets.filter((w) => w.id !== id),
    });
  },

  setActiveWallet: (id) => set({ activeWalletId: id }),

  transferBetweenWallets: async (fromId, toId, amount) => {
    const { error: errorFrom } = await supabase.rpc('adjust_wallet_balance', {
      wallet_id: fromId,
      amount: -amount
    });
    
    const { error: errorTo } = await supabase.rpc('adjust_wallet_balance', {
      wallet_id: toId,
      amount: amount
    });

    if (!errorFrom && !errorTo) {
      const updated = get().wallets.map((w) => {
        if (w.id === fromId) return { ...w, balance: w.balance - amount };
        if (w.id === toId) return { ...w, balance: w.balance + amount };
        return w;
      });
      set({ wallets: updated });
    }
  },

  adjustBalance: async (walletId, amount, type) => {
    const finalAmount = type === 'income' ? amount : -amount;
    const wallet = get().wallets.find(w => w.id === walletId);
    if (!wallet) return;

    const newBalance = wallet.balance + finalAmount;

    const { data: updatedWallet, error } = await supabase
      .from('wallets')
      .update({ balance: newBalance })
      .eq('id', walletId)
      .select()
      .single();

    if (updatedWallet) {
      set({
        wallets: get().wallets.map((w) => (w.id === walletId ? mapWalletFromDB(updatedWallet) : w)),
      });
    }
  },

  convertAllWallets: async (rate) => {
    set({ isLoading: true });
    try {
      const updatedWallets = get().wallets.map(w => ({
        ...w,
        balance: Number((w.balance * rate).toFixed(2))
      }));

      set({ wallets: updatedWallets });

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        for (const w of updatedWallets) {
          await supabase
            .from('wallets')
            .update({ balance: w.balance })
            .eq('id', w.id);
        }
      }
    } catch (err) {
      console.error('Convert wallets error:', err);
    } finally {
      set({ isLoading: false });
    }
  }
}));
