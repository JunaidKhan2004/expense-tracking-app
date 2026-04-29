import { create } from 'zustand';
import { Transaction, Category, FilterPeriod } from '../types';
import { Storage } from '../utils/storage';
import { DEFAULT_CATEGORIES } from '../constants/categories';
import { generateId, filterTransactionsByPeriod } from '../utils/formatters';

interface TransactionState {
  transactions: Transaction[];
  categories: Category[];
  filterPeriod: FilterPeriod;
  searchQuery: string;
  isLoading: boolean;

  // Computed
  filteredTransactions: () => Transaction[];
  totalIncome: () => number;
  totalExpenses: () => number;
  netBalance: () => number;

  // Actions
  hydrate: () => Promise<void>;
  addTransaction: (t: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  updateTransaction: (id: string, data: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  setFilterPeriod: (period: FilterPeriod) => void;
  setSearchQuery: (q: string) => void;
  addCategory: (cat: Omit<Category, 'id' | 'isCustom'>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  categories: DEFAULT_CATEGORIES,
  filterPeriod: 'month',
  searchQuery: '',
  isLoading: false,

  filteredTransactions: () => {
    const { transactions, filterPeriod, searchQuery } = get();
    let list = filterTransactionsByPeriod(transactions, filterPeriod);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.notes?.toLowerCase().includes(q) ||
          t.categoryId.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  totalIncome: () =>
    get()
      .filteredTransactions()
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0),

  totalExpenses: () =>
    get()
      .filteredTransactions()
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0),

  netBalance: () => get().totalIncome() - get().totalExpenses(),

  hydrate: async () => {
    set({ isLoading: true });
    try {
      const [transactions, categories] = await Promise.all([
        Storage.getItem<Transaction[]>(Storage.KEYS.TRANSACTIONS),
        Storage.getItem<Category[]>(Storage.KEYS.CATEGORIES),
      ]);
      set({
        transactions: transactions ?? SEED_TRANSACTIONS,
        categories: categories ?? DEFAULT_CATEGORIES,
      });
    } catch {
      set({ transactions: SEED_TRANSACTIONS });
    } finally {
      set({ isLoading: false });
    }
  },

  addTransaction: async (data) => {
    const newT: Transaction = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    const updated = [newT, ...get().transactions];
    set({ transactions: updated });
    await Storage.setItem(Storage.KEYS.TRANSACTIONS, updated);
  },

  updateTransaction: async (id, data) => {
    const updated = get().transactions.map((t) => (t.id === id ? { ...t, ...data } : t));
    set({ transactions: updated });
    await Storage.setItem(Storage.KEYS.TRANSACTIONS, updated);
  },

  deleteTransaction: async (id) => {
    const updated = get().transactions.filter((t) => t.id !== id);
    set({ transactions: updated });
    await Storage.setItem(Storage.KEYS.TRANSACTIONS, updated);
  },

  setFilterPeriod: (period) => set({ filterPeriod: period }),
  setSearchQuery: (q) => set({ searchQuery: q }),

  addCategory: async (cat) => {
    const newCat: Category = { ...cat, id: generateId(), isCustom: true };
    const updated = [...get().categories, newCat];
    set({ categories: updated });
    await Storage.setItem(Storage.KEYS.CATEGORIES, updated);
  },

  deleteCategory: async (id) => {
    const updated = get().categories.filter((c) => c.id !== id || !c.isCustom);
    set({ categories: updated });
    await Storage.setItem(Storage.KEYS.CATEGORIES, updated);
  },
}));

// ─── Seed Data (first-launch demo) ───────────────────────────────────────────
const now = new Date();
const d = (daysAgo: number) => {
  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

const SEED_TRANSACTIONS: Transaction[] = [
  { id: 's1', type: 'income', amount: 5000, categoryId: 'salary', walletId: 'w1', title: 'Monthly Salary', date: d(1), createdAt: d(1), isRecurring: true, recurringPeriod: 'monthly' },
  { id: 's2', type: 'expense', amount: 120, categoryId: 'food', walletId: 'w1', title: 'Grocery Shopping', date: d(1), createdAt: d(1), isRecurring: false },
  { id: 's3', type: 'expense', amount: 45, categoryId: 'transport', walletId: 'w1', title: 'Uber Rides', date: d(2), createdAt: d(2), isRecurring: false },
  { id: 's4', type: 'expense', amount: 89, categoryId: 'entertainment', walletId: 'w1', title: 'Netflix + Spotify', notes: 'Monthly subscriptions', date: d(3), createdAt: d(3), isRecurring: true, recurringPeriod: 'monthly' },
  { id: 's5', type: 'income', amount: 750, categoryId: 'freelance', walletId: 'w1', title: 'Freelance Project', notes: 'Website design', date: d(4), createdAt: d(4), isRecurring: false },
  { id: 's6', type: 'expense', amount: 320, categoryId: 'bills', walletId: 'w1', title: 'Electricity Bill', date: d(5), createdAt: d(5), isRecurring: true, recurringPeriod: 'monthly' },
  { id: 's7', type: 'expense', amount: 250, categoryId: 'shopping', walletId: 'w1', title: 'New Sneakers', date: d(6), createdAt: d(6), isRecurring: false },
  { id: 's8', type: 'expense', amount: 55, categoryId: 'health', walletId: 'w1', title: 'Pharmacy', date: d(7), createdAt: d(7), isRecurring: false },
  { id: 's9', type: 'income', amount: 200, categoryId: 'bonus', walletId: 'w1', title: 'Performance Bonus', date: d(8), createdAt: d(8), isRecurring: false },
  { id: 's10', type: 'expense', amount: 180, categoryId: 'food', walletId: 'w1', title: 'Restaurant Dinner', notes: 'Family outing', date: d(9), createdAt: d(9), isRecurring: false },
  { id: 's11', type: 'expense', amount: 1200, categoryId: 'housing', walletId: 'w1', title: 'Monthly Rent', date: d(10), createdAt: d(10), isRecurring: true, recurringPeriod: 'monthly' },
  { id: 's12', type: 'expense', amount: 30, categoryId: 'education', walletId: 'w1', title: 'Online Course', date: d(12), createdAt: d(12), isRecurring: false },
];
