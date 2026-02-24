export interface CouplingMetrics {
  ca: number
  ce: number
  instability: number
  hasCycle: boolean
}

export interface FileArchitectureMetrics extends CouplingMetrics {
  filePath: string
  moduleKey: string
}

export interface FolderArchitectureMetrics extends CouplingMetrics {
  folderPath: string
  fileCount: number
  couplingTo: Record<string, number>
  couplingFrom: Record<string, number>
}

export interface FolderDetailResponse {
  folder: FolderArchitectureMetrics
  files: FileArchitectureMetrics[]
}

export type SortKey = keyof FolderArchitectureMetrics | 'riskScore'
export type SortDirection = 'asc' | 'desc'

export interface SortConfig {
  key: SortKey
  direction: SortDirection
}
