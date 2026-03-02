import { createContext, useContext } from 'react'

import type { AnalysisData } from '@/shared/types/analysis'

// Architecture types (mirror dari backend)
export interface FolderMetrics {
  folderPath: string
  instability: number
  ca: number
  ce: number
  fileCount: number
  hasCycle: boolean
  couplingTo: Record<string, number>
  couplingFrom: Record<string, number>
}

export interface FileMetrics {
  filePath: string
  instability: number
  ca: number
  ce: number
  moduleKey: string
  hasCycle: boolean
}

export interface ArchitectureData {
  folders: FolderMetrics[]
  files: FileMetrics[]
}

export interface DataContextValue {
  // Untuk ProjectDashboard dan DependencyGraph
  analysisData: AnalysisData | null
  // Untuk ArchitecturePage
  architectureData: ArchitectureData | null
  // Loading state (false untuk report)
  isLoading: boolean
  // Error state (null untuk report)
  error: Error | null
  // Refetch function (no-op untuk report)
  refetch: () => void
}

export const DataContext = createContext<DataContextValue | undefined>(
  undefined
)

export function useDataContext(): DataContextValue {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useDataContext must be used within DataProvider')
  }
  return context
}
