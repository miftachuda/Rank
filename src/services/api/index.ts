import { ScoreApi, Manpower, ManpowerScore } from '../../types';
import { mockApis, mockManpower, mockManpowerScores } from '../../data/mock';

const IS_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true';

// Delay helper to simulate network requests
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchApis = async (): Promise<ScoreApi[]> => {
  if (IS_MOCK) {
    await delay(500);
    return mockApis;
  }
  // Real implementation
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/apis`);
  return response.json();
};

export const fetchManpower = async (): Promise<Manpower[]> => {
  if (IS_MOCK) {
    await delay(300);
    return mockManpower;
  }
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/manpower`);
  return response.json();
};

export const fetchManpowerScores = async (): Promise<ManpowerScore[]> => {
  if (IS_MOCK) {
    await delay(600);
    return mockManpowerScores;
  }
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/scores`);
  return response.json();
};

export const saveApiWeights = async (weights: Record<string, number>): Promise<boolean> => {
  if (IS_MOCK) {
    await delay(800);
    return true;
  }
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/apis/weights`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ weights }),
  });
  return response.ok;
};
