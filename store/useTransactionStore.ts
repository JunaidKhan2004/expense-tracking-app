import { create } from 'zustand';
import { DEFAULT_CATEGORIES } from '../constants/categories';
import { supabase } from '../lib/supabase';
import { Category, FilterPeriod, Transaction } from '../types';
import { filterTransactionsByPeriod } from '../utils/formatters';

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
  convertAllTransactions: (rate: number) => Promise<void>;
}

// Helper to map DB row to App object
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

// Helper to map App object to DB row
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [txResult, catResult] = await Promise.all([
        supabase.from('transactions').select('*').eq('user_id', user.id).order('date', { ascending: false }),
        supabase.from('categories').select('*').eq('user_id', user.id),
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
    } catch (err) {
      console.error('Hydrate transactions error:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  addTransaction: async (data) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const dbData = {
      ...mapTxToDB(data),
      user_id: user.id,
    };

    const { data: newTx, error } = await supabase
      .from('transactions')
      .insert([dbData])
      .select()
      .single();

    if (error) {
      console.error('Add transaction error:', error);
      return;
    }

    if (newTx) {
      const tx = mapTxFromDB(newTx);
      set({ transactions: [tx, ...get().transactions] });

      // Notifications logic
      const { getBudgetsWithProgress } = (await import('./useBudgetStore')).useBudgetStore.getState();
      const { addNotification } = (await import('./useNotificationStore')).useNotificationStore.getState();
      const { sendLocalNotification } = await import('../utils/notifications');
      const { settings } = (await import('./useSettingsStore')).useSettingsStore.getState();

      if (settings.notificationsEnabled) {
        // 1. General Transaction Notification
        const txTitle = tx.type === 'income' ? 'Income Received!' : 'Expense Tracked';
        const txBody = `${tx.title}: ${tx.amount}`;
        await sendLocalNotification(txTitle, txBody);
        await addNotification(txTitle, txBody, 'transaction');

        // 2. Budget Alerts (Only for Expenses)
        if (tx.type === 'expense' && settings.budgetAlerts) {
          const budget = getBudgetsWithProgress().find(b => b.categoryId === tx.categoryId);
          if (budget) {
            if (budget.percentage >= 100) {
              const title = 'Budget Exceeded!';
              const body = `You've spent ${Math.round(budget.percentage)}% of your budget for this category.`;
              await sendLocalNotification(title, body);
              await addNotification(title, body, 'budget');
            } else if (budget.percentage >= 80) {
              const title = 'Budget Alert';
              const body = `You've used ${Math.round(budget.percentage)}% of your budget for this category.`;
              await sendLocalNotification(title, body);
              await addNotification(title, body, 'budget');
            }
          }
        }
      }
    }
  },

  updateTransaction: async (id, data) => {
    const dbData = mapTxToDB(data);
    const { error } = await supabase
      .from('transactions')
      .update(dbData)
      .eq('id', id);

    if (error) {
      console.error('Update transaction error:', error);
      return;
    }

    set({
      transactions: get().transactions.map((t) => (t.id === id ? { ...t, ...data } : t)),
    });
  },

  deleteTransaction: async (id) => {
    const transaction = get().transactions.find(t => t.id === id);
    if (!transaction) return;

    const { error } = await supabase.from('transactions').delete().eq('id', id);

    if (error) {
      console.error('Delete transaction error:', error);
      return;
    }

    // Reverse balance adjustment
    const { adjustBalance } = (await import('./useWalletStore')).useWalletStore.getState();
    const reverseType = transaction.type === 'income' ? 'expense' : 'income';
    await adjustBalance(transaction.walletId, transaction.amount, reverseType);

    set({
      transactions: get().transactions.filter((t) => t.id !== id),
    });
  },

  setFilterPeriod: (period) => set({ filterPeriod: period }),
  setSearchQuery: (q) => set({ searchQuery: q }),

  addCategory: async (cat) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: newCat, error } = await supabase
      .from('categories')
      .insert([
        {
          name: cat.name,
          icon: cat.icon,
          color: cat.color,
          type: cat.type,
          user_id: user.id,
          is_custom: true,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Add category error:', error);
      return;
    }

    if (newCat) {
      set({
        categories: [
          ...get().categories,
          {
            id: newCat.id,
            name: newCat.name,
            icon: newCat.icon,
            color: newCat.color,
            type: newCat.type,
            isCustom: newCat.is_custom,
          },
        ],
      });
    }
  },

  deleteCategory: async (id) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);

    if (error) {
      console.error('Delete category error:', error);
      return;
    }

    set({
      categories: get().categories.filter((c) => c.id !== id),
    });
  },

  convertAllTransactions: async (rate) => {
    set({ isLoading: true });
    try {
      const updatedTransactions = get().transactions.map(t => ({
        ...t,
        amount: Number((t.amount * rate).toFixed(2))
      }));

      // Update state
      set({ transactions: updatedTransactions });

      // Update in Supabase (Batch update is not directly supported via Supabase Client easily, 
      // but we can loop or use a custom function. For now, we'll use a loop or assume users don't have thousands yet)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // This is a bit slow but safe for now. 
        // A better way would be an RPC call: select convert_all_transactions(rate, user_id)
        for (const t of updatedTransactions) {
          await supabase
            .from('transactions')
            .update({ amount: t.amount })
            .eq('id', t.id);
        }
      }
    } catch (err) {
      console.error('Convert transactions error:', err);
    } finally {
      set({ isLoading: false });
    }
  }
}));
