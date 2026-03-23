export type CycleSeverity = 'high' | 'medium' | 'low'
export type FixPriority = 'high' | 'medium' | 'low'
export type SuggestionConfidence = 'high' | 'medium' | 'low'
export type HotspotStatus =
  | 'stable'
  | 'active'
  | 'high-review-needed'
  | 'critical-hotspot'

export interface CycleDependencyReference {
  target: string
  strength: number
  line: number
}

export interface CycleInput {
  cycle: string[]
  length: number
  files: string[]
  severity: CycleSeverity
}

export interface CycleFileMetric {
  filePath: string
  moduleKey: string
  ca: number
  ce: number
  instability: number
  evolution?: {
    hotspotStatus?: HotspotStatus
    churn30d?: {
      relativeChurn: number
    }
  }
}

export interface CycleGraphEdge {
  source: string
  target: string
  line?: number
  strength?: number
}

export interface SuggestedInvestigation {
  summary: string
  detail: string
  confidence: SuggestionConfidence
  candidateEdge?: CycleGraphEdge
}

export interface CycleTriageItem {
  id: string
  title: string
  routeLabel: string
  detectionSeverity: CycleSeverity
  fixPriority: FixPriority
  priorityReason: string
  priorityDrivers: string[]
  whatIsHappening: string
  whyItMatters: string
  cyclePath: string[]
  files: string[]
  uniqueFileCount: number
  entryLikeFiles: string[]
  moduleKeys: string[]
  cycleEdges: CycleGraphEdge[]
  neighborEdges: CycleGraphEdge[]
  nearbyFiles: string[]
  suggestedInvestigation: SuggestedInvestigation
  verificationChecks: string[]
}

export interface BuildCycleTriageItemsInput {
  cycles: CycleInput[]
  dependencyMap: Record<string, CycleDependencyReference[]>
  fileMetrics: CycleFileMetric[]
}
