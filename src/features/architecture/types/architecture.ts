import type {
  ChurnWindowMetrics,
  FileEvolutionMetrics,
  HotspotStatus
} from '@/shared/types/analysis'

export interface CouplingMetrics {
  ca: number
  ce: number
  instability: number
  hasCycle: boolean
}

export interface FileArchitectureMetrics extends CouplingMetrics {
  filePath: string
  moduleKey: string
  evolution?: FileEvolutionMetrics
}

export interface FolderArchitectureMetrics extends CouplingMetrics {
  folderPath: string
  fileCount: number
  couplingTo: Record<string, number>
  couplingFrom: Record<string, number>
  evolution?: {
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
}

export interface FolderDetailResponse {
  folder: FolderArchitectureMetrics
  files: FileArchitectureMetrics[]
}

export interface FileContentResponse {
  content: string
  path: string
  size: number
  lines: number
}

export type SortKey =
  | keyof FolderArchitectureMetrics
  | 'riskScore'
  | 'hotspotScore'
export type SortDirection = 'asc' | 'desc'

export interface SortConfig {
  key: SortKey
  direction: SortDirection
}
