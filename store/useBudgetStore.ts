import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useTransactionStore } from './useTransactionStore';
import { startOfMonth, endOfMonth, parseISO } from 'date-fns';

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  period: 'month' | 'year';
}

export interface BudgetProgress extends Budget {
  spent: number;
  remaining: number;
  percentage: number;
}

interface BudgetState {
  budgets: Budget[];
  isLoading: boolean;

  hydrate: () => Promise<void>;
  setBudget: (categoryId: string, amount: number) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  getBudgetForCategory: (categoryId: string) => Budget | undefined;
  getBudgetsWithProgress: () => BudgetProgress[];
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
  budgets: [],
  isLoading: false,

  hydrate: async () => {
    set({ isLoading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id);

      if (data) {
        set({
          budgets: data.map((b) => ({
            id: b.id,
            categoryId: b.category_id,
            amount: Number(b.amount),
            period: b.period,
          })),
        });
      }
    } catch (err) {
      console.error('Hydrate budgets error:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  setBudget: async (categoryId, amount) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const existing = get().budgets.find((b) => b.categoryId === categoryId);

    if (existing) {
      const { data, error } = await supabase
        .from('budgets')
        .update({ amount })
        .eq('id', existing.id)
        .select()
        .single();

      if (data) {
        set({
          budgets: get().budgets.map((b) =>
            b.id === existing.id ? { ...b, amount: Number(data.amount) } : b
          ),
        });
      }
    } else {
      const { data, error } = await supabase
        .from('budgets')
        .insert([
          {
            user_id: user.id,
            category_id: categoryId,
            amount,
            period: 'month',
          },
        ])
        .select()
        .single();

      if (data) {
        set({
          budgets: [
            ...get().budgets,
            {
              id: data.id,
              categoryId: data.category_id,
              amount: Number(data.amount),
              period: data.period,
            },
          ],
        });
      }
    }
  },

  deleteBudget: async (id) => {
    const { error } = await supabase.from('budgets').delete().eq('id', id);
    if (!error) {
      set({ budgets: get().budgets.filter((b) => b.id !== id) });
    }
  },

  getBudgetForCategory: (categoryId) => {
    return get().budgets.find((b) => b.categoryId === categoryId);
  },

  getBudgetsWithProgress: () => {
    const { budgets } = get();
    const transactions = useTransactionStore.getState().transactions;
    
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);

    return budgets.map(budget => {
      const spent = transactions
        .filter(t => 
          t.type === 'expense' && 
          t.categoryId === budget.categoryId &&
          parseISO(t.date) >= start &&
          parseISO(t.date) <= end
        )
        .reduce((sum, t) => sum + t.amount, 0);

      const remaining = Math.max(budget.amount - spent, 0);
      const percentage = (spent / budget.amount) * 100;

      return {
        ...budget,
        spent,
        remaining,
        percentage
      };
    });
  }
}));
