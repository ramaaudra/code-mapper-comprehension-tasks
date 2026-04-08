import type { ArchitectureData } from '@/shared/context/DataContext'
import type { AnalysisData } from '@/shared/types/analysis'
import type { ReportBootstrapData } from '@/shared/types/report-bootstrap'

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

export type { ReportBootstrapData }
