export type BlastRadiusRole = 'supporting' | 'hidden'
export type NodeDetailSourceState =
  | 'report'
  | 'loading'
  | 'error'
  | 'empty'
  | 'ready'
export type SourceTabBadge = string | null

interface BlastRadiusRoleInput {
  hasArchitectureMetrics: boolean
}

interface NodeDetailOverviewStateInput {
  hasDecisionAssessment: boolean
  hasArchitectureMetrics: boolean
  hasEvolutionMetrics: boolean
}

interface NodeDetailSourceStateInput {
  isReportMode: boolean
  isLoadingContent: boolean
  hasContentError: boolean
  hasFileContent: boolean
}

export function resolveBlastRadiusRole(
  input: BlastRadiusRoleInput
): BlastRadiusRole {
  return input.hasArchitectureMetrics ? 'supporting' : 'hidden'
}

export function resolveNodeDetailOverviewState(
  input: NodeDetailOverviewStateInput
) {
  const { hasDecisionAssessment, hasArchitectureMetrics, hasEvolutionMetrics } =
    input

  return {
    showDiagnosis: hasDecisionAssessment,
    showDiagnosisUnavailableState: !hasDecisionAssessment,
    showBlastRadius: hasArchitectureMetrics,
    showWhyDisclosure:
      hasDecisionAssessment && (hasArchitectureMetrics || hasEvolutionMetrics),
    showArchitectureMetrics: hasArchitectureMetrics,
    showEvolutionMetrics: hasEvolutionMetrics
  }
}

export function resolveNodeDetailSourceState(
  input: NodeDetailSourceStateInput
): NodeDetailSourceState {
  if (input.isReportMode) {
    return 'report'
  }

  if (input.isLoadingContent) {
    return 'loading'
  }

  if (input.hasContentError) {
    return 'error'
  }

  if (!input.hasFileContent) {
    return 'empty'
  }

  return 'ready'
}

interface SourceTabBadgeInput {
  isReportMode: boolean
  fileContentLines: number | null
  fallbackEstimatedLines: number | null
}

export function resolveSourceTabBadge(
  input: SourceTabBadgeInput
): SourceTabBadge {
  if (input.isReportMode) {
    return null
  }

  if (typeof input.fileContentLines === 'number') {
    return input.fileContentLines.toLocaleString()
  }

  if (
    typeof input.fallbackEstimatedLines === 'number' &&
    input.fallbackEstimatedLines > 0
  ) {
    return input.fallbackEstimatedLines.toLocaleString()
  }

  return '0'
}

export function shouldShowTracePathAction(isReportMode: boolean): boolean {
  return !isReportMode
}
