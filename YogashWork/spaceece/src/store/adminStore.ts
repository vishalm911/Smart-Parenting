import { create } from 'zustand';
import type { CognitiveGame, CreativityActivity, EmotionScenario, AdminStats, UploadedAsset, User, CognitiveScore, EmotionScore } from '../types';

interface AdminState {
  // Games
  games: CognitiveGame[];
  selectedGame: CognitiveGame | null;
  
  // Activities
  activities: CreativityActivity[];
  selectedActivity: CreativityActivity | null;
  
  // Emotion Scenarios
  scenarios: EmotionScenario[];
  selectedScenario: EmotionScenario | null;
  
  // Assets
  assets: UploadedAsset[];
  
  // Users & Scores
  users: User[];
  cognitiveScores: CognitiveScore[];
  emotionScores: EmotionScore[];
  
  // Stats
  stats: AdminStats | null;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Actions - Games
  setGames: (games: CognitiveGame[]) => void;
  addGame: (game: CognitiveGame) => void;
  updateGame: (id: string, game: Partial<CognitiveGame>) => void;
  deleteGame: (id: string) => void;
  selectGame: (game: CognitiveGame | null) => void;
  
  // Actions - Activities
  setActivities: (activities: CreativityActivity[]) => void;
  addActivity: (activity: CreativityActivity) => void;
  updateActivity: (id: string, activity: Partial<CreativityActivity>) => void;
  deleteActivity: (id: string) => void;
  selectActivity: (activity: CreativityActivity | null) => void;
  
  // Actions - Scenarios
  setScenarios: (scenarios: EmotionScenario[]) => void;
  addScenario: (scenario: EmotionScenario) => void;
  updateScenario: (id: string, scenario: Partial<EmotionScenario>) => void;
  deleteScenario: (id: string) => void;
  selectScenario: (scenario: EmotionScenario | null) => void;
  
  // Actions - Assets
  setAssets: (assets: UploadedAsset[]) => void;
  addAsset: (asset: UploadedAsset) => void;
  deleteAsset: (id: string) => void;
  
  // Actions - Users & Scores
  setUsers: (users: User[]) => void;
  setCognitiveScores: (scores: CognitiveScore[]) => void;
  setEmotionScores: (scores: EmotionScore[]) => void;
  
  // Actions - Stats
  setStats: (stats: AdminStats) => void;
  
  // Actions - General
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  // Initial state
  games: [],
  selectedGame: null,
  activities: [],
  selectedActivity: null,
  scenarios: [],
  selectedScenario: null,
  assets: [],
  users: [],
  cognitiveScores: [],
  emotionScores: [],
  stats: null,
  isLoading: false,
  error: null,
  
  // Games actions
  setGames: (games) => set({ games }),
  addGame: (game) => set((state) => ({ games: [...state.games, game] })),
  updateGame: (id, updatedGame) =>
    set((state) => ({
      games: state.games.map((g) => (g.id === id ? { ...g, ...updatedGame } : g)),
    })),
  deleteGame: (id) =>
    set((state) => ({
      games: state.games.filter((g) => g.id !== id),
    })),
  selectGame: (game) => set({ selectedGame: game }),
  
  // Activities actions
  setActivities: (activities) => set({ activities }),
  addActivity: (activity) =>
    set((state) => ({ activities: [...state.activities, activity] })),
  updateActivity: (id, updatedActivity) =>
    set((state) => ({
      activities: state.activities.map((a) =>
        a.id === id ? { ...a, ...updatedActivity } : a
      ),
    })),
  deleteActivity: (id) =>
    set((state) => ({
      activities: state.activities.filter((a) => a.id !== id),
    })),
  selectActivity: (activity) => set({ selectedActivity: activity }),
  
  // Scenarios actions
  setScenarios: (scenarios) => set({ scenarios }),
  addScenario: (scenario) =>
    set((state) => ({ scenarios: [...state.scenarios, scenario] })),
  updateScenario: (id, updatedScenario) =>
    set((state) => ({
      scenarios: state.scenarios.map((s) =>
        s.id === id ? { ...s, ...updatedScenario } : s
      ),
    })),
  deleteScenario: (id) =>
    set((state) => ({
      scenarios: state.scenarios.filter((s) => s.id !== id),
    })),
  selectScenario: (scenario) => set({ selectedScenario: scenario }),
  
  // Assets actions
  setAssets: (assets) => set({ assets }),
  addAsset: (asset) => set((state) => ({ assets: [...state.assets, asset] })),
  deleteAsset: (id) =>
    set((state) => ({
      assets: state.assets.filter((a) => a.id !== id),
    })),
  
  // Users & Scores actions
  setUsers: (users) => set({ users }),
  setCognitiveScores: (scores) => set({ cognitiveScores: scores }),
  setEmotionScores: (scores) => set({ emotionScores: scores }),
  
  // Stats actions
  setStats: (stats) => set({ stats }),
  
  // General actions
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      games: [],
      selectedGame: null,
      activities: [],
      selectedActivity: null,
      scenarios: [],
      selectedScenario: null,
      assets: [],
      users: [],
      cognitiveScores: [],
      emotionScores: [],
      stats: null,
      isLoading: false,
      error: null,
    }),
}));
