import { create } from 'zustand';

interface AppState {
  isHydrating: boolean;
  setIsHydrating: (value: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isHydrating: true,
  setIsHydrating: (value) => set({ isHydrating: value }),
}));
