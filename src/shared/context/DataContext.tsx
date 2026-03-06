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
  analysisData: AnalysisData | null
  architectureData: ArchitectureData | null
  isLoading: boolean
  error: Error | null
  refetch: () => void
  generatedAt?: string
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
