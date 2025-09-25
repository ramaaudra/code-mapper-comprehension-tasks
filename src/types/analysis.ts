import type { FileRiskProfile } from '@/types/risk';

export interface DependencyInfo {
  target: string;
  strength: number;
  line: number;
}

export interface CircularDependencyInfo {
  cycle: string[];
  length: number;
  files: string[];
  severity: 'high' | 'medium' | 'low';
}

export interface AnalysisMetrics {
  fileCount: number;
  edgeCount: number;
  avgDegree: number;
}

export interface DetailedMetrics {
  totalFiles: number;
  totalDependencies: number;
  averageDependenciesPerFile: number;
  mostComplexFiles: { file: string; outdegree: number }[];
  mostCriticalFiles: { file: string; indegree: number }[];
  codebaseHealth: {
    orphanCount: number;
    highImpactCount: number;
    circularCount: number;
  };
}

export interface AnalysisIssues {
  circularDependencies: CircularDependencyInfo[];
  orphans: string[];
  highImpact: { file: string; indegree: number }[];
  summary: string;
}

export interface AnalysisData {
  nodes: any[];
  edges: any[];
  fileTree: any[];
  dependencyMap: Record<string, DependencyInfo[]>;
  riskAnalysis?: FileRiskProfile[];
  issues: AnalysisIssues;
  metrics: AnalysisMetrics;
  detailedMetrics?: DetailedMetrics;
}
