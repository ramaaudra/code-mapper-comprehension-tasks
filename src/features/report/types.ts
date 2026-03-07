import type { ArchitectureData } from '@/shared/context/DataContext'
import type { AnalysisData } from '@/shared/types/analysis'

export interface ReportData {
  projectName: string
  generatedAt: string
  codeMapperVersion: string
  reportBundle: {
    builtAt: string
    bundlePath: string
    cssPath: string | null
    isStale: boolean
    staleReason: string | null
  }
  analysisData: AnalysisData
  architectureData: ArchitectureData
}
