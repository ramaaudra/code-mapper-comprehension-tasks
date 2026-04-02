import type {
  ConnascenceSignal,
  FileEvolutionMetrics,
  FolderEvolutionMetrics
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
  connascenceSignals?: ConnascenceSignal[]
}

export interface FolderArchitectureMetrics extends CouplingMetrics {
  folderPath: string
  fileCount: number
  couplingTo: Record<string, number>
  couplingFrom: Record<string, number>
  evolution: FolderEvolutionMetrics
  connascenceSignals?: ConnascenceSignal[]
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
