import { useFolderDetail } from '@/features/architecture'
import { DetailPanelDisclosure } from '@/shared/components/ui/detail-panel-disclosure'
import { DetailPanelHeader } from '@/shared/components/ui/detail-panel-header'
import { DetailPanelSectionHeading } from '@/shared/components/ui/detail-panel-section-heading'
import { DetailPanelState } from '@/shared/components/ui/detail-panel-state'
import { DetailPanelTabs } from '@/shared/components/ui/detail-panel-tabs'
import { DiagnosisCard } from '@/shared/components/ui/diagnosis-card'
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
import { METRIC_LABELS, METRIC_TOOLTIPS } from '@/shared/lib/metric-copy'
import {
  createDecisionAssessment,
  formatRelativeChurn,
  getChangePressureTone,
  getExternalRelianceTone,
  getImpactScopeTone,
  getStructuralPositionTone,
  truncateMiddle
} from '@/shared/lib/utils'
import {
  RISK_THRESHOLDS,
  calculateRiskScore,
  createRiskProfile,
  getRiskBgOpacityClass,
  getRiskBorderClass,
  getRiskDescription,
  getRiskLabel,
  getRiskTextClass
} from '@/shared/lib/utils/risk'

import type { FolderArchitectureMetrics } from '@/features/architecture/types/architecture'
import type {
  DecisionStatusTone,
  ImpactScopeThresholds
} from '@/shared/lib/utils'
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

type DependentImpactLevel = 'low' | 'medium' | 'high' | 'critical'

interface DependentImpactConfig {
  level: DependentImpactLevel
  title: string
  description: string
  tone: 'default' | 'warning' | 'danger'
  borderClass: string
  bgClass: string
  textClass: string
}

const DECISION_CARD_TONE_ICON = {
  danger: <AlertTriangle className='h-4 w-4 text-red-500' />,
  warning: <AlertTriangle className='h-4 w-4 text-orange-500' />,
  info: <Folder className='h-4 w-4 text-sky-500' />,
  success: <CheckCircle className='h-4 w-4 text-green-500' />,
  default: <CheckCircle className='h-4 w-4 text-green-500' />
} satisfies Record<DecisionStatusTone, React.ReactNode>

const MODULE_IMPACT_SCOPE_THRESHOLDS: ImpactScopeThresholds = {
  broad: 30,
  moderate: 10
}

function getInstabilityBand(instability: number): InstabilityBand {
  if (instability >= 0.7) {
    return 'flexible'
  }
  if (instability >= 0.4) {
    return 'balanced'
  }
  return 'rigid'
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
          'This module depends on other modules more than other modules depend on it. High instability is common in UI, route, and adapter layers and does not automatically mean high propagation risk.'
      }
    case 'balanced':
      return {
        band,
        borderClass: 'border-slate-500/40',
        bgClass: 'bg-slate-500/5',
        textClass: 'text-slate-600',
        label: 'Balanced',
        description:
          'This module both depends on others and is depended on by others. Review both dependents and outgoing dependencies before changing it.'
      }
    default:
      return {
        band,
        borderClass: 'border-indigo-500/40',
        bgClass: 'bg-indigo-500/5',
        textClass: 'text-indigo-600',
        label: 'Rigid / Stable',
        description:
          'Other modules may rely on this module more than this module relies on them. Low instability often appears in shared or foundational layers, so change impact depends heavily on Ca.'
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
          <strong>Rigid / Stable</strong>: I {'<'} 0.40. Other modules depend on
          this module more than it depends on them.
        </p>
        <p>
          <strong>Balanced</strong>: 0.40 to {'<'} 0.70. Incoming and outgoing
          coupling are both significant.
        </p>
        <p>
          <strong>Flexible / Unstable</strong>: I {'>='} 0.70. This module
          depends on external modules more than they depend on it.
        </p>
      </div>
      <p className='border-t border-border pt-2 text-popover-foreground/80'>
        <strong>Current interpretation:</strong> {band}. High instability does
        not automatically mean a risky change. Review{' '}
        <strong>Dependent Impact</strong> together with{' '}
        <strong>Propagation Risk</strong>.
      </p>
    </div>
  )
}

function PropagationRiskTooltipContent({ level }: { level: RiskLevel }) {
  return (
    <div className='space-y-2 text-xs text-popover-foreground'>
      <p>
        Propagation Risk is a derived heuristic that estimates how strongly
        change pressure may travel through dependents. It is calculated as
        <strong> Ca x I</strong>.
      </p>
      <div className='space-y-1 border-t border-border pt-2 text-popover-foreground/80'>
        <p>
          <strong>Ca</strong>: number of incoming cross-module dependencies.
        </p>
        <p>
          <strong>I</strong>: instability, calculated as Ce / (Ca + Ce).
        </p>
      </div>
      <div className='space-y-1 border-t border-border pt-2 text-popover-foreground/80'>
        <p>
          <strong>Critical</strong>: {'>='}
          {RISK_THRESHOLDS.CRITICAL}
        </p>
        <p>
          <strong>High</strong>: {RISK_THRESHOLDS.HIGH} to {'<'}
          {RISK_THRESHOLDS.CRITICAL}
        </p>
        <p>
          <strong>Medium</strong>: {RISK_THRESHOLDS.MEDIUM} to {'<'}
          {RISK_THRESHOLDS.HIGH}
        </p>
        <p>
          <strong>Low</strong>: {'<'}
          {RISK_THRESHOLDS.MEDIUM}
        </p>
      </div>
      <p className='border-t border-border pt-2 text-popover-foreground/80'>
        These thresholds are product heuristics for review prioritization, not
        universal scientific cutoffs.
      </p>
      <p className='border-t border-border pt-2 text-popover-foreground/80'>
        <strong>Current interpretation:</strong> {getRiskLabel(level)}. A high
        score means many dependents combined with a structure that can spread
        change impact widely. A low score does not mean low Dependents (Ca).
      </p>
    </div>
  )
}

function getDependentImpactConfig(ca: number): DependentImpactConfig {
  if (ca >= 100) {
    return {
      level: 'critical',
      title: 'Very High Dependent Impact',
      description:
        'Many other modules depend on this module. Even small changes may require broad review and regression testing.',
      tone: 'danger',
      borderClass: 'border-red-500/40',
      bgClass: 'bg-red-500/5',
      textClass: 'text-red-500'
    }
  }

  if (ca >= 30) {
    return {
      level: 'high',
      title: 'High Dependent Impact',
      description:
        'A substantial number of modules depend on this module. Plan careful verification before changing it.',
      tone: 'warning',
      borderClass: 'border-orange-500/40',
      bgClass: 'bg-orange-500/5',
      textClass: 'text-orange-500'
    }
  }

  if (ca >= 10) {
    return {
      level: 'medium',
      title: 'Moderate Dependent Impact',
      description:
        'Several modules depend on this module. Review likely dependents before changing it.',
      tone: 'warning',
      borderClass: 'border-yellow-500/40',
      bgClass: 'bg-yellow-500/5',
      textClass: 'text-yellow-500'
    }
  }

  return {
    level: 'low',
    title: 'Low Dependent Impact',
    description:
      'Few other modules depend on this module, so review scope should stay relatively localized.',
    tone: 'default',
    borderClass: 'border-slate-500/40',
    bgClass: 'bg-slate-500/5',
    textClass: 'text-slate-500'
  }
}

function DependentImpactTooltipContent({ ca }: { ca: number }) {
  return (
    <div className='space-y-2 text-xs text-popover-foreground'>
      <p>
        Dependent Impact is an interpretive indicator based on{' '}
        <strong>Dependents (Ca)</strong>.
      </p>
      <div className='space-y-1 border-t border-border pt-2 text-popover-foreground/80'>
        <p>
          <strong>Dependents (Ca)</strong>: number of modules that depend on
          this module.
        </p>
        <p>
          Higher values mean more modules may need review after a change,
          regardless of Instability.
        </p>
      </div>
      <p className='border-t border-border pt-2 text-popover-foreground/80'>
        The current impact bands are product heuristics chosen for readability
        in the module panel.
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
}

function DependentImpactCard({ moduleData }: PropagationRiskCardProps) {
  const config = getDependentImpactConfig(moduleData.ca)

  return (
    <MetricInsightCard
      icon={<AlertTriangle className={`h-4 w-4 ${config.textClass}`} />}
      title={config.title}
      value={`Ca: ${moduleData.ca}`}
      description={config.description}
      footer='Interpretation based on Dependents (Ca). High dependent impact can coexist with low propagation risk.'
      tone={config.tone}
      titleSuffix={
        <InfoTooltip
          title='Dependent Impact'
          side='top'
          align='start'
          className='max-w-sm'
          iconClassName={config.textClass}
        >
          <DependentImpactTooltipContent ca={moduleData.ca} />
        </InfoTooltip>
      }
      className={`${config.borderClass} ${config.bgClass}`}
    />
  )
}

function PropagationRiskCard({ moduleData }: PropagationRiskCardProps) {
  const riskProfile = createRiskProfile(moduleData.folderPath, {
    ca: moduleData.ca,
    ce: moduleData.ce,
    instability: moduleData.instability,
    hasCycle: moduleData.hasCycle
  })
  const description = moduleData.hasCycle
    ? 'This module participates in a circular dependency. Break the cycle first because changes can feed back into the same dependency chain.'
    : getRiskDescription(riskProfile.level)
  const isLowPropagationWithHighDependents =
    riskProfile.level === 'low' && moduleData.ca >= 30
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
          <PropagationRiskTooltipContent level={riskProfile.level} />
        </InfoTooltip>
      }
      className={`${getRiskBorderClass(riskProfile.level)} ${getRiskBgOpacityClass(riskProfile.level, 5)}`}
    />
  )
}

interface OverviewTabProps {
  moduleData: FolderArchitectureMetrics
}

function OverviewTab({ moduleData }: OverviewTabProps) {
  const evolution = moduleData.evolution
  const riskScore = calculateRiskScore(moduleData.ca, moduleData.instability)
  const decisionAssessment = evolution
    ? createDecisionAssessment({
        kind: 'module',
        hasCycle: moduleData.hasCycle,
        ca: moduleData.ca,
        ce: moduleData.ce,
        instability: moduleData.instability,
        relativeChurn30d: evolution.churn30d.relativeChurn,
        impactScopeThresholds: MODULE_IMPACT_SCOPE_THRESHOLDS
      })
    : null

  return (
    <div className='space-y-4 p-4'>
      {decisionAssessment ? (
        <div className='space-y-3'>
          <DiagnosisCard
            icon={DECISION_CARD_TONE_ICON[decisionAssessment.tone]}
            headline={decisionAssessment.headline}
            taxonomyLabel={decisionAssessment.title}
            reviewPriority={decisionAssessment.reviewPriority}
            summary={decisionAssessment.summary}
            basisSummary={decisionAssessment.basisSummary}
            actionLead={
              decisionAssessment.actions[0] ?? 'Review this module carefully.'
            }
            actionList={
              decisionAssessment.actions.length > 1 ? (
                <InsightBulletList
                  items={decisionAssessment.actions.slice(1)}
                />
              ) : undefined
            }
            driversLead={decisionAssessment.topDrivers[0] ?? ''}
            driversList={
              decisionAssessment.topDrivers.length > 1 ? (
                <InsightBulletList
                  items={decisionAssessment.topDrivers.slice(1)}
                />
              ) : undefined
            }
            tone={decisionAssessment.tone}
          />
          <div className='grid grid-cols-2 gap-3'>
            <MetricValueCard
              value={decisionAssessment.impactScope}
              label='Impact Scope'
              tone={getImpactScopeTone(decisionAssessment.impactScope)}
              helper={
                <span className='text-[11px] text-muted-foreground'>
                  Dependents (Ca): {moduleData.ca}
                </span>
              }
            />
            <MetricValueCard
              value={decisionAssessment.changePressure}
              label='Change Pressure'
              tone={getChangePressureTone(decisionAssessment.changePressure)}
              helper={
                evolution ? (
                  <span className='text-[11px] text-muted-foreground'>
                    Relative Churn (30d):{' '}
                    {formatRelativeChurn(evolution.churn30d.relativeChurn)}
                  </span>
                ) : null
              }
            />
            <MetricValueCard
              value={decisionAssessment.externalReliance}
              label='External Reliance'
              tone={getExternalRelianceTone(
                decisionAssessment.externalReliance
              )}
              helper={
                <span className='text-[11px] text-muted-foreground'>
                  Dependencies (Ce): {moduleData.ce}
                </span>
              }
            />
            <MetricValueCard
              value={decisionAssessment.structuralPosition}
              label='Structural Position'
              tone={getStructuralPositionTone(
                decisionAssessment.structuralPosition
              )}
              helper={
                <span className='text-[11px] text-muted-foreground'>
                  Instability (I): {moduleData.instability.toFixed(2)}
                </span>
              }
            />
          </div>
        </div>
      ) : null}

      {decisionAssessment ? (
        <DetailPanelDisclosure
          title='Why this recommendation'
          summary='Inspect the structural and evolutionary evidence behind this verdict.'
        >
          <div className='space-y-3'>
            <InstabilityCard moduleData={moduleData} />
            <DependentImpactCard moduleData={moduleData} />
            <PropagationRiskCard moduleData={moduleData} />
          </div>
          <div className='space-y-3'>
            <DetailPanelSectionHeading title='Supporting Metrics' />
            <div className='grid grid-cols-2 gap-3'>
              <MetricValueCard
                value={moduleData.fileCount}
                label='Files'
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
                  evolution
                    ? formatRelativeChurn(evolution.churn30d.relativeChurn)
                    : 'n/a'
                }
                label={METRIC_LABELS.relativeChurn30d}
                tooltip={METRIC_TOOLTIPS.relativeChurn30d}
              />
              <MetricValueCard
                value={evolution ? evolution.hotspotScore.toFixed(2) : 'n/a'}
                label={METRIC_LABELS.evolutionaryHotspotScore}
                tooltip={METRIC_TOOLTIPS.evolutionaryHotspotScore}
                helper={
                  evolution ? (
                    <HotspotStatusLabel
                      status={evolution.hotspotStatus}
                      className='text-[11px] text-muted-foreground'
                    />
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
          <PropagationRiskCard moduleData={moduleData} />
          <div className='grid grid-cols-2 gap-3'>
            <MetricValueCard
              value={moduleData.fileCount}
              label='Files'
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
                evolution
                  ? formatRelativeChurn(evolution.churn30d.relativeChurn)
                  : 'n/a'
              }
              label={METRIC_LABELS.relativeChurn30d}
              tooltip={METRIC_TOOLTIPS.relativeChurn30d}
            />
            <MetricValueCard
              value={evolution ? evolution.hotspotScore.toFixed(2) : 'n/a'}
              label={METRIC_LABELS.evolutionaryHotspotScore}
              tooltip={METRIC_TOOLTIPS.evolutionaryHotspotScore}
              helper={
                evolution ? (
                  <HotspotStatusLabel
                    status={evolution.hotspotStatus}
                    className='text-[11px] text-muted-foreground'
                  />
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
}

function FilesTab({ modulePath, onViewFile }: FilesTabProps) {
  const { data: folderDetail, isLoading } = useFolderDetail(modulePath)

  const sortedFiles = [...(folderDetail?.files ?? [])].sort((a, b) => {
    const riskA = calculateRiskScore(a.ca, a.instability)
    const riskB = calculateRiskScore(b.ca, b.instability)
    return riskB - riskA
  })

  if (isLoading) {
    return (
      <DetailPanelState
        title='Loading module files'
        description='Preparing the list of files inside this module.'
        compact={true}
      />
    )
  }

  if (sortedFiles.length === 0) {
    return (
      <DetailPanelState
        title='No files found'
        description='This module currently has no file entries in the analysis result.'
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
                  Propagation Risk: {riskScore.toFixed(1)} · Dependents (Ca):{' '}
                  {file.ca} · Instability (I): {file.instability.toFixed(2)}
                  {file.evolution
                    ? ` · Churn (30d): ${formatRelativeChurn(file.evolution.churn30d.relativeChurn)}`
                    : ''}
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
            title='Incoming'
            meta={`${incoming.length} modules`}
          />
          {incoming.length === 0 ? (
            <DetailPanelState
              title='No incoming module dependencies'
              description='No other modules currently depend on this module.'
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
            title='Outgoing'
            meta={`${outgoing.length} modules`}
          />
          {outgoing.length === 0 ? (
            <DetailPanelState
              title='No outgoing module dependencies'
              description='This module currently has no outgoing dependencies to other modules.'
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
  return (
    <div className='flex h-full w-full flex-col bg-background'>
      <ModuleHeader modulePath={modulePath} onClose={onClose} />

      <Tabs defaultValue='overview' className='flex min-h-0 flex-1 flex-col'>
        <DetailPanelTabs
          items={[
            { value: 'overview', label: 'Overview' },
            { value: 'files', label: 'Files' },
            { value: 'connections', label: 'Connections' }
          ]}
        />

        <TabsContent
          value='overview'
          className='mt-0 min-h-0 flex-1 overflow-y-auto'
        >
          {moduleData ? (
            <OverviewTab moduleData={moduleData} />
          ) : (
            <div className='p-4'>
              <DetailPanelState
                title='No module data available'
                description='The current analysis result does not include architecture metrics for this module.'
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value='files' className='mt-0 min-h-0 flex-1'>
          <FilesTab modulePath={modulePath} onViewFile={onViewFile} />
        </TabsContent>

        <TabsContent value='connections' className='mt-0 min-h-0 flex-1'>
          {moduleData ? (
            <ConnectionsTab moduleData={moduleData} />
          ) : (
            <div className='p-4'>
              <DetailPanelState
                title='No connection data available'
                description='The analysis result does not include incoming or outgoing module connections for this module.'
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
