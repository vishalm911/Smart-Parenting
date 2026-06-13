import { create } from 'zustand';
import type { ProgressSummary, WorldProgress } from '../types';

interface ProgressState {
  progress: ProgressSummary | null;
  isLoading: boolean;
  setProgress: (progress: ProgressSummary) => void;
  updateWorldProgress: (world: keyof Omit<ProgressSummary, 'userId' | 'overallProgress' | 'totalActivitiesCompleted' | 'lastUpdated'>, data: Partial<WorldProgress>) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useProgressStore = create<ProgressState>((set) => ({
  progress: null,
  isLoading: false,
  setProgress: (progress) => set({ progress }),
  updateWorldProgress: (world, data) =>
    set((state) => {
      if (!state.progress) return state;
      return {
        progress: {
          ...state.progress,
          [world]: {
            ...state.progress[world],
            ...data,
          },
          lastUpdated: new Date().toISOString(),
        },
      };
    }),
  setLoading: (isLoading) => set({ isLoading }),
}));


