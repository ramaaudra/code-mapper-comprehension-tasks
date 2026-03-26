import { useCycleTriageItems } from '@/features/cycle-triage'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/shared/components/ui/card'
import { AlertTriangle, ArrowRight, Ghost } from '@/shared/components/ui/icons'
import { InfoTooltip } from '@/shared/components/ui/info-tooltip'
import { cn, getBasename } from '@/shared/lib/utils'

import { dashboardCopy } from '../content/dashboardCopy'
import { CleanupCandidatesDialog } from './CleanupCandidatesDialog'

import type {
  AnalysisData,
  CircularDependencyInfo
} from '@/shared/types/analysis'

interface IssuesPanelProps {
  data: AnalysisData | null
  onNavigateToFile?: (file: string) => void
  onShowCycleTriage?: (cycleId?: string) => void
  cleanupDialogOpen: boolean
  onCleanupDialogOpenChange: (open: boolean) => void
  onShowCleanupCandidates?: () => void
}

const severityBadgeClassMap = {
  high: 'border-status-critical-border bg-status-critical-surface text-status-critical-foreground',
  medium:
    'border-status-caution-border bg-status-caution-surface text-status-caution-foreground',
  low: 'border-status-success-border bg-status-success-surface text-status-success-foreground'
} as const

function buildFallbackCycleTitle(depInfo: CircularDependencyInfo) {
  const files = depInfo.files.map(getBasename)

  if (files.length === 2) {
    return `${files[0]} <-> ${files[1]} loop`
  }

  return `${depInfo.cycle.slice(0, -1).map(getBasename).join(' -> ')} loop`
}

export function IssuesPanel({
  data,
  onNavigateToFile,
  onShowCycleTriage,
  cleanupDialogOpen,
  onCleanupDialogOpenChange,
  onShowCleanupCandidates
}: IssuesPanelProps) {
  const { items: cycleItems } = useCycleTriageItems(data)

  if (!data?.issues) {
    return (
      <Card className='h-full'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-sm font-medium'>
            <AlertTriangle className='h-4 w-4' />
            {dashboardCopy.issuesPanel.emptyStateTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-sm text-muted-foreground'>
            {dashboardCopy.issuesPanel.emptyStateDescription}
          </p>
        </CardContent>
      </Card>
    )
  }

  const { circularDependencies, orphans } = data.issues

  const severityCounts = circularDependencies.reduce(
    (acc, dep) => {
      acc[dep.severity] = (acc[dep.severity] || 0) + 1
      return acc
    },
    {} as Record<'high' | 'medium' | 'low', number>
  )

  const previewItems =
    cycleItems.length > 0
      ? cycleItems.slice(0, 3).map((item) => ({
          key: item.id,
          title: item.title,
          subtitle: item.priorityReason,
          fixPriority: item.fixPriority,
          onClick: () => onShowCycleTriage?.(item.id)
        }))
      : circularDependencies.slice(0, 3).map((depInfo, index) => ({
          key: `${depInfo.severity}-${index}`,
          title: buildFallbackCycleTitle(depInfo),
          subtitle: `${depInfo.files.length} files in the loop.`,
          fixPriority: depInfo.severity,
          onClick: () => onShowCycleTriage?.()
        }))

  return (
    <div className='space-y-4 overflow-x-hidden'>
      <Card className='overflow-hidden border-status-critical-border bg-status-critical-surface'>
        <CardHeader className='pb-3'>
          <div className='flex flex-wrap items-start justify-between gap-3'>
            <div className='space-y-1'>
              <div className='flex items-center gap-2'>
                <AlertTriangle className='h-4 w-4 text-status-critical-foreground' />
                <span className='text-sm font-medium'>
                  {dashboardCopy.issuesPanel.cycles.title}
                </span>
              </div>
              <p className='text-xs text-muted-foreground'>
                {dashboardCopy.issuesPanel.cycles.description}
              </p>
            </div>

            <div className='flex flex-wrap items-center justify-end gap-2'>
              {(['high', 'medium', 'low'] as const).map((severity) => {
                const count = severityCounts[severity] || 0
                if (count === 0) {
                  return null
                }

                return (
                  <Badge
                    key={severity}
                    variant='outline'
                    className={cn(
                      'px-2 py-0.5 text-xs',
                      severityBadgeClassMap[severity]
                    )}
                  >
                    {count} {severity}
                  </Badge>
                )
              })}

              {circularDependencies.length > 0 ? (
                <Button
                  size='sm'
                  onClick={() => onShowCycleTriage?.()}
                  className='h-9 gap-1.5 px-3'
                >
                  {dashboardCopy.issuesPanel.cycles.cta}
                  <ArrowRight className='h-3.5 w-3.5' />
                </Button>
              ) : (
                <Badge variant='secondary'>{circularDependencies.length}</Badge>
              )}

              <InfoTooltip
                title='What is Circular Dependency?'
                side='top'
                triggerLabel='Explain why dependency cycles block safer refactors'
              >
                <div className='space-y-2'>
                  <p className='text-xs text-popover-foreground'>
                    A circular dependency occurs when module A depends on B, and
                    B depends on A directly or indirectly.
                  </p>
                  <div className='space-y-1 border-t border-border pt-1 text-xs'>
                    <p className='font-semibold text-popover-foreground'>
                      Why is it problematic?
                    </p>
                    <p className='text-popover-foreground/80'>
                      • Creates tight coupling between modules
                      <br />• Makes code harder to test in isolation
                      <br />• Can cause initialization surprises
                      <br />• Makes refactors less predictable
                    </p>
                  </div>
                </div>
              </InfoTooltip>
            </div>
          </div>
        </CardHeader>

        <CardContent className='space-y-3'>
          {circularDependencies.length === 0 ? (
            <div className='rounded-md border border-status-success-border bg-status-success-surface px-3 py-3 text-sm text-muted-foreground'>
              {dashboardCopy.issuesPanel.cycles.empty}
            </div>
          ) : (
            <>
              <div className='space-y-2'>
                {previewItems.map((item) => (
                  <button
                    key={item.key}
                    type='button'
                    onClick={item.onClick}
                    className='w-full rounded-lg border border-border/60 bg-background/70 px-3 py-3 text-left transition hover:border-primary/35 hover:bg-background'
                  >
                    <div className='flex flex-wrap items-start justify-between gap-2'>
                      <div className='min-w-0 space-y-1'>
                        <p className='truncate font-mono text-sm font-medium text-foreground'>
                          {item.title}
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          {item.subtitle}
                        </p>
                      </div>
                      <Badge
                        variant='outline'
                        className={cn(
                          'px-2 py-0.5 text-[10px] uppercase',
                          severityBadgeClassMap[item.fixPriority]
                        )}
                      >
                        {item.fixPriority}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>

              <p className='text-xs text-muted-foreground'>
                {dashboardCopy.issuesPanel.cycles.previewHint}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card className='overflow-hidden'>
        <button
          type='button'
          onClick={() => onShowCleanupCandidates?.()}
          className='group flex w-full flex-col gap-3 px-4 py-4 text-left transition-colors duration-200 hover:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:flex-row sm:items-start sm:justify-between'
        >
          <div className='min-w-0 space-y-1'>
            <div className='flex items-center gap-2'>
              <Ghost className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm font-medium'>
                {dashboardCopy.issuesPanel.cleanup.title}
              </span>
            </div>
            <p className='text-xs leading-relaxed text-muted-foreground'>
              {dashboardCopy.issuesPanel.cleanup.description}
            </p>
          </div>

          <div className='flex shrink-0 items-center gap-2 sm:justify-end'>
            <Badge
              variant={orphans.length > 0 ? 'outline' : 'secondary'}
              className='shrink-0'
            >
              {orphans.length}
            </Badge>
            <span className='inline-flex items-center gap-1 text-xs font-medium text-primary transition-colors duration-200 group-hover:text-foreground'>
              {dashboardCopy.issuesPanel.cleanup.cta}
              <ArrowRight className='h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5' />
            </span>
          </div>
        </button>
        <CleanupCandidatesDialog
          open={cleanupDialogOpen}
          onOpenChange={onCleanupDialogOpenChange}
          files={orphans}
          onNavigateToFile={onNavigateToFile}
        />
      </Card>
    </div>
  )
}
