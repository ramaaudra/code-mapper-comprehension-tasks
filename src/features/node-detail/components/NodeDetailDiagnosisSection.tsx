import { DecisionStorySection } from '@/shared/components/ui/decision-story-section'
import {
  formatChangePressureHelper,
  formatExternalRelianceHelper,
  formatImpactScopeHelper,
  formatStructuralPositionHelper
} from '@/shared/lib/utils'

import { NodeDetailCycleTriageCallout } from './NodeDetailCycleTriageCallout'

import type { NodeDetailCycleTriageSummary } from '../lib/cycle-triage-link'
import type { FileArchitectureMetrics } from '@/features/architecture/types/architecture'
import type { DecisionAssessment } from '@/shared/lib/utils'
import type { FileEvolutionMetrics } from '@/shared/types/analysis'
import type { CycleTriageNavigationRequest } from '@/shared/types/explorer'
import type { ReactElement, ReactNode } from 'react'

interface NodeDetailDiagnosisSectionProps {
  decisionAssessment: DecisionAssessment
  decisionIcon: ReactNode
  changeHistoryAvailable: boolean
  fileEvolution: FileEvolutionMetrics | null
  archMetrics: FileArchitectureMetrics | undefined
  relatedCycleSummary: NodeDetailCycleTriageSummary | null
  resolvedNodeId: string
  onShowCycleTriage?: (request: CycleTriageNavigationRequest) => void
}

function renderHelperText(text: string): ReactElement {
  return <span className='text-xs text-muted-foreground'>{text}</span>
}

function getImpactScopeHelper(
  archMetrics: FileArchitectureMetrics | undefined
): ReactElement | null {
  if (!archMetrics) {
    return null
  }

  return renderHelperText(formatImpactScopeHelper(archMetrics.ca))
}

function getChangeActivityHelper(
  changeHistoryAvailable: boolean,
  fileEvolution: FileEvolutionMetrics | null
): ReactElement | null {
  if (!changeHistoryAvailable) {
    return renderHelperText(
      'Git history is unavailable for recent change signals.'
    )
  }

  if (!fileEvolution) {
    return null
  }

  return renderHelperText(
    formatChangePressureHelper(fileEvolution.churn30d.relativeChurn)
  )
}

function getDependenciesHelper(
  archMetrics: FileArchitectureMetrics | undefined
): ReactElement | null {
  if (!archMetrics) {
    return null
  }

  return renderHelperText(formatExternalRelianceHelper(archMetrics.ce))
}

function getArchitectureRoleHelper(
  archMetrics: FileArchitectureMetrics | undefined
): ReactElement | null {
  if (!archMetrics) {
    return null
  }

  return renderHelperText(
    formatStructuralPositionHelper(archMetrics.instability)
  )
}

export function NodeDetailDiagnosisSection({
  decisionAssessment,
  decisionIcon,
  changeHistoryAvailable,
  fileEvolution,
  archMetrics,
  relatedCycleSummary,
  resolvedNodeId,
  onShowCycleTriage
}: NodeDetailDiagnosisSectionProps): ReactElement {
  const showCycleTriageCallout = relatedCycleSummary && onShowCycleTriage

  return (
    <div className='space-y-3'>
      <DecisionStorySection
        assessment={decisionAssessment}
        icon={decisionIcon}
        evidenceLayout='list'
        changeActivityValue={changeHistoryAvailable ? undefined : 'Unavailable'}
        changeActivityTone={changeHistoryAvailable ? undefined : 'default'}
        evidenceHelpers={{
          impactScope: getImpactScopeHelper(archMetrics),
          changeActivity: getChangeActivityHelper(
            changeHistoryAvailable,
            fileEvolution
          ),
          dependencies: getDependenciesHelper(archMetrics),
          architectureRole: getArchitectureRoleHelper(archMetrics)
        }}
      />

      {showCycleTriageCallout ? (
        <NodeDetailCycleTriageCallout
          summary={relatedCycleSummary}
          resolvedNodeId={resolvedNodeId}
          onShowCycleTriage={onShowCycleTriage}
        />
      ) : null}
    </div>
  )
}
