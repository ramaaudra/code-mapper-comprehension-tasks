import type { FileRiskProfile } from '@/shared/types/risk'

export type HotspotStatus =
  | 'stable'
  | 'active'
  | 'high-review-needed'
  | 'critical-hotspot'

export interface ChurnWindowMetrics {
  windowDays: 30 | 90
  churnLoc: number
  commitCount: number
  relativeChurn: number
}

export interface FileEvolutionMetrics {
  filePath: string
  effectiveLoc: number
  churn30d: ChurnWindowMetrics
  churn90d: ChurnWindowMetrics
  relativeChurnPercentile: number
  structuralRiskPercentile: number
  hotspotScore: number
  hotspotPercentile: number
  hotspotStatus: HotspotStatus
}

export interface FolderEvolutionMetrics {
  effectiveLoc: number
  churn30d: ChurnWindowMetrics
  churn90d: ChurnWindowMetrics
  relativeChurnPercentile: number
  structuralRiskPercentile: number
  hotspotScore: number
  hotspotPercentile: number
  hotspotStatus: HotspotStatus
  changedFileCount30d: number
}

export interface EvolutionarySummary {
  availability: 'available' | 'unavailable'
  unavailableReason: string | null
  averageRelativeChurn30d: number
  averageRelativeChurn90d: number
  filesWithChurn30d: number
  filesWithCriticalHotspots: number
  filesWithHighHotspots: number
  defaultWindowDays: 30
}

export interface EvolutionaryMetricsResult {
  summary: EvolutionarySummary
  files: Record<string, FileEvolutionMetrics>
}

export type ConnascenceSeverity = 'low' | 'medium' | 'high'
export type ConnascenceConfidence = 'low' | 'medium' | 'high'
export type ConnascenceEvidenceKind =
  | 'declaration'
  | 'call-site'
  | 'type-import'
  | 'type-usage'

export interface ConnascenceEvidence {
  filePath: string
  line: number | null
  label: string
  evidenceKind: ConnascenceEvidenceKind
}

interface BaseConnascenceSignal {
  signalKey: string
  title: string
  declarationPreview?: string
  declaredIn: string
  targetFiles: string[]
  severity: ConnascenceSeverity
  confidence: ConnascenceConfidence
  whyItMatters: string
  recommendedAction: string
  evidence: ConnascenceEvidence[]
}

export interface FragilePositionalApiSignal extends BaseConnascenceSignal {
  kind: 'fragile-positional-api'
  title: 'Fragile Positional API'
  symbolName: string
  requiredParamCount: number
  callerCount: number
  moduleBoundaryCount: number
}

export type SharedTypeContractUsageKind =
  | 'parameter'
  | 'return'
  | 'exported-property'
  | 'exported-object-shape'

export interface SharedTypeContractSignal extends BaseConnascenceSignal {
  kind: 'shared-type-contract'
  title: 'Shared Type Contract'
  typeName: string
  importerCount: number
  moduleBoundaryCount: number
  usageKind: SharedTypeContractUsageKind
}

export type ConnascenceSignal =
  | FragilePositionalApiSignal
  | SharedTypeContractSignal

export interface ConnascenceInsightSummary {
  availability: 'available' | 'unavailable'
  unavailableReason: string | null
  fragilePositionalApiCount: number
  sharedTypeContractCount: number
}

export interface ConnascenceInsightsResult {
  summary: ConnascenceInsightSummary
  fileSignals: Record<string, ConnascenceSignal[]>
  moduleSignals: Record<string, ConnascenceSignal[]>
}

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

/**
 * Slim entry-detection metadata from the backend.
 * Used as explanatory context in reachability/orphan UI areas.
 */
export interface EntryDetectionContext {
  /** Human-readable framework names (e.g., ['Next.js', 'React']) */
  frameworks: string[]
  /** Detection sources that contributed (e.g., ['dependencies', 'config', 'scripts']) */
  sources: string[]
  /** Overall confidence level of entry-point detection */
  confidence: 'high' | 'medium' | 'low'
}

export interface DependencyInfo {
  target: string
  strength: number
  line: number
  isTypeOnly?: boolean
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
  effectiveLoc?: number
  [key: string]: unknown
}

export interface AnalysisEdge {
  source: string
  target: string
  kind: 'static' | 'dynamic'
  strength: number
  line: number
  isTypeOnly?: boolean
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
  connascenceInsights?: ConnascenceInsightsResult
  evolutionaryMetrics: EvolutionaryMetricsResult
  issues: AnalysisIssues
  metrics: AnalysisMetrics
  detailedMetrics?: DetailedMetrics
  warnings?: AnalysisWarnings
  entryDetectionContext?: EntryDetectionContext
  projectName?: string
  rootPath?: string
}
