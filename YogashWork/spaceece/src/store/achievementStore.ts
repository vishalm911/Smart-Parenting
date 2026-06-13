import { create } from 'zustand';
import type { Achievement } from '../types';

interface AchievementState {
  achievements: Achievement[];
  isLoading: boolean;
  setAchievements: (achievements: Achievement[]) => void;
  addAchievement: (achievement: Achievement) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAchievementStore = create<AchievementState>((set) => ({
  achievements: [],
  isLoading: false,
  setAchievements: (achievements) => set({ achievements }),
  addAchievement: (achievement) =>
    set((state) => ({
      achievements: [...state.achievements, achievement],
    })),
  setLoading: (isLoading) => set({ isLoading }),
}));
