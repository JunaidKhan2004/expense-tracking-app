import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { retryWithBackoff } from '../utils/retryWithBackoff';
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
  error: string | null;

  hydrate: () => Promise<void>;
  setBudget: (categoryId: string, amount: number) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  getBudgetForCategory: (categoryId: string) => Budget | undefined;
  getBudgetsWithProgress: () => BudgetProgress[];
  clearError: () => void;
}

// Module-level cache — written and read without ever calling Zustand set(),
// so this can safely be called inside a component render.
let _cache: BudgetProgress[] | null = null;
let _cacheKey = '';

function buildCacheKey(budgets: Budget[], txCount: number, month: number): string {
  return `${month}:${txCount}:${budgets.map((b) => `${b.id}=${b.amount}`).join(',')}`;
}

function invalidateCache() {
  _cache = null;
  _cacheKey = '';
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
  budgets: [],
  isLoading: false,
  error: null,

  hydrate: async () => {
    set({ isLoading: true, error: null });
    invalidateCache();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await retryWithBackoff(() =>
        supabase.from('budgets').select('*').eq('user_id', user.id)
      );

      if (error) throw error;

      if (data) {
        invalidateCache();
        set({
          budgets: data.map((b: any) => ({
            id: b.id,
            categoryId: b.category_id,
            amount: Number(b.amount),
            period: b.period,
          })),
        });
      }
    } catch (err: any) {
      set({ error: err?.message ?? 'Failed to load budgets' });
      console.error('Hydrate budgets error:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  setBudget: async (categoryId, amount) => {
    set({ error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const existing = get().budgets.find((b) => b.categoryId === categoryId);

      if (existing) {
        const { data, error } = await retryWithBackoff(() =>
          supabase.from('budgets').update({ amount }).eq('id', existing.id).select().single()
        );
        if (error) throw error;
        if (data) {
          invalidateCache();
          set({
            budgets: get().budgets.map((b) =>
              b.id === existing.id ? { ...b, amount: Number(data.amount) } : b
            ),
          });
        }
      } else {
        const { data, error } = await retryWithBackoff(() =>
          supabase
            .from('budgets')
            .insert([{ user_id: user.id, category_id: categoryId, amount, period: 'month' }])
            .select()
            .single()
        );
        if (error) throw error;
        if (data) {
          invalidateCache();
          set({
            budgets: [
              ...get().budgets,
              { id: data.id, categoryId: data.category_id, amount: Number(data.amount), period: data.period },
            ],
          });
        }
      }
    } catch (err: any) {
      set({ error: err?.message ?? 'Failed to save budget' });
      console.error('Set budget error:', err);
    }
  },

  deleteBudget: async (id) => {
    set({ error: null });
    try {
      const { error } = await retryWithBackoff(() =>
        supabase.from('budgets').delete().eq('id', id)
      );
      if (error) throw error;
      invalidateCache();
      set({ budgets: get().budgets.filter((b) => b.id !== id) });
    } catch (err: any) {
      set({ error: err?.message ?? 'Failed to delete budget' });
      console.error('Delete budget error:', err);
    }
  },

  getBudgetForCategory: (categoryId) => get().budgets.find((b) => b.categoryId === categoryId),

  getBudgetsWithProgress: () => {
    const { budgets } = get();
    const transactions = useTransactionStore.getState().transactions;
    const now = new Date();
    const currentMonth = now.getMonth();

    const cacheKey = buildCacheKey(budgets, transactions.length, currentMonth);
    if (_cache && _cacheKey === cacheKey) {
      return _cache;
    }

    const start = startOfMonth(now);
    const end = endOfMonth(now);

    // Single pass over transactions — O(m) instead of O(n*m)
    const spentByCategory = new Map<string, number>();
    for (const t of transactions) {
      if (t.type !== 'expense') continue;
      const d = parseISO(t.date);
      if (d < start || d > end) continue;
      spentByCategory.set(t.categoryId, (spentByCategory.get(t.categoryId) ?? 0) + t.amount);
    }

    const result = budgets.map((budget) => {
      const spent = spentByCategory.get(budget.categoryId) ?? 0;
      const remaining = Math.max(budget.amount - spent, 0);
      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
      return { ...budget, spent, remaining, percentage };
    });

    // Write to module-level cache — no set() call, safe to call during render
    _cache = result;
    _cacheKey = cacheKey;
    return result;
  },

  clearError: () => set({ error: null }),
}));
