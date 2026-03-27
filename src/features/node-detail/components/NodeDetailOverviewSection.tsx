import { Button } from '@/shared/components/ui/button'
import { DecisionStorySection } from '@/shared/components/ui/decision-story-section'
import { DetailPanelDisclosure } from '@/shared/components/ui/detail-panel-disclosure'
import { DetailPanelSectionHeading } from '@/shared/components/ui/detail-panel-section-heading'
import { DetailPanelState } from '@/shared/components/ui/detail-panel-state'
import { HotspotStatusLabel } from '@/shared/components/ui/hotspot-status-label'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Cube,
  Focus,
  Ghost,
  Target
} from '@/shared/components/ui/icons'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/shared/components/ui/tooltip'
import { METRIC_LABELS } from '@/shared/lib/metric-copy'
import { getReviewSignalDefinition } from '@/shared/lib/metric-thresholds'
import {
  formatChangePressureHelper,
  formatExternalRelianceHelper,
  formatImpactScopeHelper,
  formatRelativeChurn,
  formatStructuralPositionHelper
} from '@/shared/lib/utils'
import {
  getRiskBgOpacityClass,
  getRiskTextClass
} from '@/shared/lib/utils/risk'

import { nodeDetailCopy } from '../content/nodeDetailCopy'
import {
  resolveNodeDetailSupportingSignals,
  type NodeDetailBlastRadiusAssessment
} from '../lib/supporting-signals'

import type { BlastRadiusRole } from '../lib/panel-state'
import type { FileArchitectureMetrics } from '@/features/architecture/types/architecture'
import type { DecisionAssessment } from '@/shared/lib/utils'
import type {
  EntryDetectionContext,
  FileEvolutionMetrics
} from '@/shared/types/analysis'
import type { ReactNode } from 'react'

interface NodeDetailOverviewState {
  showDiagnosis: boolean
  showDiagnosisUnavailableState: boolean
  showBlastRadius: boolean
  showWhyDisclosure: boolean
  showArchitectureMetrics: boolean
  showEvolutionMetrics: boolean
}

interface NodeDetailOverviewSectionProps {
  overviewState: NodeDetailOverviewState
  decisionAssessment: DecisionAssessment | null
  isPossiblyUnreachable: boolean
  changeHistoryAvailable: boolean
  fileEvolution: FileEvolutionMetrics | null
  archMetrics: FileArchitectureMetrics | undefined
  blastRadiusAssessment: NodeDetailBlastRadiusAssessment | null
  blastRadiusRole: BlastRadiusRole
  onFocusSubgraph?: (nodeId: string, direction: 'inward' | 'outward') => void
  focusDirection: 'inward' | 'outward'
  onFocusDirectionChange: (direction: 'inward' | 'outward') => void
  resolvedNodeId: string
  decisionIcon: ReactNode
  entryDetectionContext?: EntryDetectionContext
}

const blastRadiusSignal = getReviewSignalDefinition('blastRadius')

export function NodeDetailOverviewSection({
  overviewState,
  decisionAssessment,
  isPossiblyUnreachable,
  changeHistoryAvailable,
  fileEvolution,
  archMetrics,
  blastRadiusAssessment,
  blastRadiusRole,
  onFocusSubgraph,
  focusDirection,
  onFocusDirectionChange,
  resolvedNodeId,
  decisionIcon,
  entryDetectionContext
}: NodeDetailOverviewSectionProps) {
  const supportingSignals =
    overviewState.showBlastRadius &&
    blastRadiusRole === 'supporting' &&
    decisionAssessment
      ? resolveNodeDetailSupportingSignals({
          decisionTitle: decisionAssessment.title,
          isPossiblyUnreachable,
          archMetrics,
          blastRadiusAssessment,
          entryDetectionContext
        })
      : []

  return (
    <div className='space-y-6'>
      {overviewState.showDiagnosis && decisionAssessment ? (
        <DecisionStorySection
          assessment={decisionAssessment}
          icon={decisionIcon}
          changeActivityValue={
            changeHistoryAvailable ? undefined : 'Unavailable'
          }
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
      ) : null}

      {overviewState.showDiagnosisUnavailableState ? (
        <DetailPanelState
          title={nodeDetailCopy.diagnosisUnavailable.title}
          description={nodeDetailCopy.diagnosisUnavailable.description}
        />
      ) : null}

      {supportingSignals.length > 0 ? (
        <div className='space-y-3'>
          <DetailPanelSectionHeading
            title={nodeDetailCopy.consequences.title}
          />
          <div className='flex flex-col gap-3 text-sm'>
            {supportingSignals.map((signal) => {
              if (signal.id === 'verification-scope' && signal.riskLevel) {
                return (
                  <TooltipProvider delayDuration={200} key={signal.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`flex cursor-help items-start gap-2 rounded-md p-2 ${getRiskBgOpacityClass(signal.riskLevel, 10)}`}
                        >
                          <div className='mt-0.5 shrink-0'>
                            {signal.riskLevel === 'low' ? (
                              <CheckCircle className='h-4 w-4 text-status-success-foreground' />
                            ) : (
                              <AlertTriangle
                                className={`h-4 w-4 ${getRiskTextClass(signal.riskLevel)}`}
                              />
                            )}
                          </div>
                          <div>
                            <p className='font-medium text-foreground'>
                              {signal.title}{' '}
                              {typeof signal.riskScore === 'number' && (
                                <span className='ml-1 font-normal text-muted-foreground'>
                                  (Score: {signal.riskScore.toFixed(1)})
                                </span>
                              )}
                            </p>
                            <p className='mt-0.5 text-sm text-foreground/80'>
                              {signal.description}
                            </p>
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent
                        side='top'
                        className='max-w-xs border-border bg-popover'
                      >
                        <div className='space-y-2'>
                          <p className='font-semibold text-popover-foreground'>
                            {nodeDetailCopy.blastRadius.tooltipTitle}:{' '}
                            {signal.riskScore?.toFixed(1)}
                          </p>
                          <p className='text-xs text-popover-foreground/80'>
                            {nodeDetailCopy.blastRadius.tooltipDescription}
                          </p>
                          <div className='border-t border-border pt-1 text-xs'>
                            <p className='text-popover-foreground/80'>
                              {nodeDetailCopy.blastRadius.tooltipInterpretation}
                            </p>
                          </div>
                          {archMetrics ? (
                            <div className='space-y-1 border-t border-border pt-1 text-xs'>
                              <p className='text-popover-foreground/80'>
                                • <strong>Dependents (Ca):</strong>{' '}
                                {archMetrics.ca}
                              </p>
                              <p className='text-popover-foreground/80'>
                                • <strong>Dependencies (Ce):</strong>{' '}
                                {archMetrics.ce}
                              </p>
                              {typeof signal.riskScore === 'number' ? (
                                <p className='pt-1 text-popover-foreground/80'>
                                  Score basis: {archMetrics.ca} + (
                                  {archMetrics.ce} × 0.5) ={' '}
                                  {signal.riskScore.toFixed(1)}
                                </p>
                              ) : null}
                            </div>
                          ) : null}
                          <div className='border-t border-border pt-1 text-xs'>
                            <p className='text-popover-foreground/80'>
                              {blastRadiusSignal.scientificStatusNote}
                            </p>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )
              }

              const icon =
                signal.id === 'unreachable' ? (
                  <Ghost className='h-4 w-4 text-status-warning-foreground' />
                ) : signal.id === 'god-object' ? (
                  <Cube
                    className='h-4 w-4 text-status-warning-foreground'
                    weight='fill'
                  />
                ) : (
                  <Target
                    className='h-4 w-4 text-status-warning-foreground'
                    weight='fill'
                  />
                )

              return (
                <div key={signal.id} className='flex items-start gap-2 py-1'>
                  <div className='mt-0.5 shrink-0'>{icon}</div>
                  <div>
                    <p className='font-medium text-foreground'>
                      {signal.title}
                    </p>
                    <p className='mt-0.5 text-sm text-foreground/80'>
                      {signal.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : null}

      {overviewState.showWhyDisclosure ? (
        <DetailPanelDisclosure
          title={nodeDetailCopy.technicalBasis.title}
          summary={nodeDetailCopy.technicalBasis.summary}
        >
          {overviewState.showArchitectureMetrics && archMetrics ? (
            <div className='space-y-3 pb-2'>
              <DetailPanelSectionHeading
                title={nodeDetailCopy.disclosure.architectureMetricsTitle}
              />
              <dl className='grid grid-cols-2 gap-x-4 gap-y-2 text-sm'>
                <dt className='text-muted-foreground'>Dependents (Ca)</dt>
                <dd className='text-right font-medium text-foreground'>
                  {archMetrics.ca}
                </dd>
                <dt className='text-muted-foreground'>Dependencies (Ce)</dt>
                <dd className='text-right font-medium text-foreground'>
                  {archMetrics.ce}
                </dd>
                <dt className='text-muted-foreground'>Instability</dt>
                <dd className='text-right font-medium text-foreground'>
                  {archMetrics.instability.toFixed(2)}
                </dd>
                <dt className='text-muted-foreground'>Cycle</dt>
                <dd className='text-right font-medium text-foreground'>
                  {archMetrics.hasCycle ? 'Yes' : 'No'}
                </dd>
              </dl>
            </div>
          ) : null}

          {overviewState.showEvolutionMetrics && !changeHistoryAvailable ? (
            <DetailPanelState
              title='Evolutionary metrics unavailable'
              description='Git history is unavailable for change activity and hotspot metrics in this file.'
            />
          ) : null}

          {overviewState.showEvolutionMetrics &&
          fileEvolution &&
          changeHistoryAvailable ? (
            <div className='space-y-3 border-t border-border/50 pt-3'>
              <DetailPanelSectionHeading
                title={nodeDetailCopy.disclosure.evolutionaryMetricsTitle}
              />
              <dl className='grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 text-sm'>
                <dt className='text-muted-foreground'>
                  {METRIC_LABELS.relativeChurn30d}
                </dt>
                <dd className='text-right font-medium text-foreground'>
                  {formatRelativeChurn(fileEvolution.churn30d.relativeChurn)}
                </dd>
                <dt className='text-muted-foreground'>
                  {METRIC_LABELS.relativeChurn90d}
                </dt>
                <dd className='text-right font-medium text-foreground'>
                  {formatRelativeChurn(fileEvolution.churn90d.relativeChurn)}
                </dd>
                <dt className='text-muted-foreground'>
                  {METRIC_LABELS.commits30d}
                </dt>
                <dd className='text-right font-medium text-foreground'>
                  {fileEvolution.churn30d.commitCount}
                </dd>
                <dt className='flex items-center gap-2 text-muted-foreground'>
                  {METRIC_LABELS.evolutionaryHotspotScore}
                </dt>
                <dd className='flex items-center justify-end gap-2 text-right font-medium text-status-warning-foreground'>
                  {fileEvolution.hotspotScore.toFixed(2)}
                  <HotspotStatusLabel
                    status={fileEvolution.hotspotStatus}
                    className='text-[10px] font-bold uppercase text-muted-foreground'
                  />
                </dd>
              </dl>
            </div>
          ) : null}
        </DetailPanelDisclosure>
      ) : null}

      {onFocusSubgraph ? (
        <div className='space-y-4 border-t border-border/40 pb-2 pt-6'>
          <DetailPanelSectionHeading title={nodeDetailCopy.graphTools.title} />
          <div className='space-y-3'>
            <div className='flex w-full gap-2'>
              <Button
                variant={focusDirection === 'inward' ? 'secondary' : 'outline'}
                size='sm'
                onClick={() => onFocusDirectionChange('inward')}
                className='flex-1 justify-center'
              >
                <ArrowLeft className='mr-2 h-3 w-3' />
                {nodeDetailCopy.graphTools.inward}
              </Button>
              <Button
                variant={focusDirection === 'outward' ? 'secondary' : 'outline'}
                size='sm'
                onClick={() => onFocusDirectionChange('outward')}
                className='flex-1 justify-center'
              >
                {nodeDetailCopy.graphTools.outward}
                <ArrowRight className='ml-2 h-3 w-3' />
              </Button>
            </div>
            <Button
              variant='default'
              size='sm'
              onClick={() => onFocusSubgraph(resolvedNodeId, focusDirection)}
              className='w-full'
            >
              <Focus className='mr-2 h-3 w-3' />
              {nodeDetailCopy.graphTools.focusPrefix}{' '}
              {focusDirection === 'inward'
                ? nodeDetailCopy.graphTools.focusDependencies
                : nodeDetailCopy.graphTools.focusDependents}{' '}
              {nodeDetailCopy.graphTools.focusSuffix}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
