import { createContext, useContext } from 'react'

import type {
  FileArchitectureMetrics,
  FolderArchitectureMetrics
} from '@/features/architecture/types/architecture'
import type { AnalysisData } from '@/shared/types/analysis'
import type { ReportBootstrapData } from '@/shared/types/report-bootstrap'

export interface ArchitectureData {
  folders: FolderArchitectureMetrics[]
  files: FileArchitectureMetrics[]
}

export interface DataContextValue {
  analysisData: AnalysisData | null
  architectureData: ArchitectureData | null
  isLoading: boolean
  error: Error | null
  refetch: () => void
  generatedAt?: string
  runtimeMode?: 'live' | 'report'
  reportBootstrap?: ReportBootstrapData | null
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
