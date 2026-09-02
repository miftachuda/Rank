import { ScoreApi } from '../../types';

export const mockApis: ScoreApi[] = [
  {
    id: 'attendance',
    name: 'Attendance',
    description: 'Tracks employee presence, punctuality, and absences.',
    endpoint: '/api/v1/scores/attendance',
    status: 'healthy',
    weight: 20,
    lastUpdated: new Date(Date.now() - 120000).toISOString(),
    responseTime: 120,
    enabled: true,
    parameters: [
      { id: 'att_rate', name: 'Attendance Rate', rawValue: 96, minValue: 0, maxValue: 100, normalizedScore: 96, weight: 40, target: 95, historicalTrend: [92, 94, 95, 96, 96] },
      { id: 'att_late', name: 'Late Arrival', rawValue: 2, minValue: 0, maxValue: 10, normalizedScore: 80, weight: 20, target: 0, historicalTrend: [5, 4, 2, 3, 2] },
      { id: 'att_early', name: 'Early Leave', rawValue: 1, minValue: 0, maxValue: 10, normalizedScore: 90, weight: 15, target: 0, historicalTrend: [2, 1, 1, 0, 1] },
      { id: 'att_abs', name: 'Absence', rawValue: 1, minValue: 0, maxValue: 5, normalizedScore: 80, weight: 25, target: 0, historicalTrend: [1, 2, 1, 1, 1] },
    ]
  },
  {
    id: 'productivity',
    name: 'Productivity',
    description: 'Measures output against set targets and task completion rates.',
    endpoint: '/api/v1/scores/productivity',
    status: 'healthy',
    weight: 25,
    lastUpdated: new Date(Date.now() - 300000).toISOString(),
    responseTime: 240,
    enabled: true,
    parameters: [
      { id: 'prod_tasks', name: 'Tasks Completed', rawValue: 45, minValue: 0, maxValue: 50, normalizedScore: 90, weight: 50, target: 40, historicalTrend: [85, 88, 89, 90, 90] },
      { id: 'prod_eff', name: 'Efficiency Ratio', rawValue: 92, minValue: 0, maxValue: 100, normalizedScore: 92, weight: 50, target: 90, historicalTrend: [88, 90, 91, 91, 92] },
    ]
  },
  {
    id: 'safety',
    name: 'Safety',
    description: 'Tracks safety incidents, near misses, and PPE compliance.',
    endpoint: '/api/v1/scores/safety',
    status: 'warning',
    weight: 20,
    lastUpdated: new Date(Date.now() - 86400000).toISOString(),
    responseTime: 1200,
    enabled: true,
    parameters: [
      { id: 'saf_incidents', name: 'Zero Incidents', rawValue: 0, minValue: 0, maxValue: 5, normalizedScore: 100, weight: 60, target: 0, historicalTrend: [100, 100, 100, 100, 100] },
      { id: 'saf_ppe', name: 'PPE Compliance', rawValue: 85, minValue: 0, maxValue: 100, normalizedScore: 85, weight: 40, target: 100, historicalTrend: [95, 90, 88, 85, 85] },
    ]
  },
  {
    id: 'quality',
    name: 'Quality',
    description: 'Evaluates the quality of work, defect rates, and rework required.',
    endpoint: '/api/v1/scores/quality',
    status: 'healthy',
    weight: 15,
    lastUpdated: new Date(Date.now() - 600000).toISOString(),
    responseTime: 180,
    enabled: true,
    parameters: [
      { id: 'qual_defect', name: 'Defect Rate', rawValue: 1.5, minValue: 0, maxValue: 10, normalizedScore: 85, weight: 70, target: 1.0, historicalTrend: [80, 82, 84, 85, 85] },
      { id: 'qual_rework', name: 'Rework Required', rawValue: 2, minValue: 0, maxValue: 20, normalizedScore: 90, weight: 30, target: 0, historicalTrend: [85, 88, 89, 90, 90] },
    ]
  },
  {
    id: 'training',
    name: 'Training',
    description: 'Measures training completion and skill development progress.',
    endpoint: '/api/v1/scores/training',
    status: 'offline',
    weight: 10,
    lastUpdated: new Date(Date.now() - 172800000).toISOString(),
    responseTime: 0,
    enabled: true,
    parameters: [
      { id: 'train_comp', name: 'Course Completion', rawValue: 80, minValue: 0, maxValue: 100, normalizedScore: 80, weight: 100, target: 100, historicalTrend: [60, 70, 75, 80, 80] },
    ]
  },
  {
    id: 'discipline',
    name: 'Discipline',
    description: 'Records disciplinary actions and policy adherence.',
    endpoint: '/api/v1/scores/discipline',
    status: 'healthy',
    weight: 10,
    lastUpdated: new Date(Date.now() - 3600000).toISOString(),
    responseTime: 150,
    enabled: true,
    parameters: [
      { id: 'disc_actions', name: 'Disciplinary Actions', rawValue: 0, minValue: 0, maxValue: 3, normalizedScore: 100, weight: 100, target: 0, historicalTrend: [100, 100, 100, 100, 100] },
    ]
  }
];