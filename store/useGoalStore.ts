import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { SavingGoal } from '../types';

interface GoalState {
  goals: SavingGoal[];
  isLoading: boolean;
  
  // Actions
  hydrate: () => Promise<void>;
  addGoal: (goal: Omit<SavingGoal, 'id'>) => Promise<void>;
  updateGoal: (id: string, data: Partial<SavingGoal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  contribute: (id: string, amount: number) => Promise<void>;
}

export const useGoalStore = create<GoalState>((set, get) => ({
  goals: [],
  isLoading: false,

  hydrate: async () => {
    set({ isLoading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({
        goals: (data || []).map((g: any) => ({
          id: g.id,
          name: g.name,
          targetAmount: Number(g.target_amount),
          currentAmount: Number(g.current_amount),
          deadline: g.deadline,
          color: g.color,
          icon: g.icon,
        })),
      });
    } catch (err) {
      console.error('Hydrate goals error:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  addGoal: async (goal) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('goals')
        .insert([{
          user_id: user.id,
          name: goal.name,
          target_amount: goal.targetAmount,
          current_amount: goal.currentAmount || 0,
          deadline: goal.deadline,
          color: goal.color,
          icon: goal.icon,
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newGoal: SavingGoal = {
          id: data.id,
          name: data.name,
          targetAmount: Number(data.target_amount),
          currentAmount: Number(data.current_amount),
          deadline: data.deadline,
          color: data.color,
          icon: data.icon,
        };
        set({ goals: [newGoal, ...get().goals] });
      }
    } catch (err) {
      console.error('Add goal error:', err);
    }
  },

  updateGoal: async (id, data) => {
    try {
      const dbUpdate: any = {};
      if (data.name) dbUpdate.name = data.name;
      if (data.targetAmount !== undefined) dbUpdate.target_amount = data.targetAmount;
      if (data.currentAmount !== undefined) dbUpdate.current_amount = data.currentAmount;
      if (data.deadline) dbUpdate.deadline = data.deadline;
      if (data.color) dbUpdate.color = data.color;
      if (data.icon) dbUpdate.icon = data.icon;

      const { error } = await supabase
        .from('goals')
        .update(dbUpdate)
        .eq('id', id);

      if (error) throw error;

      set({
        goals: get().goals.map((g) => (g.id === id ? { ...g, ...data } : g)),
      });
    } catch (err) {
      console.error('Update goal error:', err);
    }
  },

  deleteGoal: async (id) => {
    try {
      const { error } = await supabase.from('goals').delete().eq('id', id);
      if (error) throw error;

      set({
        goals: get().goals.filter((g) => g.id !== id),
      });
    } catch (err) {
      console.error('Delete goal error:', err);
    }
  },

  contribute: async (id, amount) => {
    const goal = get().goals.find((g) => g.id === id);
    if (!goal) return;

    const newAmount = goal.currentAmount + amount;
    await get().updateGoal(id, { currentAmount: newAmount });
  },
}));
