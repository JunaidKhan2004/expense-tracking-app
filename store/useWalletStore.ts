import { create } from 'zustand';
import { Wallet } from '../types';
import { Storage } from '../utils/storage';
import { generateId } from '../utils/formatters';

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
}

const DEFAULT_WALLETS: Wallet[] = [
  { id: 'w1', name: 'Main Account', type: 'bank', balance: 6305, currency: 'USD', color: '#7C6FFF', icon: 'card', isDefault: true },
  { id: 'w2', name: 'Cash Wallet', type: 'cash', balance: 380, currency: 'USD', color: '#00D9A0', icon: 'cash', isDefault: false },
  { id: 'w3', name: 'Credit Card', type: 'card', balance: 1200, currency: 'USD', color: '#FF6B8A', icon: 'card', isDefault: false },
];

export const useWalletStore = create<WalletState>((set, get) => ({
  wallets: DEFAULT_WALLETS,
  activeWalletId: 'w1',
  isLoading: false,

  totalBalance: () => get().wallets.reduce((sum, w) => sum + w.balance, 0),

  activeWallet: () => {
    const { wallets, activeWalletId } = get();
    return wallets.find((w) => w.id === activeWalletId) ?? wallets[0] ?? null;
  },

  hydrate: async () => {
    set({ isLoading: true });
    try {
      const wallets = await Storage.getItem<Wallet[]>(Storage.KEYS.WALLETS);
      if (wallets && wallets.length > 0) {
        set({ wallets, activeWalletId: wallets.find((w) => w.isDefault)?.id ?? wallets[0].id });
      }
    } catch {
      // keep defaults
    } finally {
      set({ isLoading: false });
    }
  },

  addWallet: async (data) => {
    const newWallet: Wallet = { ...data, id: generateId() };
    const updated = [...get().wallets, newWallet];
    set({ wallets: updated });
    await Storage.setItem(Storage.KEYS.WALLETS, updated);
  },

  updateWallet: async (id, data) => {
    const updated = get().wallets.map((w) => (w.id === id ? { ...w, ...data } : w));
    set({ wallets: updated });
    await Storage.setItem(Storage.KEYS.WALLETS, updated);
  },

  deleteWallet: async (id) => {
    const updated = get().wallets.filter((w) => w.id !== id);
    set({ wallets: updated });
    await Storage.setItem(Storage.KEYS.WALLETS, updated);
  },

  setActiveWallet: (id) => set({ activeWalletId: id }),

  transferBetweenWallets: async (fromId, toId, amount) => {
    const updated = get().wallets.map((w) => {
      if (w.id === fromId) return { ...w, balance: w.balance - amount };
      if (w.id === toId) return { ...w, balance: w.balance + amount };
      return w;
    });
    set({ wallets: updated });
    await Storage.setItem(Storage.KEYS.WALLETS, updated);
  },

  adjustBalance: async (walletId, amount, type) => {
    const updated = get().wallets.map((w) => {
      if (w.id !== walletId) return w;
      return { ...w, balance: type === 'income' ? w.balance + amount : w.balance - amount };
    });
    set({ wallets: updated });
    await Storage.setItem(Storage.KEYS.WALLETS, updated);
  },
}));
