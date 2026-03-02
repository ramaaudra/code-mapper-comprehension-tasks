import type { ArchitectureData } from '@/shared/context/DataContext'
import type { AnalysisData } from '@/shared/types/analysis'

export interface ReportData {
  projectName: string
  generatedAt: string
  codeMapperVersion: string
  analysisData: AnalysisData
  architectureData: ArchitectureData
}
