export interface Manpower {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  position: string;
  avatar?: string;
}

export interface ScoreParameter {
  id: string;
  name: string;
  description?: string;
  rawValue: number;
  minValue: number;
  maxValue: number;
  normalizedScore: number;
  weight: number;
  target?: number;
  historicalTrend?: number[];
}

export interface ScoreApi {
  id: string;
  name: string;
  description?: string;
  endpoint: string;
  status: 'healthy' | 'warning' | 'error' | 'offline';
  weight: number;
  parameters: ScoreParameter[];
  lastUpdated: string;
  responseTime?: number;
  enabled: boolean;
}

export interface ManpowerScore {
  manpowerId: string;
  apiScores: Record<string, number>;
  overallScore: number;
}

export interface OverallKpi {
  overallScore: number;
  totalManpower: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  scoreChange: number;
}
