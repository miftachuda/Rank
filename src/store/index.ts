import { create } from 'zustand';
import { ScoreApi, Manpower, ManpowerScore } from '../types';
import { fetchApis, fetchManpower, fetchManpowerScores, saveApiWeights } from '../services/api';

interface AppState {
  apis: ScoreApi[];
  manpower: Manpower[];
  scores: ManpowerScore[];
  isLoading: boolean;
  error: string | null;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  loadData: () => Promise<void>;
  updateWeights: (weights: Record<string, number>) => Promise<void>;
  recalculateScores: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  apis: [],
  manpower: [],
  scores: [],
  isLoading: false,
  error: null,
  theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',

  toggleTheme: () => {
    const newTheme = get().theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ theme: newTheme });
  },

  loadData: async () => {
    set({ isLoading: true, error: null });
    try {
      const [apis, manpower, scores] = await Promise.all([
        fetchApis(),
        fetchManpower(),
        fetchManpowerScores()
      ]);
      set({ apis, manpower, scores, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to load data', isLoading: false });
    }
  },

  updateWeights: async (weights: Record<string, number>) => {
    try {
      await saveApiWeights(weights);
      const apis = get().apis.map(api => ({
        ...api,
        weight: weights[api.id] !== undefined ? weights[api.id] : api.weight
      }));
      set({ apis });
      get().recalculateScores();
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update weights');
    }
  },

  recalculateScores: () => {
    const { apis, scores } = get();
    
    const newScores = scores.map(ms => {
      let overall = 0;
      apis.forEach(api => {
        if (ms.apiScores[api.id]) {
          overall += ms.apiScores[api.id] * api.weight;
        }
      });
      return {
        ...ms,
        overallScore: Math.round(overall * 10) / 10
      };
    }).sort((a, b) => b.overallScore - a.overallScore);

    set({ scores: newScores });
  }
}));
