import { useQuery } from '@tanstack/react-query'

import { DetailPanelHeader } from '@/shared/components/ui/detail-panel-header'
import { DetailPanelSectionHeading } from '@/shared/components/ui/detail-panel-section-heading'
import { DetailPanelState } from '@/shared/components/ui/detail-panel-state'
import { DetailPanelTabs } from '@/shared/components/ui/detail-panel-tabs'
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  FileCode,
  Folder
} from '@/shared/components/ui/icons'
import { InfoTooltip } from '@/shared/components/ui/info-tooltip'
import { MetricInsightCard } from '@/shared/components/ui/metric-insight-card'
import { MetricValueCard } from '@/shared/components/ui/metric-value-card'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { Tabs, TabsContent } from '@/shared/components/ui/tabs'
import { architectureApi } from '@/shared/lib/api'
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
          'This module depends on other modules more than other modules depend on it. High instability is common in UI, route, and adapter layers and does not automatically mean high change risk.'
      }
    case 'balanced':
      return {
        band,
        borderClass: 'border-slate-500/40',
        bgClass: 'bg-slate-500/5',
        textClass: 'text-slate-600',
        label: 'Balanced',
        description:
          'This module both depends on others and is depended on by others. Use Change Risk to judge whether edits are likely to propagate widely.'
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
        not automatically mean a risky change. Use <strong>Change Risk</strong>{' '}
        to estimate how widely a change may propagate.
      </p>
    </div>
  )
}

function ChangeRiskTooltipContent({ level }: { level: RiskLevel }) {
  return (
    <div className='space-y-2 text-xs text-popover-foreground'>
      <p>
        Change Risk estimates how widely the impact of a module change may
        propagate. It is calculated as <strong>Ca x I</strong>.
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
        <strong>Current interpretation:</strong> {getRiskLabel(level)}. A high
        score means many dependents combined with a structure that can spread
        change impact widely.
      </p>
    </div>
  )
}

const metricTooltipContent: Record<string, string> = {
  Files: 'Number of files grouped into this module.',
  'Ca (Incoming)':
    'Afferent Coupling. Number of incoming cross-module dependencies targeting files in this module.',
  'Ce (Outgoing)':
    'Efferent Coupling. Number of outgoing cross-module dependencies from files in this module to files outside it.',
  Instability:
    'Structural metric calculated as I = Ce / (Ca + Ce). Higher values indicate stronger outgoing dependency relative to incoming dependency.',
  'Change Risk':
    'Derived metric calculated as Ca x I. Higher values indicate a greater chance that a change in this module will affect other modules.'
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

interface ChangeRiskCardProps {
  moduleData: FolderArchitectureMetrics
}

function ChangeRiskCard({ moduleData }: ChangeRiskCardProps) {
  const riskProfile = createRiskProfile(moduleData.folderPath, {
    ca: moduleData.ca,
    ce: moduleData.ce,
    instability: moduleData.instability,
    hasCycle: moduleData.hasCycle
  })
  const description = moduleData.hasCycle
    ? 'This module participates in a circular dependency. Break the cycle first because changes can feed back into the same dependency chain.'
    : getRiskDescription(riskProfile.level)

  return (
    <MetricInsightCard
      icon={
        riskProfile.level === 'low' ? (
          <CheckCircle className='h-4 w-4 text-green-500' />
        ) : (
          <AlertTriangle
            className={`h-4 w-4 ${getRiskTextClass(riskProfile.level)}`}
          />
        )
      }
      title={`${getRiskLabel(riskProfile.level)} Change Risk`}
      value={riskProfile.riskScore.toFixed(1)}
      description={description}
      footer={`Formula: Ca x I = ${moduleData.ca} x ${moduleData.instability.toFixed(2)} = ${riskProfile.riskScore.toFixed(1)}`}
      tone={
        riskProfile.level === 'low'
          ? 'success'
          : riskProfile.level === 'medium'
            ? 'warning'
            : 'danger'
      }
      titleSuffix={
        <InfoTooltip
          title='Change Risk'
          side='top'
          align='start'
          className='max-w-sm'
          iconClassName={getRiskTextClass(riskProfile.level)}
        >
          <ChangeRiskTooltipContent level={riskProfile.level} />
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
  const riskScore = calculateRiskScore(moduleData.ca, moduleData.instability)

  return (
    <div className='space-y-4 p-4'>
      <InstabilityCard moduleData={moduleData} />
      <ChangeRiskCard moduleData={moduleData} />
      <div className='grid grid-cols-2 gap-3'>
        <MetricValueCard
          value={moduleData.fileCount}
          label='Files'
          tooltip={metricTooltipContent.Files}
        />
        <MetricValueCard
          value={moduleData.ca}
          label='Ca (Incoming)'
          tooltip={metricTooltipContent['Ca (Incoming)']}
        />
        <MetricValueCard
          value={moduleData.ce}
          label='Ce (Outgoing)'
          tooltip={metricTooltipContent['Ce (Outgoing)']}
        />
        <MetricValueCard
          value={moduleData.instability.toFixed(2)}
          label='Instability'
          tooltip={metricTooltipContent.Instability}
        />
        <MetricValueCard
          value={riskScore.toFixed(1)}
          label='Change Risk'
          tooltip={metricTooltipContent['Change Risk']}
        />
      </div>
    </div>
  )
}

interface FilesTabProps {
  modulePath: string
  onViewFile: (filePath: string) => void
}

function FilesTab({ modulePath, onViewFile }: FilesTabProps) {
  const { data: folderDetail, isLoading } = useQuery({
    queryKey: ['folder-detail', modulePath],
    queryFn: () => architectureApi.getFolderDetail(modulePath),
    enabled: !!modulePath
  })

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
                  Change Risk: {riskScore.toFixed(1)} · Dependents (Ca):{' '}
                  {file.ca} · Instability (I): {file.instability.toFixed(2)}
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
        <div className='truncate text-xs text-muted-foreground'>
          {moduleName}
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
