import { ScoreApi, Manpower, ManpowerScore } from '../../types';

export const mockApis: ScoreApi[] = [
  {
    id: 'attendance',
    name: 'Attendance',
    description: 'Tracks employee presence, punctuality, and leaves.',
    endpoint: '/api/v1/attendance',
    status: 'healthy',
    weight: 0.20,
    enabled: true,
    lastUpdated: new Date().toISOString(),
    responseTime: 120,
    parameters: [
      { id: 'att_rate', name: 'Attendance Rate', rawValue: 95, minValue: 0, maxValue: 100, normalizedScore: 95, weight: 0.40, target: 90, historicalTrend: [92, 94, 91, 95, 95] },
      { id: 'late_arrival', name: 'Late Arrival', rawValue: 85, minValue: 0, maxValue: 100, normalizedScore: 85, weight: 0.20, target: 90, historicalTrend: [80, 82, 85, 85, 85] },
      { id: 'early_leave', name: 'Early Leave', rawValue: 90, minValue: 0, maxValue: 100, normalizedScore: 90, weight: 0.15, target: 95, historicalTrend: [88, 89, 90, 90, 90] },
      { id: 'absence', name: 'Absence', rawValue: 88, minValue: 0, maxValue: 100, normalizedScore: 88, weight: 0.25, target: 95, historicalTrend: [85, 86, 88, 88, 88] },
    ]
  },
  {
    id: 'productivity',
    name: 'Productivity',
    description: 'Measures output against set targets and benchmarks.',
    endpoint: '/api/v1/productivity',
    status: 'healthy',
    weight: 0.25,
    enabled: true,
    lastUpdated: new Date().toISOString(),
    responseTime: 240,
    parameters: [
      { id: 'output_vol', name: 'Output Volume', rawValue: 110, minValue: 0, maxValue: 150, normalizedScore: 92, weight: 0.50, target: 100, historicalTrend: [88, 90, 91, 92, 92] },
      { id: 'efficiency', name: 'Efficiency', rawValue: 95, minValue: 0, maxValue: 100, normalizedScore: 95, weight: 0.50, target: 90, historicalTrend: [90, 92, 94, 95, 95] },
    ]
  },
  {
    id: 'safety',
    name: 'Safety',
    description: 'Compliance with safety regulations and incident reports.',
    endpoint: '/api/v1/safety',
    status: 'warning',
    weight: 0.20,
    enabled: true,
    lastUpdated: new Date(Date.now() - 3600000).toISOString(),
    responseTime: 1200,
    parameters: [
      { id: 'incidents', name: 'Incidents (Inverted)', rawValue: 2, minValue: 0, maxValue: 10, normalizedScore: 80, weight: 0.60, target: 0, historicalTrend: [100, 90, 80, 80, 80] },
      { id: 'ppe_compliance', name: 'PPE Compliance', rawValue: 98, minValue: 0, maxValue: 100, normalizedScore: 98, weight: 0.40, target: 100, historicalTrend: [95, 96, 97, 98, 98] },
    ]
  },
  {
    id: 'quality',
    name: 'Quality',
    description: 'Defect rates and adherence to quality standards.',
    endpoint: '/api/v1/quality',
    status: 'healthy',
    weight: 0.15,
    enabled: true,
    lastUpdated: new Date().toISOString(),
    responseTime: 180,
    parameters: [
      { id: 'defect_rate', name: 'Defect Rate (Inverted)', rawValue: 1.5, minValue: 0, maxValue: 10, normalizedScore: 85, weight: 0.70, target: 1.0, historicalTrend: [80, 82, 84, 85, 85] },
      { id: 'rework', name: 'Rework Required', rawValue: 5, minValue: 0, maxValue: 20, normalizedScore: 75, weight: 0.30, target: 2, historicalTrend: [70, 72, 74, 75, 75] },
    ]
  },
  {
    id: 'training',
    name: 'Training',
    description: 'Completion of mandatory and optional training modules.',
    endpoint: '/api/v1/training',
    status: 'offline',
    weight: 0.10,
    enabled: true,
    lastUpdated: new Date(Date.now() - 86400000).toISOString(),
    responseTime: 0,
    parameters: [
      { id: 'mandatory', name: 'Mandatory Completion', rawValue: 100, minValue: 0, maxValue: 100, normalizedScore: 100, weight: 0.80, target: 100, historicalTrend: [100, 100, 100, 100, 100] },
      { id: 'optional', name: 'Optional Completion', rawValue: 40, minValue: 0, maxValue: 100, normalizedScore: 40, weight: 0.20, target: 50, historicalTrend: [20, 30, 35, 40, 40] },
    ]
  },
  {
    id: 'discipline',
    name: 'Discipline',
    description: 'Adherence to company policies and code of conduct.',
    endpoint: '/api/v1/discipline',
    status: 'healthy',
    weight: 0.10,
    enabled: true,
    lastUpdated: new Date().toISOString(),
    responseTime: 95,
    parameters: [
      { id: 'warnings', name: 'Warnings (Inverted)', rawValue: 0, minValue: 0, maxValue: 5, normalizedScore: 100, weight: 0.70, target: 0, historicalTrend: [100, 100, 100, 100, 100] },
      { id: 'policy', name: 'Policy Quiz Score', rawValue: 90, minValue: 0, maxValue: 100, normalizedScore: 90, weight: 0.30, target: 100, historicalTrend: [85, 88, 90, 90, 90] },
    ]
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
