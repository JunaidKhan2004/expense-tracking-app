import { create } from 'zustand';
import { DEFAULT_CATEGORIES } from '../constants/categories';
import { supabase } from '../lib/supabase';
import { retryWithBackoff } from '../utils/retryWithBackoff';
import { Category, FilterPeriod, Transaction } from '../types';
import { filterTransactionsByPeriod } from '../utils/formatters';
import { storeEvents } from './storeEvents';

interface TransactionState {
  transactions: Transaction[];
  categories: Category[];
  filterPeriod: FilterPeriod;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;

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
  convertAllTransactions: (rate: number) => Promise<void>;
  clearError: () => void;
}

const mapTxFromDB = (dbTx: any): Transaction => ({
  id: dbTx.id,
  type: dbTx.type,
  amount: Number(dbTx.amount),
  categoryId: dbTx.category_id,
  walletId: dbTx.wallet_id,
  title: dbTx.title,
  date: dbTx.date,
  notes: dbTx.notes,
  isRecurring: dbTx.is_recurring,
  recurringPeriod: dbTx.recurring_period,
  createdAt: dbTx.created_at,
});

const mapTxToDB = (tx: any) => ({
  type: tx.type,
  amount: tx.amount,
  category_id: tx.categoryId,
  wallet_id: tx.walletId,
  title: tx.title,
  date: tx.date,
  notes: tx.notes,
  is_recurring: tx.isRecurring,
  recurring_period: tx.recurringPeriod,
});

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  categories: DEFAULT_CATEGORIES,
  filterPeriod: 'month',
  searchQuery: '',
  isLoading: false,
  error: null,

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
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [txResult, catResult] = await Promise.all([
        retryWithBackoff(() =>
          supabase.from('transactions').select('*').eq('user_id', user.id).order('date', { ascending: false })
        ),
        retryWithBackoff(() =>
          supabase.from('categories').select('*').eq('user_id', user.id)
        ),
      ]);

      set({
        transactions: (txResult.data || []).map(mapTxFromDB),
        categories: [
          ...DEFAULT_CATEGORIES,
          ...(catResult.data || []).map((c: any) => ({
            id: c.id,
            name: c.name,
            icon: c.icon,
            color: c.color,
            type: c.type,
            isCustom: c.is_custom,
          })),
        ],
      });
    } catch (err: any) {
      const msg = err?.message ?? 'Failed to load transactions';
      set({ error: msg });
      console.error('Hydrate transactions error:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  addTransaction: async (data) => {
    set({ error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const dbData = { ...mapTxToDB(data), user_id: user.id };

      const { data: newTx, error } = await retryWithBackoff(() =>
        supabase.from('transactions').insert([dbData]).select().single()
      );

      if (error) throw error;

      if (newTx) {
        const tx = mapTxFromDB(newTx);
        set({ transactions: [tx, ...get().transactions] });

        // Notify other stores via event bus — no dynamic imports needed
        storeEvents.emit('transaction:added', tx);
      }
    } catch (err: any) {
      const msg = err?.message ?? 'Failed to add transaction';
      set({ error: msg });
      console.error('Add transaction error:', err);
      throw err;
    }
  },

  updateTransaction: async (id, data) => {
    set({ error: null });
    try {
      const dbData = mapTxToDB(data);
      const { error } = await retryWithBackoff(() =>
        supabase.from('transactions').update(dbData).eq('id', id)
      );

      if (error) throw error;

      set({
        transactions: get().transactions.map((t) => (t.id === id ? { ...t, ...data } : t)),
      });
    } catch (err: any) {
      const msg = err?.message ?? 'Failed to update transaction';
      set({ error: msg });
      console.error('Update transaction error:', err);
      throw err;
    }
  },

  deleteTransaction: async (id) => {
    set({ error: null });
    const transaction = get().transactions.find((t) => t.id === id);
    if (!transaction) return;

    try {
      const { error } = await retryWithBackoff(() =>
        supabase.from('transactions').delete().eq('id', id)
      );

      if (error) throw error;

      set({ transactions: get().transactions.filter((t) => t.id !== id) });

      // Emit event so wallet store can reverse the balance — no dynamic import
      storeEvents.emit('transaction:deleted', {
        id,
        walletId: transaction.walletId,
        amount: transaction.amount,
        type: transaction.type,
      });
    } catch (err: any) {
      const msg = err?.message ?? 'Failed to delete transaction';
      set({ error: msg });
      console.error('Delete transaction error:', err);
      throw err;
    }
  },

  setFilterPeriod: (period) => set({ filterPeriod: period }),
  setSearchQuery: (q) => set({ searchQuery: q }),

  addCategory: async (cat) => {
    set({ error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: newCat, error } = await retryWithBackoff(() =>
        supabase
          .from('categories')
          .insert([{ name: cat.name, icon: cat.icon, color: cat.color, type: cat.type, user_id: user.id, is_custom: true }])
          .select()
          .single()
      );

      if (error) throw error;

      if (newCat) {
        set({
          categories: [
            ...get().categories,
            { id: newCat.id, name: newCat.name, icon: newCat.icon, color: newCat.color, type: newCat.type, isCustom: newCat.is_custom },
          ],
        });
      }
    } catch (err: any) {
      const msg = err?.message ?? 'Failed to add category';
      set({ error: msg });
      console.error('Add category error:', err);
      throw err;
    }
  },

  deleteCategory: async (id) => {
    set({ error: null });
    try {
      const { error } = await retryWithBackoff(() =>
        supabase.from('categories').delete().eq('id', id)
      );

      if (error) throw error;

      set({ categories: get().categories.filter((c) => c.id !== id) });
    } catch (err: any) {
      const msg = err?.message ?? 'Failed to delete category';
      set({ error: msg });
      console.error('Delete category error:', err);
      throw err;
    }
  },

  convertAllTransactions: async (rate) => {
    set({ isLoading: true, error: null });
    try {
      const updatedTransactions = get().transactions.map((t) => ({
        ...t,
        amount: Number((t.amount * rate).toFixed(2)),
      }));

      set({ transactions: updatedTransactions });

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Run all updates in parallel instead of sequentially
        await Promise.all(
          updatedTransactions.map((t) =>
            retryWithBackoff(() =>
              supabase.from('transactions').update({ amount: t.amount }).eq('id', t.id)
            )
          )
        );
      }
    } catch (err: any) {
      const msg = err?.message ?? 'Currency conversion failed';
      set({ error: msg });
      console.error('Convert transactions error:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
