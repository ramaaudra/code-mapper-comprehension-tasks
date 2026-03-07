import type { FileRiskProfile } from '@/shared/types/risk'

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

export interface AnalysisNode {
  id: string
  label?: string
  basename?: string
  size?: number
  [key: string]: unknown
}

export interface AnalysisEdge {
  source: string
  target: string
  kind: 'static' | 'dynamic'
  strength: number
  line: number
}

export interface FileTreeNode {
  id: string
  name: string
  children?: FileTreeNode[]
  isDirectory: boolean
  size?: number
}

export interface DependencyReference {
  id: string
  label: string
  basename: string
  kind: AnalysisEdge['kind']
  strength: number
  line: number
}

export interface AnalysisData {
  nodes: AnalysisNode[]
  edges: AnalysisEdge[]
  fileTree: FileTreeNode[]
  dependencyMap: Record<string, DependencyInfo[]>
  riskAnalysis?: FileRiskProfile[]
  issues: AnalysisIssues
  metrics: AnalysisMetrics
  detailedMetrics?: DetailedMetrics
  warnings?: AnalysisWarnings
}
