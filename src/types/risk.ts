export type RiskCategory = 'Rendah' | 'Sedang' | 'Tinggi' | 'Kritis';

export interface FileRiskFactors {
  indegree: number;
  outdegree: number;
  inCycle: boolean;
}

export interface FileRiskProfile {
  file: string;
  score: number;
  category: RiskCategory;
  factors: FileRiskFactors;
}
