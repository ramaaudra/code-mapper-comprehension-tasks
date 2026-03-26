import { ArchitectureStats } from '@/features/architecture'
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
import { InsightBulletList } from '@/shared/components/ui/insight-bullet-list'
import { MetricInsightCard } from '@/shared/components/ui/metric-insight-card'
import { MetricValueCard } from '@/shared/components/ui/metric-value-card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/shared/components/ui/tooltip'
import { decisionCopy } from '@/shared/content/decisionCopy'
import { METRIC_LABELS, METRIC_TOOLTIPS } from '@/shared/lib/metric-copy'
import { getReviewSignalDefinition } from '@/shared/lib/metric-thresholds'
import {
  formatChangePressureHelper,
  formatExternalRelianceHelper,
  formatExternalRelianceValue,
  formatImpactScopeHelper,
  formatRelativeChurn,
  formatStructuralPositionHelper,
  formatStructuralPositionValue,
  getAssessmentMethodItems,
  getExternalRelianceTone,
  getStructuralPositionTone
} from '@/shared/lib/utils'
import {
  getRiskBgOpacityClass,
  getRiskBorderClass,
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
import type { FileEvolutionMetrics } from '@/shared/types/analysis'
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
  decisionIcon
}: NodeDetailOverviewSectionProps) {
  const supportingSignals =
    overviewState.showBlastRadius &&
    blastRadiusRole === 'supporting' &&
    decisionAssessment
      ? resolveNodeDetailSupportingSignals({
          decisionTitle: decisionAssessment.title,
          isPossiblyUnreachable,
          archMetrics,
          blastRadiusAssessment
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
            title={nodeDetailCopy.blastRadius.sectionTitle}
          />
          {supportingSignals.map((signal) => {
            if (signal.id === 'verification-scope' && signal.riskLevel) {
              return (
                <TooltipProvider delayDuration={200} key={signal.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className='cursor-help'>
                        <MetricInsightCard
                          icon={
                            signal.riskLevel === 'low' ? (
                              <CheckCircle className='h-4 w-4 text-status-success-foreground' />
                            ) : (
                              <AlertTriangle
                                className={`h-4 w-4 ${getRiskTextClass(signal.riskLevel)}`}
                              />
                            )
                          }
                          title={signal.title}
                          value={
                            typeof signal.riskScore === 'number'
                              ? `Score: ${signal.riskScore.toFixed(1)}`
                              : undefined
                          }
                          description={signal.description}
                          tone={signal.tone}
                          className={`${getRiskBorderClass(signal.riskLevel)} ${getRiskBgOpacityClass(signal.riskLevel, 5)}`}
                        />
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
              <MetricInsightCard
                key={signal.id}
                icon={icon}
                title={signal.title}
                description={signal.description}
                tone={signal.tone}
                className='border-status-warning-border bg-status-warning-surface'
              />
            )
          })}
        </div>
      ) : null}

      {overviewState.showWhyDisclosure ? (
        <DetailPanelDisclosure
          title={nodeDetailCopy.disclosure.whyTitle}
          summary={nodeDetailCopy.disclosure.whySummary}
        >
          <div className='space-y-3'>
            <DetailPanelSectionHeading
              title={nodeDetailCopy.disclosure.howAssessedTitle}
            />
            <InsightBulletList items={getAssessmentMethodItems()} />
          </div>

          {overviewState.showArchitectureMetrics && archMetrics ? (
            <div className='space-y-3'>
              <DetailPanelSectionHeading title='Additional Signals' />
              <div className='grid grid-cols-2 gap-3'>
                <MetricValueCard
                  value={formatExternalRelianceValue(
                    decisionAssessment?.externalReliance ?? 'Low'
                  )}
                  label={decisionCopy.evidence.labels.dependencies}
                  tone={getExternalRelianceTone(
                    decisionAssessment?.externalReliance ?? 'Low'
                  )}
                  helper={
                    <span className='text-xs text-muted-foreground'>
                      {formatExternalRelianceHelper(archMetrics.ce)}
                    </span>
                  }
                />
                <MetricValueCard
                  value={formatStructuralPositionValue(
                    decisionAssessment?.structuralPosition ?? 'Balanced'
                  )}
                  label={decisionCopy.evidence.labels.architectureRole}
                  tone={getStructuralPositionTone(
                    decisionAssessment?.structuralPosition ?? 'Balanced'
                  )}
                  helper={
                    <span className='text-xs text-muted-foreground'>
                      {formatStructuralPositionHelper(archMetrics.instability)}
                    </span>
                  }
                />
              </div>
            </div>
          ) : null}

          {overviewState.showArchitectureMetrics && archMetrics ? (
            <div className='space-y-3'>
              <DetailPanelSectionHeading
                title={nodeDetailCopy.disclosure.architectureMetricsTitle}
              />
              <ArchitectureStats
                ca={archMetrics.ca}
                ce={archMetrics.ce}
                instability={archMetrics.instability}
                hasCycle={archMetrics.hasCycle}
              />
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
            <div className='space-y-3'>
              <DetailPanelSectionHeading
                title={nodeDetailCopy.disclosure.evolutionaryMetricsTitle}
              />
              <div className='grid grid-cols-2 gap-3'>
                <MetricValueCard
                  value={formatRelativeChurn(
                    fileEvolution.churn30d.relativeChurn
                  )}
                  label={METRIC_LABELS.relativeChurn30d}
                  tooltip={METRIC_TOOLTIPS.relativeChurn30d}
                />
                <MetricValueCard
                  value={formatRelativeChurn(
                    fileEvolution.churn90d.relativeChurn
                  )}
                  label={METRIC_LABELS.relativeChurn90d}
                  tooltip={METRIC_TOOLTIPS.relativeChurn90d}
                />
                <MetricValueCard
                  value={fileEvolution.churn30d.commitCount}
                  label={METRIC_LABELS.commits30d}
                  tooltip={METRIC_TOOLTIPS.commits30d}
                />
                <MetricValueCard
                  value={fileEvolution.hotspotScore.toFixed(2)}
                  label={METRIC_LABELS.evolutionaryHotspotScore}
                  tooltip={METRIC_TOOLTIPS.evolutionaryHotspotScore}
                  helper={
                    <HotspotStatusLabel
                      status={fileEvolution.hotspotStatus}
                      className='text-[11px] text-muted-foreground'
                    />
                  }
                />
              </div>
            </div>
          ) : null}
        </DetailPanelDisclosure>
      ) : null}

      {onFocusSubgraph ? (
        <DetailPanelDisclosure
          title={nodeDetailCopy.graphTools.title}
          summary={nodeDetailCopy.graphTools.summary}
        >
          <div className='space-y-3'>
            <div className='grid grid-cols-2 gap-2'>
              <Button
                variant={focusDirection === 'inward' ? 'secondary' : 'outline'}
                size='sm'
                onClick={() => onFocusDirectionChange('inward')}
                className='w-full justify-start'
              >
                <ArrowLeft className='mr-2 h-3 w-3' />
                {nodeDetailCopy.graphTools.inward}
              </Button>
              <Button
                variant={focusDirection === 'outward' ? 'secondary' : 'outline'}
                size='sm'
                onClick={() => onFocusDirectionChange('outward')}
                className='w-full justify-start'
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
        </DetailPanelDisclosure>
      ) : null}
    </div>
  )
}
