import { useState } from 'react'

import { useCycleTriageItems } from '@/features/cycle-triage'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/shared/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/shared/components/ui/dialog'
import { AlertTriangle, ArrowRight, Ghost } from '@/shared/components/ui/icons'
import { InfoTooltip } from '@/shared/components/ui/info-tooltip'
import { getBasename, getRelativePath } from '@/shared/lib/utils'

import { dashboardCopy } from '../content/dashboardCopy'

import type {
  AnalysisData,
  CircularDependencyInfo
} from '@/shared/types/analysis'

interface IssuesPanelProps {
  data: AnalysisData | null
  onNavigateToFile?: (file: string) => void
  onShowCycleTriage?: (cycleId?: string) => void
}

const severityVariantMap = {
  high: 'destructive',
  medium: 'default',
  low: 'outline'
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
  onShowCycleTriage
}: IssuesPanelProps) {
  const [orphansDialogOpen, setOrphansDialogOpen] = useState(false)
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
      <Card className='overflow-hidden border-red-500/20 bg-red-500/5'>
        <CardHeader className='pb-3'>
          <div className='flex flex-wrap items-start justify-between gap-3'>
            <div className='space-y-1'>
              <div className='flex items-center gap-2'>
                <AlertTriangle className='h-4 w-4 text-red-500' />
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
                    variant={severityVariantMap[severity]}
                    className='px-2 py-0.5 text-xs'
                  >
                    {count} {severity}
                  </Badge>
                )
              })}

              {circularDependencies.length > 0 ? (
                <Button
                  size='sm'
                  onClick={() => onShowCycleTriage?.()}
                  className='h-8 gap-1.5'
                >
                  {dashboardCopy.issuesPanel.cycles.cta}
                  <ArrowRight className='h-3.5 w-3.5' />
                </Button>
              ) : (
                <Badge variant='secondary'>{circularDependencies.length}</Badge>
              )}

              <InfoTooltip title='What is Circular Dependency?' side='top'>
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
            <div className='rounded-md border border-emerald-500/20 bg-emerald-500/5 px-3 py-3 text-sm text-muted-foreground'>
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
                        <p className='truncate text-sm font-medium text-foreground'>
                          {item.title}
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          {item.subtitle}
                        </p>
                      </div>
                      <Badge
                        variant={severityVariantMap[item.fixPriority]}
                        className='px-2 py-0.5 text-[10px] uppercase'
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
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between gap-3'>
            <div className='space-y-1'>
              <div className='flex items-center gap-2'>
                <Ghost className='h-4 w-4 text-muted-foreground' />
                <span className='text-sm font-medium'>
                  {dashboardCopy.issuesPanel.cleanup.title}
                </span>
              </div>
              <p className='text-xs text-muted-foreground'>
                {dashboardCopy.issuesPanel.cleanup.description}
              </p>
            </div>

            <Dialog
              open={orphansDialogOpen}
              onOpenChange={setOrphansDialogOpen}
            >
              <DialogTrigger asChild>
                <Badge
                  variant={orphans.length > 0 ? 'outline' : 'secondary'}
                  className='cursor-pointer hover:opacity-80'
                >
                  {orphans.length}
                </Badge>
              </DialogTrigger>
              <DialogContent className='max-w-2xl'>
                <DialogHeader>
                  <DialogTitle className='flex items-center gap-2'>
                    <Ghost className='h-5 w-5 text-gray-500' />
                    Orphaned Files ({orphans.length})
                  </DialogTitle>
                </DialogHeader>
                <div className='max-h-96 space-y-2 overflow-y-auto p-2'>
                  {orphans.length === 0 ? (
                    <div className='py-8 text-center text-muted-foreground'>
                      <Ghost className='mx-auto h-12 w-12 opacity-50' />
                      <p>✅ No orphaned files found!</p>
                      <p className='mt-1 text-xs'>
                        All files are properly referenced.
                      </p>
                    </div>
                  ) : (
                    orphans.map((file: string) => (
                      <button
                        key={file}
                        type='button'
                        onClick={() => {
                          onNavigateToFile?.(file)
                          setOrphansDialogOpen(false)
                        }}
                        className='w-full rounded-lg bg-muted/20 px-3 py-3 text-left transition hover:bg-muted/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40'
                        title={file}
                      >
                        <p className='text-sm font-medium text-foreground'>
                          {getBasename(file)}
                        </p>
                        <p className='mt-1 truncate text-xs text-muted-foreground'>
                          {getRelativePath(file)}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>
    </div>
  )
}
