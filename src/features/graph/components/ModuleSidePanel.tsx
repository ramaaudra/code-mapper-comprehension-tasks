import {
  useModuleReviewThresholdCalibration,
  useFolderDetail
} from '@/features/architecture'
import { DecisionStorySection } from '@/shared/components/ui/decision-story-section'
import { DetailPanelDisclosure } from '@/shared/components/ui/detail-panel-disclosure'
import { DetailPanelHeader } from '@/shared/components/ui/detail-panel-header'
import { DetailPanelSectionHeading } from '@/shared/components/ui/detail-panel-section-heading'
import { DetailPanelState } from '@/shared/components/ui/detail-panel-state'
import { DetailPanelTabs } from '@/shared/components/ui/detail-panel-tabs'
import { HotspotStatusLabel } from '@/shared/components/ui/hotspot-status-label'
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  FileCode,
  Folder
} from '@/shared/components/ui/icons'
import { InfoTooltip } from '@/shared/components/ui/info-tooltip'
import { InsightBulletList } from '@/shared/components/ui/insight-bullet-list'
import { MetricInsightCard } from '@/shared/components/ui/metric-insight-card'
import { MetricValueCard } from '@/shared/components/ui/metric-value-card'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { Tabs, TabsContent } from '@/shared/components/ui/tabs'
import { useDataContext } from '@/shared/context/DataContext'
import { METRIC_LABELS, METRIC_TOOLTIPS } from '@/shared/lib/metric-copy'
import {
  formatReviewSignalBandRange,
  getImpactScopeThresholdCatalog,
  getReviewSignalDefinition,
  getStructuralPositionBands,
  resolveImpactScope,
  resolveStructuralPosition
} from '@/shared/lib/metric-thresholds'
import {
  createDecisionAssessment,
  formatChangePressureHelper,
  formatExternalRelianceHelper,
  formatRelativeChurn,
  formatImpactScopeHelper,
  formatStructuralPositionHelper,
  getAssessmentMethodItems,
  isEvolutionaryMetricsAvailable,
  truncateMiddle
} from '@/shared/lib/utils'
import {
  calculateRiskScore,
  createRiskProfile,
  getRiskBgOpacityClass,
  getRiskBorderClass,
  getRiskDescription,
  getRiskLabel,
  getRiskTextClass
} from '@/shared/lib/utils/risk'

import { graphCopy } from '../content/graphCopy'
import { describeDependentImpact } from '../lib/dependent-impact-story'

import type { FolderArchitectureMetrics } from '@/features/architecture/types/architecture'
import type { ReviewThresholdCalibration } from '@/shared/lib/metric-thresholds'
import type { DecisionStatusTone } from '@/shared/lib/utils'
import type { RiskLevel } from '@/shared/types/risk'

interface ModuleSidePanelProps {
  modulePath: string
  onClose: () => void
  onViewFile: (filePath: string) => void
  moduleData?: FolderArchitectureMetrics
}

type InstabilityBand = 'rigid' | 'balanced' | 'flexible'

interface InstabilityConfig {
  band: InstabilityBand
  borderClass: string
  bgClass: string
  textClass: string
  label: string
  description: string
}

const DECISION_CARD_TONE_ICON = {
  danger: <AlertTriangle className='h-4 w-4 text-red-500' />,
  warning: <AlertTriangle className='h-4 w-4 text-orange-500' />,
  info: <Folder className='h-4 w-4 text-sky-500' />,
  success: <CheckCircle className='h-4 w-4 text-green-500' />,
  default: <CheckCircle className='h-4 w-4 text-green-500' />
} satisfies Record<DecisionStatusTone, React.ReactNode>

const propagationRiskSignal = getReviewSignalDefinition('propagationRisk')
const moduleImpactScopeSignal = getImpactScopeThresholdCatalog('module')
const structuralPositionSignal = getReviewSignalDefinition('structuralPosition')
const structuralPositionBands = getStructuralPositionBands()

const balancedBand = structuralPositionBands.find(
  (band) => band.id === 'Balanced'
)
const outwardDependentBand = structuralPositionBands.find(
  (band) => band.id === 'Outward-Dependent'
)

function getInstabilityBand(instability: number): InstabilityBand {
  switch (resolveStructuralPosition(instability)) {
    case 'Outward-Dependent':
      return 'flexible'
    case 'Balanced':
      return 'balanced'
    default:
      return 'rigid'
  }
}

function getInstabilityConfig(instability: number): InstabilityConfig {
  const band = getInstabilityBand(instability)

  switch (band) {
    case 'flexible':
      return {
        band,
        borderClass: 'border-sky-500/40',
        bgClass: 'bg-sky-500/5',
        textClass: 'text-sky-600',
        label: 'Flexible / Unstable',
        description:
          'This module points to more outgoing cross-module dependency edges than it receives. High instability is common in UI, route, and adapter layers and does not automatically mean high propagation risk.'
      }
    case 'balanced':
      return {
        band,
        borderClass: 'border-slate-500/40',
        bgClass: 'bg-slate-500/5',
        textClass: 'text-slate-600',
        label: 'Balanced',
        description:
          'Incoming and outgoing cross-module dependency edges are both meaningful. Review both dependents and outgoing dependencies before changing it.'
      }
    default:
      return {
        band,
        borderClass: 'border-indigo-500/40',
        bgClass: 'bg-indigo-500/5',
        textClass: 'text-indigo-600',
        label: 'Rigid / Stable',
        description:
          'More incoming cross-module dependency edges point into this module than out of it. Low instability often appears in shared or foundational layers, so change impact depends heavily on Ca.'
      }
  }
}

function InstabilityTooltipContent({ band }: { band: InstabilityBand }) {
  return (
    <div className='space-y-2 text-xs text-popover-foreground'>
      <p>
        Instability is a structural metric, not a direct risk score. It is
        calculated as <strong>I = Ce / (Ca + Ce)</strong>.
      </p>
      <div className='space-y-1 border-t border-border pt-2 text-popover-foreground/80'>
        <p>
          <strong>Rigid / Stable</strong>: I {'<'}{' '}
          {balancedBand?.min.toFixed(2) ?? '0.40'}. Incoming cross-module
          dependency edges point here more than this module points outward.
        </p>
        <p>
          <strong>Balanced</strong>: {balancedBand?.min.toFixed(2) ?? '0.40'} to{' '}
          {'<'} {outwardDependentBand?.min.toFixed(2) ?? '0.70'}. Incoming and
          outgoing coupling are both significant.
        </p>
        <p>
          <strong>Flexible / Unstable</strong>: I {'>='}{' '}
          {outwardDependentBand?.min.toFixed(2) ?? '0.70'}. Outgoing
          cross-module dependency edges dominate over incoming ones.
        </p>
      </div>
      <p className='border-t border-border pt-2 text-popover-foreground/80'>
        {structuralPositionSignal.scientificStatusNote}
      </p>
      <p className='border-t border-border pt-2 text-popover-foreground/80'>
        <strong>Current interpretation:</strong> {band}. High instability does
        not automatically mean a risky change. Review{' '}
        <strong>Dependent Impact</strong> together with{' '}
        <strong>Propagation Risk</strong>.
      </p>
    </div>
  )
}

function PropagationRiskTooltipContent({
  level,
  thresholdCalibration
}: {
  level: RiskLevel
  thresholdCalibration?: ReviewThresholdCalibration
}) {
  return (
    <div className='space-y-2 text-xs text-popover-foreground'>
      <p>
        {propagationRiskSignal.whyItExists} It is calculated as
        <strong> Ca x I</strong>.
      </p>
      <div className='space-y-1 border-t border-border pt-2 text-popover-foreground/80'>
        <p>
          <strong>Ca</strong>: number of incoming cross-module dependency edges.
        </p>
        <p>
          <strong>I</strong>: instability, calculated as Ce / (Ca + Ce).
        </p>
      </div>
      <div className='space-y-1 border-t border-border pt-2 text-popover-foreground/80'>
        <p>
          <strong>Critical</strong>:{' '}
          {formatReviewSignalBandRange(
            'propagationRisk',
            'critical',
            thresholdCalibration
          )}
        </p>
        <p>
          <strong>High</strong>:{' '}
          {formatReviewSignalBandRange(
            'propagationRisk',
            'high',
            thresholdCalibration
          )}
        </p>
        <p>
          <strong>Medium</strong>:{' '}
          {formatReviewSignalBandRange(
            'propagationRisk',
            'medium',
            thresholdCalibration
          )}
        </p>
        <p>
          <strong>Low</strong>:{' '}
          {formatReviewSignalBandRange(
            'propagationRisk',
            'low',
            thresholdCalibration
          )}
        </p>
      </div>
      <p className='border-t border-border pt-2 text-popover-foreground/80'>
        {propagationRiskSignal.scientificStatusNote}
      </p>
      <p className='border-t border-border pt-2 text-popover-foreground/80'>
        <strong>Current interpretation:</strong> {getRiskLabel(level)}. A high
        score means many dependents combined with a structure that can spread
        change impact widely. A low score does not mean low Dependents (Ca).
      </p>
    </div>
  )
}

function DependentImpactTooltipContent({
  ca,
  thresholdCalibration
}: {
  ca: number
  thresholdCalibration?: ReviewThresholdCalibration
}) {
  return (
    <div className='space-y-2 text-xs text-popover-foreground'>
      <p>
        Dependent Impact is an interpretive indicator based on{' '}
        <strong>Dependents (Ca)</strong>.
      </p>
      <div className='space-y-1 border-t border-border pt-2 text-popover-foreground/80'>
        <p>
          <strong>Dependents (Ca)</strong>: incoming cross-module dependency
          edges that point into this module.
        </p>
        <p>
          Higher values mean more downstream edges may need review after a
          change, regardless of Instability.
        </p>
      </div>
      <div className='space-y-1 border-t border-border pt-2 text-popover-foreground/80'>
        <p>
          <strong>Broad</strong>:{' '}
          {formatReviewSignalBandRange(
            'impactScope',
            'Broad',
            'module',
            thresholdCalibration
          )}
        </p>
        <p>
          <strong>Moderate</strong>:{' '}
          {formatReviewSignalBandRange(
            'impactScope',
            'Moderate',
            'module',
            thresholdCalibration
          )}
        </p>
        <p>
          <strong>Local</strong>:{' '}
          {formatReviewSignalBandRange(
            'impactScope',
            'Local',
            'module',
            thresholdCalibration
          )}
        </p>
      </div>
      <p className='border-t border-border pt-2 text-popover-foreground/80'>
        {moduleImpactScopeSignal.scientificStatusNote}
      </p>
      <p className='border-t border-border pt-2 text-popover-foreground/80'>
        <strong>Current value:</strong> Ca = {ca}
      </p>
    </div>
  )
}

const metricTooltipContent: Record<string, string> = {
  Files: 'Number of files grouped into this module.',
  [METRIC_LABELS.dependentsCa]: METRIC_TOOLTIPS.dependentsCa,
  [METRIC_LABELS.dependenciesCe]: METRIC_TOOLTIPS.dependenciesCe,
  [METRIC_LABELS.instability]: METRIC_TOOLTIPS.instability,
  [METRIC_LABELS.propagationRisk]: METRIC_TOOLTIPS.propagationRisk
}

function ModuleHeader({
  modulePath,
  onClose
}: Pick<ModuleSidePanelProps, 'modulePath' | 'onClose'>) {
  const folderName = modulePath.split('/').pop() ?? modulePath

  return (
    <DetailPanelHeader
      icon={<Folder className='h-4 w-4 text-muted-foreground' />}
      title={folderName}
      subtitle={modulePath}
      onClose={onClose}
    />
  )
}

interface InstabilityCardProps {
  moduleData: FolderArchitectureMetrics
}

function InstabilityCard({ moduleData }: InstabilityCardProps) {
  const config = getInstabilityConfig(moduleData.instability)
  const formulaText =
    moduleData.ca + moduleData.ce === 0
      ? 'No incoming or outgoing couplings detected.'
      : `Formula: Ce / (Ca + Ce) = ${moduleData.ce} / (${moduleData.ca} + ${moduleData.ce}) = ${moduleData.instability.toFixed(2)}`

  return (
    <MetricInsightCard
      icon={<Folder className={`h-4 w-4 ${config.textClass}`} />}
      title={config.label}
      value={`I: ${moduleData.instability.toFixed(2)}`}
      description={config.description}
      footer={formulaText}
      tone={config.band === 'flexible' ? 'info' : 'default'}
      titleSuffix={
        <InfoTooltip
          title='Instability Profile'
          side='top'
          align='start'
          className='max-w-sm'
          iconClassName={config.textClass}
        >
          <InstabilityTooltipContent band={config.band} />
        </InfoTooltip>
      }
      className={`${config.borderClass} ${config.bgClass}`}
    />
  )
}

interface PropagationRiskCardProps {
  moduleData: FolderArchitectureMetrics
  thresholdCalibration?: ReviewThresholdCalibration
}

function DependentImpactCard({
  moduleData,
  thresholdCalibration
}: PropagationRiskCardProps) {
  const config = describeDependentImpact(moduleData.ca, thresholdCalibration)

  return (
    <MetricInsightCard
      icon={<AlertTriangle className={`h-4 w-4 ${config.textClass}`} />}
      title={config.title}
      value={`Ca: ${moduleData.ca}`}
      description={config.description}
      footer={config.footer}
      tone={config.tone}
      titleSuffix={
        <InfoTooltip
          title='Dependent Impact'
          side='top'
          align='start'
          className='max-w-sm'
          iconClassName={config.textClass}
        >
          <DependentImpactTooltipContent
            ca={moduleData.ca}
            thresholdCalibration={thresholdCalibration}
          />
        </InfoTooltip>
      }
      className={`${config.borderClass} ${config.bgClass}`}
    />
  )
}

function PropagationRiskCard({
  moduleData,
  thresholdCalibration
}: PropagationRiskCardProps) {
  const riskProfile = createRiskProfile(
    moduleData.folderPath,
    {
      ca: moduleData.ca,
      ce: moduleData.ce,
      instability: moduleData.instability,
      hasCycle: moduleData.hasCycle
    },
    thresholdCalibration
  )
  const description = moduleData.hasCycle
    ? 'This module participates in a circular dependency. Break the cycle first because changes can feed back into the same dependency chain.'
    : getRiskDescription(riskProfile.level)
  const isLowPropagationWithHighDependents =
    riskProfile.level === 'low' &&
    resolveImpactScope(moduleData.ca, 'module', thresholdCalibration) ===
      'Broad'
  const propagationDescription = isLowPropagationWithHighDependents
    ? 'Low propagation risk. Outward dependency pressure is limited, but many dependents still rely on this module and should be reviewed before changes.'
    : description

  return (
    <MetricInsightCard
      icon={
        riskProfile.level === 'low' ? (
          <CheckCircle className='h-4 w-4 text-slate-500' />
        ) : (
          <AlertTriangle
            className={`h-4 w-4 ${getRiskTextClass(riskProfile.level)}`}
          />
        )
      }
      title={`${getRiskLabel(riskProfile.level)} Propagation Risk`}
      value={riskProfile.riskScore.toFixed(1)}
      description={propagationDescription}
      footer={`Formula: Ca x I = ${moduleData.ca} x ${moduleData.instability.toFixed(2)} = ${riskProfile.riskScore.toFixed(1)}`}
      tone={
        riskProfile.level === 'low'
          ? 'default'
          : riskProfile.level === 'medium'
            ? 'warning'
            : 'danger'
      }
      titleSuffix={
        <InfoTooltip
          title='Propagation Risk'
          side='top'
          align='start'
          className='max-w-sm'
          iconClassName={getRiskTextClass(riskProfile.level)}
        >
          <PropagationRiskTooltipContent
            level={riskProfile.level}
            thresholdCalibration={thresholdCalibration}
          />
        </InfoTooltip>
      }
      className={`${getRiskBorderClass(riskProfile.level)} ${getRiskBgOpacityClass(riskProfile.level, 5)}`}
    />
  )
}

interface OverviewTabProps {
  moduleData: FolderArchitectureMetrics
  thresholdCalibration?: ReviewThresholdCalibration
}

function OverviewTab({ moduleData, thresholdCalibration }: OverviewTabProps) {
  const { analysisData } = useDataContext()
  const evolution = moduleData.evolution
  const changeHistoryAvailable = isEvolutionaryMetricsAvailable(
    analysisData?.evolutionaryMetrics.summary
  )
  const riskScore = calculateRiskScore(moduleData.ca, moduleData.instability)
  const decisionAssessment = createDecisionAssessment({
    kind: 'module',
    hasCycle: moduleData.hasCycle,
    ca: moduleData.ca,
    ce: moduleData.ce,
    instability: moduleData.instability,
    relativeChurn30d: evolution?.churn30d.relativeChurn ?? 0,
    changeHistoryAvailable,
    thresholdCalibration
  })

  return (
    <div className='space-y-4 p-4'>
      {decisionAssessment ? (
        <div className='space-y-3'>
          <DecisionStorySection
            assessment={decisionAssessment}
            icon={DECISION_CARD_TONE_ICON[decisionAssessment.tone]}
            changeActivityValue={
              changeHistoryAvailable ? undefined : 'Unavailable'
            }
            changeActivityTone={changeHistoryAvailable ? undefined : 'default'}
            fallbackActionLead='Review this module carefully.'
            evidenceHelpers={{
              impactScope: (
                <span className='text-[11px] text-muted-foreground'>
                  {formatImpactScopeHelper(moduleData.ca, 'module')}
                </span>
              ),
              changeActivity:
                changeHistoryAvailable && evolution ? (
                  <span className='text-[11px] text-muted-foreground'>
                    {formatChangePressureHelper(
                      evolution.churn30d.relativeChurn
                    )}
                  </span>
                ) : !changeHistoryAvailable ? (
                  <span className='text-[11px] text-muted-foreground'>
                    Git history is unavailable for recent change signals.
                  </span>
                ) : null,
              dependencies: (
                <span className='text-[11px] text-muted-foreground'>
                  {formatExternalRelianceHelper(moduleData.ce, 'module')}
                </span>
              ),
              architectureRole: (
                <span className='text-[11px] text-muted-foreground'>
                  {formatStructuralPositionHelper(moduleData.instability)}
                </span>
              )
            }}
          />
        </div>
      ) : null}

      {decisionAssessment ? (
        <DetailPanelDisclosure
          title={graphCopy.modulePanel.disclosure.whyTitle}
          summary={graphCopy.modulePanel.disclosure.whySummary}
        >
          <div className='space-y-3'>
            <DetailPanelSectionHeading
              title={graphCopy.modulePanel.disclosure.howAssessedTitle}
            />
            <InsightBulletList items={getAssessmentMethodItems()} />
          </div>

          <div className='space-y-3'>
            <InstabilityCard moduleData={moduleData} />
            <DependentImpactCard moduleData={moduleData} />
            <PropagationRiskCard
              moduleData={moduleData}
              thresholdCalibration={thresholdCalibration}
            />
          </div>
          <div className='space-y-3'>
            <DetailPanelSectionHeading
              title={graphCopy.modulePanel.disclosure.supportingMetricsTitle}
            />
            <div className='grid grid-cols-2 gap-3'>
              <MetricValueCard
                value={moduleData.fileCount}
                label={graphCopy.modulePanel.supportingMetrics.files}
                tooltip={metricTooltipContent.Files}
              />
              <MetricValueCard
                value={moduleData.ca}
                label={METRIC_LABELS.dependentsCa}
                tooltip={metricTooltipContent[METRIC_LABELS.dependentsCa]}
              />
              <MetricValueCard
                value={moduleData.ce}
                label={METRIC_LABELS.dependenciesCe}
                tooltip={metricTooltipContent[METRIC_LABELS.dependenciesCe]}
              />
              <MetricValueCard
                value={moduleData.instability.toFixed(2)}
                label={METRIC_LABELS.instability}
                tooltip={metricTooltipContent[METRIC_LABELS.instability]}
              />
              <MetricValueCard
                value={riskScore.toFixed(1)}
                label={METRIC_LABELS.propagationRisk}
                tooltip={metricTooltipContent[METRIC_LABELS.propagationRisk]}
              />
              <MetricValueCard
                value={
                  evolution && changeHistoryAvailable
                    ? formatRelativeChurn(evolution.churn30d.relativeChurn)
                    : 'Unavailable'
                }
                label={METRIC_LABELS.relativeChurn30d}
                tooltip={METRIC_TOOLTIPS.relativeChurn30d}
              />
              <MetricValueCard
                value={
                  evolution && changeHistoryAvailable
                    ? evolution.hotspotScore.toFixed(2)
                    : 'Unavailable'
                }
                label={METRIC_LABELS.evolutionaryHotspotScore}
                tooltip={METRIC_TOOLTIPS.evolutionaryHotspotScore}
                helper={
                  evolution && changeHistoryAvailable ? (
                    <HotspotStatusLabel
                      status={evolution.hotspotStatus}
                      className='text-[11px] text-muted-foreground'
                    />
                  ) : !changeHistoryAvailable ? (
                    <span className='text-[11px] text-muted-foreground'>
                      Git history is unavailable for hotspot ranking.
                    </span>
                  ) : null
                }
              />
            </div>
          </div>
        </DetailPanelDisclosure>
      ) : (
        <>
          <InstabilityCard moduleData={moduleData} />
          <DependentImpactCard moduleData={moduleData} />
          <PropagationRiskCard
            moduleData={moduleData}
            thresholdCalibration={thresholdCalibration}
          />
          <div className='grid grid-cols-2 gap-3'>
            <MetricValueCard
              value={moduleData.fileCount}
              label={graphCopy.modulePanel.supportingMetrics.files}
              tooltip={metricTooltipContent.Files}
            />
            <MetricValueCard
              value={moduleData.ca}
              label={METRIC_LABELS.dependentsCa}
              tooltip={metricTooltipContent[METRIC_LABELS.dependentsCa]}
            />
            <MetricValueCard
              value={moduleData.ce}
              label={METRIC_LABELS.dependenciesCe}
              tooltip={metricTooltipContent[METRIC_LABELS.dependenciesCe]}
            />
            <MetricValueCard
              value={moduleData.instability.toFixed(2)}
              label={METRIC_LABELS.instability}
              tooltip={metricTooltipContent[METRIC_LABELS.instability]}
            />
            <MetricValueCard
              value={riskScore.toFixed(1)}
              label={METRIC_LABELS.propagationRisk}
              tooltip={metricTooltipContent[METRIC_LABELS.propagationRisk]}
            />
            <MetricValueCard
              value={
                evolution && changeHistoryAvailable
                  ? formatRelativeChurn(evolution.churn30d.relativeChurn)
                  : 'Unavailable'
              }
              label={METRIC_LABELS.relativeChurn30d}
              tooltip={METRIC_TOOLTIPS.relativeChurn30d}
            />
            <MetricValueCard
              value={
                evolution && changeHistoryAvailable
                  ? evolution.hotspotScore.toFixed(2)
                  : 'Unavailable'
              }
              label={METRIC_LABELS.evolutionaryHotspotScore}
              tooltip={METRIC_TOOLTIPS.evolutionaryHotspotScore}
              helper={
                evolution && changeHistoryAvailable ? (
                  <HotspotStatusLabel
                    status={evolution.hotspotStatus}
                    className='text-[11px] text-muted-foreground'
                  />
                ) : !changeHistoryAvailable ? (
                  <span className='text-[11px] text-muted-foreground'>
                    Git history is unavailable for hotspot ranking.
                  </span>
                ) : null
              }
            />
          </div>
        </>
      )}
    </div>
  )
}

interface FilesTabProps {
  modulePath: string
  onViewFile: (filePath: string) => void
  changeHistoryAvailable?: boolean
}

function FilesTab({
  modulePath,
  onViewFile,
  changeHistoryAvailable = true
}: FilesTabProps) {
  const { data: folderDetail, isLoading } = useFolderDetail(modulePath)

  const sortedFiles = [...(folderDetail?.files ?? [])].sort((a, b) => {
    const riskA = calculateRiskScore(a.ca, a.instability)
    const riskB = calculateRiskScore(b.ca, b.instability)
    return riskB - riskA
  })

  if (isLoading) {
    return (
      <DetailPanelState
        title={graphCopy.modulePanel.files.loadingTitle}
        description={graphCopy.modulePanel.files.loadingDescription}
        compact={true}
      />
    )
  }

  if (sortedFiles.length === 0) {
    return (
      <DetailPanelState
        title={graphCopy.modulePanel.files.emptyTitle}
        description={graphCopy.modulePanel.files.emptyDescription}
        compact={true}
      />
    )
  }

  return (
    <ScrollArea className='h-full'>
      <div className='space-y-2 p-4'>
        {sortedFiles.map((file, index) => {
          const riskScore = calculateRiskScore(file.ca, file.instability)

          return (
            <div
              key={file.filePath}
              className='group rounded-lg border border-border p-3 transition-colors hover:bg-muted/50'
            >
              <div className='flex min-w-0 items-center gap-2'>
                <span className='w-5 shrink-0 text-xs text-muted-foreground'>
                  {index + 1}
                </span>
                <FileCode className='h-4 w-4 shrink-0 text-muted-foreground' />
                <span className='flex-1 truncate text-sm font-medium text-foreground'>
                  {file.filePath.split('/').pop()}
                </span>
              </div>
              <div className='mt-2 flex items-center justify-between pl-7'>
                <span className='text-xs text-muted-foreground'>
                  {graphCopy.modulePanel.files.summary(
                    riskScore,
                    file.ca,
                    file.instability,
                    changeHistoryAvailable && file.evolution
                      ? formatRelativeChurn(
                          file.evolution.churn30d.relativeChurn
                        )
                      : undefined
                  )}
                </span>
                <button
                  onClick={() => onViewFile(file.filePath)}
                  className='flex items-center gap-1 text-xs text-primary opacity-0 transition-opacity hover:underline group-hover:opacity-100'
                >
                  View
                  <ArrowRight className='h-3 w-3' />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </ScrollArea>
  )
}

interface ConnectionRowProps {
  moduleName: string
  count: number
}

function ConnectionRow({ moduleName, count }: ConnectionRowProps) {
  const name = moduleName.split('/').pop() ?? moduleName

  return (
    <div className='flex items-center justify-between rounded-md px-3 py-2 transition-colors hover:bg-muted/50'>
      <div className='min-w-0'>
        <div className='truncate text-sm font-medium text-foreground'>
          {name}
        </div>
        <div
          className='truncate text-xs text-muted-foreground'
          title={moduleName}
        >
          {truncateMiddle(moduleName, 48)}
        </div>
      </div>
      <span className='ml-2 shrink-0 font-mono text-xs text-muted-foreground'>
        {count}
      </span>
    </div>
  )
}

interface ConnectionsTabProps {
  moduleData: FolderArchitectureMetrics
}

function ConnectionsTab({ moduleData }: ConnectionsTabProps) {
  const incoming = Object.entries(moduleData.couplingFrom)
  const outgoing = Object.entries(moduleData.couplingTo)

  return (
    <ScrollArea className='h-full'>
      <div className='space-y-6 p-4'>
        <section>
          <DetailPanelSectionHeading
            title={graphCopy.modulePanel.connections.incoming}
            meta={`${incoming.length} modules`}
          />
          {incoming.length === 0 ? (
            <DetailPanelState
              title={graphCopy.modulePanel.connections.noIncomingTitle}
              description={
                graphCopy.modulePanel.connections.noIncomingDescription
              }
              compact={true}
            />
          ) : (
            <div className='space-y-1'>
              {incoming.map(([path, count]) => (
                <ConnectionRow key={path} moduleName={path} count={count} />
              ))}
            </div>
          )}
        </section>

        <section>
          <DetailPanelSectionHeading
            title={graphCopy.modulePanel.connections.outgoing}
            meta={`${outgoing.length} modules`}
          />
          {outgoing.length === 0 ? (
            <DetailPanelState
              title={graphCopy.modulePanel.connections.noOutgoingTitle}
              description={
                graphCopy.modulePanel.connections.noOutgoingDescription
              }
              compact={true}
            />
          ) : (
            <div className='space-y-1'>
              {outgoing.map(([path, count]) => (
                <ConnectionRow key={path} moduleName={path} count={count} />
              ))}
            </div>
          )}
        </section>
      </div>
    </ScrollArea>
  )
}

export function ModuleSidePanel({
  modulePath,
  onClose,
  onViewFile,
  moduleData
}: ModuleSidePanelProps) {
  const { analysisData } = useDataContext()
  const moduleThresholdCalibration = useModuleReviewThresholdCalibration()
  const changeHistoryAvailable = isEvolutionaryMetricsAvailable(
    analysisData?.evolutionaryMetrics.summary
  )

  return (
    <div className='flex h-full w-full flex-col bg-background'>
      <ModuleHeader modulePath={modulePath} onClose={onClose} />

      <Tabs defaultValue='overview' className='flex min-h-0 flex-1 flex-col'>
        <DetailPanelTabs
          items={[
            { value: 'overview', label: graphCopy.modulePanel.tabs.overview },
            { value: 'files', label: graphCopy.modulePanel.tabs.files },
            {
              value: 'connections',
              label: graphCopy.modulePanel.tabs.connections
            }
          ]}
        />

        <TabsContent
          value='overview'
          className='mt-0 min-h-0 flex-1 overflow-y-auto'
        >
          {moduleData ? (
            <OverviewTab
              moduleData={moduleData}
              thresholdCalibration={moduleThresholdCalibration}
            />
          ) : (
            <div className='p-4'>
              <DetailPanelState
                title={graphCopy.modulePanel.overview.noModuleTitle}
                description={graphCopy.modulePanel.overview.noModuleDescription}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value='files' className='mt-0 min-h-0 flex-1'>
          <FilesTab
            modulePath={modulePath}
            onViewFile={onViewFile}
            changeHistoryAvailable={changeHistoryAvailable}
          />
        </TabsContent>

        <TabsContent value='connections' className='mt-0 min-h-0 flex-1'>
          {moduleData ? (
            <ConnectionsTab moduleData={moduleData} />
          ) : (
            <div className='p-4'>
              <DetailPanelState
                title={graphCopy.modulePanel.connections.noDataTitle}
                description={
                  graphCopy.modulePanel.connections.noDataDescription
                }
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
