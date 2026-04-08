export interface ReportBootstrapData {
  projectName: string
  generatedAt: string
  codeMapperVersion: string
  summary: {
    totalFiles: number
    totalDependencies: number
    cycleCount: number
    orphanCount: number
  }
}
