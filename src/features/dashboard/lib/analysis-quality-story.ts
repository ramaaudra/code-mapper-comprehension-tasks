import type { AnalysisWarnings } from '@/shared/types/analysis'

export interface AnalysisQualityIssue {
  title: string
  description: string
  ctaLabel: string
  affectedImportCount: number
  affectedPatternCount: number
  affectedFilesCount: number
}

export function resolveAnalysisQualityIssue(
  warnings?: AnalysisWarnings
): AnalysisQualityIssue | null {
  const unresolvedImports = warnings?.unresolvedImports ?? []

  if (!warnings || unresolvedImports.length === 0) {
    return null
  }

  const affectedFiles = new Set(
    unresolvedImports.flatMap((entry) => entry.files)
  )

  return {
    title: 'Analysis quality needs attention',
    description:
      'Some project imports could not be resolved. Dependency paths, shared impact, and review guidance may be incomplete until you fix these references and run analysis again.',
    ctaLabel: 'Review setup guidance',
    affectedImportCount: warnings.totalUnresolvedCount,
    affectedPatternCount: unresolvedImports.length,
    affectedFilesCount: affectedFiles.size
  }
}
