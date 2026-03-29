import { Button } from '@/shared/components/ui/button'
import { DecisionStorySection } from '@/shared/components/ui/decision-story-section'
import { ArrowRight } from '@/shared/components/ui/icons'
import {
  formatChangePressureHelper,
  formatExternalRelianceHelper,
  formatImpactScopeHelper,
  formatStructuralPositionHelper
} from '@/shared/lib/utils'

import type { NodeDetailCycleTriageSummary } from '../lib/cycle-triage-link'
import type { FileArchitectureMetrics } from '@/features/architecture/types/architecture'
import type { DecisionAssessment } from '@/shared/lib/utils'
import type { FileEvolutionMetrics } from '@/shared/types/analysis'
import type { CycleTriageNavigationRequest } from '@/shared/types/explorer'
import type { ReactNode } from 'react'

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

export function NodeDetailDiagnosisSection({
  decisionAssessment,
  decisionIcon,
  changeHistoryAvailable,
  fileEvolution,
  archMetrics,
  relatedCycleSummary,
  resolvedNodeId,
  onShowCycleTriage
}: NodeDetailDiagnosisSectionProps) {
  const showCycleTriageCallout = relatedCycleSummary && onShowCycleTriage

  return (
    <div className='space-y-3'>
      <DecisionStorySection
        assessment={decisionAssessment}
        icon={decisionIcon}
        changeActivityValue={changeHistoryAvailable ? undefined : 'Unavailable'}
        changeActivityTone={changeHistoryAvailable ? undefined : 'default'}
        evidenceHelpers={{
          impactScope: archMetrics ? (
            <span className='text-xs text-muted-foreground'>
              {formatImpactScopeHelper(archMetrics.ca)}
            </span>
          ) : null,
          changeActivity:
            changeHistoryAvailable && fileEvolution ? (
              <span className='text-xs text-muted-foreground'>
                {formatChangePressureHelper(
                  fileEvolution.churn30d.relativeChurn
                )}
              </span>
            ) : !changeHistoryAvailable ? (
              <span className='text-xs text-muted-foreground'>
                Git history is unavailable for recent change signals.
              </span>
            ) : null,
          dependencies: archMetrics ? (
            <span className='text-xs text-muted-foreground'>
              {formatExternalRelianceHelper(archMetrics.ce)}
            </span>
          ) : null,
          architectureRole: archMetrics ? (
            <span className='text-xs text-muted-foreground'>
              {formatStructuralPositionHelper(archMetrics.instability)}
            </span>
          ) : null
        }}
      />

      {showCycleTriageCallout ? (
        <div className='rounded-xl border border-destructive/30 bg-destructive/5 p-4'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
            <div className='space-y-1'>
              <p className='text-sm font-semibold text-destructive'>
                {relatedCycleSummary.title}
              </p>
              <p className='text-xs leading-relaxed text-destructive/90'>
                {relatedCycleSummary.description}
              </p>
            </div>
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='border-destructive/30 bg-background/80 text-destructive hover:bg-destructive/10 hover:text-destructive'
              onClick={() =>
                onShowCycleTriage({
                  cycleId: relatedCycleSummary.selectedCycleId,
                  focusFilePath: resolvedNodeId
                })
              }
            >
              {relatedCycleSummary.actionLabel}
              <ArrowRight className='ml-2 h-3 w-3' />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
