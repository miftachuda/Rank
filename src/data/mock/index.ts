import { ScoreApi, Manpower, ManpowerScore } from '../../types';

export const mockApis: ScoreApi[] = [
  {
    id: 'attendance',
    name: 'Attendance',
    description: 'Tracks employee presence, punctuality, and leaves.',
    endpoint: '/api/v1/attendance',
    status: 'healthy',
    weight: 0.40,
    enabled: true,
    lastUpdated: new Date().toISOString(),
    responseTime: 120,
    parameters: []
  },
  {
    id: 'boc',
    name: 'BOC',
    description: 'BOC Reports Scoring.',
    endpoint: '/api/v1/boc',
    status: 'healthy',
    weight: 0.30,
    enabled: true,
    lastUpdated: new Date().toISOString(),
    responseTime: 200,
    parameters: []
  },
  {
    id: 'peka',
    name: 'PEKA',
    description: 'PEKA Observation Scoring.',
    endpoint: '/api/v1/peka',
    status: 'healthy',
    weight: 0.20,
    enabled: true,
    lastUpdated: new Date().toISOString(),
    responseTime: 150,
    parameters: []
  },
  {
    id: 'learning',
    name: 'Learning Hours',
    description: 'Manual tracking of learning hours per employee.',
    endpoint: '/api/v1/learning',
    status: 'healthy',
    weight: 0.10,
    enabled: true,
    lastUpdated: new Date().toISOString(),
    responseTime: 50,
    parameters: []
  }
];

export const mockManpower: Manpower[] = [
  { id: 'mp_1', name: 'Ahmad Siregar', employeeId: 'EMP001', department: 'Production', position: 'Senior Operator', avatar: 'https://i.pravatar.cc/150?u=mp_1' },
  { id: 'mp_2', name: 'Budi Santoso', employeeId: 'EMP002', department: 'Engineering', position: 'Maintenance Tech', avatar: 'https://i.pravatar.cc/150?u=mp_2' },
  { id: 'mp_3', name: 'Citra Kirana', employeeId: 'EMP003', department: 'Operations', position: 'Supervisor', avatar: 'https://i.pravatar.cc/150?u=mp_3' },
  { id: 'mp_4', name: 'Dedi Kurniawan', employeeId: 'EMP004', department: 'Maintenance', position: 'Mechanic', avatar: 'https://i.pravatar.cc/150?u=mp_4' },
  { id: 'mp_5', name: 'Eka Putri', employeeId: 'EMP005', department: 'Safety', position: 'Safety Officer', avatar: 'https://i.pravatar.cc/150?u=mp_5' },
  { id: 'mp_6', name: 'Fajar Nugroho', employeeId: 'EMP006', department: 'Production', position: 'Operator', avatar: 'https://i.pravatar.cc/150?u=mp_6' },
  { id: 'mp_7', name: 'Gita Saraswati', employeeId: 'EMP007', department: 'Quality', position: 'QC Inspector', avatar: 'https://i.pravatar.cc/150?u=mp_7' },
  { id: 'mp_8', name: 'Hadi Wijaya', employeeId: 'EMP008', department: 'Logistics', position: 'Forklift Driver', avatar: 'https://i.pravatar.cc/150?u=mp_8' },
  { id: 'mp_9', name: 'Indra Lesmana', employeeId: 'EMP009', department: 'Production', position: 'Operator', avatar: 'https://i.pravatar.cc/150?u=mp_9' },
  { id: 'mp_10', name: 'Joko Anwar', employeeId: 'EMP010', department: 'Engineering', position: 'Electrical Tech', avatar: 'https://i.pravatar.cc/150?u=mp_10' },
];

// Helper to generate realistic scores
const generateRandomScore = (base: number, variance: number) => {
  return Math.min(100, Math.max(0, Math.round(base + (Math.random() * variance * 2 - variance))));
};

export const mockManpowerScores: ManpowerScore[] = mockManpower.map((mp, index) => {
  // Top 3 get consistently higher scores
  const baseScore = index === 0 ? 94 : index === 1 ? 92 : index === 2 ? 90 : 80;
  
  const apiScores: Record<string, number> = {
    attendance: generateRandomScore(baseScore + 2, 5),
    productivity: generateRandomScore(baseScore + 4, 8),
    safety: generateRandomScore(baseScore, 10),
    quality: generateRandomScore(baseScore - 2, 6),
    training: generateRandomScore(baseScore, 15),
    discipline: generateRandomScore(baseScore + 5, 2),
  };

  // Overall score will be calculated properly by the engine in real app, but we mock it here for initial load
  let overallScore = 0;
  mockApis.forEach(api => {
    if(apiScores[api.id]) {
      overallScore += apiScores[api.id] * api.weight;
    }
  });

  return {
    manpowerId: mp.id,
    apiScores,
    overallScore: Math.round(overallScore * 10) / 10
  };
}).sort((a, b) => b.overallScore - a.overallScore);
