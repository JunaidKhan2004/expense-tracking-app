import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { retryWithBackoff } from '../utils/retryWithBackoff';
import { SavingGoal } from '../types';

interface GoalState {
  goals: SavingGoal[];
  isLoading: boolean;
  error: string | null;

  hydrate: () => Promise<void>;
  addGoal: (goal: Omit<SavingGoal, 'id'>) => Promise<void>;
  updateGoal: (id: string, data: Partial<SavingGoal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  contribute: (id: string, amount: number) => Promise<void>;
  clearError: () => void;
}

const mapGoalFromDB = (g: any): SavingGoal => ({
  id: g.id,
  name: g.name,
  targetAmount: Number(g.target_amount),
  currentAmount: Number(g.current_amount),
  deadline: g.deadline ?? undefined,
  color: g.color,
  icon: g.icon,
});

export const useGoalStore = create<GoalState>((set, get) => ({
  goals: [],
  isLoading: false,
  error: null,

  hydrate: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await retryWithBackoff(() =>
        supabase.from('goals').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      );

      if (error) throw error;
      set({ goals: (data || []).map(mapGoalFromDB) });
    } catch (err: any) {
      set({ error: err?.message ?? 'Failed to load goals' });
      console.error('Hydrate goals error:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  addGoal: async (goal) => {
    set({ error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await retryWithBackoff(() =>
        supabase
          .from('goals')
          .insert([{
            user_id: user.id,
            name: goal.name,
            target_amount: goal.targetAmount,
            current_amount: goal.currentAmount ?? 0,
            deadline: goal.deadline ?? null,
            color: goal.color,
            icon: goal.icon,
          }])
          .select()
          .single()
      );

      if (error) throw error;
      if (data) set({ goals: [mapGoalFromDB(data), ...get().goals] });
    } catch (err: any) {
      set({ error: err?.message ?? 'Failed to create goal' });
      console.error('Add goal error:', err);
      throw err;
    }
  },

  updateGoal: async (id, data) => {
    set({ error: null });
    try {
      const dbUpdate: Record<string, any> = {};
      if (data.name !== undefined) dbUpdate.name = data.name;
      if (data.targetAmount !== undefined) dbUpdate.target_amount = data.targetAmount;
      if (data.currentAmount !== undefined) dbUpdate.current_amount = data.currentAmount;
      if ('deadline' in data) dbUpdate.deadline = data.deadline ?? null;
      if (data.color !== undefined) dbUpdate.color = data.color;
      if (data.icon !== undefined) dbUpdate.icon = data.icon;

      const { error } = await retryWithBackoff(() =>
        supabase.from('goals').update(dbUpdate).eq('id', id)
      );

      if (error) throw error;
      set({ goals: get().goals.map((g) => (g.id === id ? { ...g, ...data } : g)) });
    } catch (err: any) {
      set({ error: err?.message ?? 'Failed to update goal' });
      console.error('Update goal error:', err);
      throw err;
    }
  },

  deleteGoal: async (id) => {
    set({ error: null });
    try {
      const { error } = await retryWithBackoff(() =>
        supabase.from('goals').delete().eq('id', id)
      );
      if (error) throw error;
      set({ goals: get().goals.filter((g) => g.id !== id) });
    } catch (err: any) {
      set({ error: err?.message ?? 'Failed to delete goal' });
      console.error('Delete goal error:', err);
      throw err;
    }
  },

  contribute: async (id, amount) => {
    const goal = get().goals.find((g) => g.id === id);
    if (!goal) return;
    const newAmount = Math.min(goal.currentAmount + amount, goal.targetAmount);
    await get().updateGoal(id, { currentAmount: newAmount });
  },

  clearError: () => set({ error: null }),
}));
