import type { FileRiskProfile } from '@/types/risk'

export interface UnresolvedImport {
  specifier: string
  pattern: string
  files: string[]
  count: number
}

export interface AnalysisWarnings {
  hasPathMappings: boolean
  unresolvedImports: UnresolvedImport[]
  totalUnresolvedCount: number
}

export interface DependencyInfo {
  target: string
  strength: number
  line: number
}

export interface CircularDependencyInfo {
  cycle: string[]
  length: number
  files: string[]
  severity: 'high' | 'medium' | 'low'
}

export interface AnalysisMetrics {
  fileCount: number
  edgeCount: number
  avgDegree: number
}

export interface DetailedMetrics {
  totalFiles: number
  totalDependencies: number
  averageDependenciesPerFile: number
  topImporters: { file: string; outdegree: number }[]
  mostDependedOn: { file: string; indegree: number }[]
  codebaseHealth: {
    orphanCount: number
    circularCount: number
  }
}

export interface AnalysisIssues {
  circularDependencies: CircularDependencyInfo[]
  orphans: string[]
  summary: string
}

export interface AnalysisData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nodes: any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  edges: any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fileTree: any[]
  dependencyMap: Record<string, DependencyInfo[]>
  riskAnalysis?: FileRiskProfile[]
  issues: AnalysisIssues
  metrics: AnalysisMetrics
  detailedMetrics?: DetailedMetrics
  warnings?: AnalysisWarnings
}
