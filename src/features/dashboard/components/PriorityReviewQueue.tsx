import { Card, CardContent, CardDescription } from '@/shared/components/ui/card'
import {
  AlertTriangle,
  ArrowRight,
  Ghost,
  RefreshCw
} from '@/shared/components/ui/icons'
import { cn } from '@/shared/lib/utils'
import {
  getRiskBgOpacityClass,
  getRiskBorderClass,
  getRiskTextClass
} from '@/shared/lib/utils/risk'

import { dashboardCopy } from '../content/dashboardCopy'

import type {
  OverviewReviewQueueCategory,
  OverviewReviewQueueItem,
  OverviewReviewTarget
} from '../lib/overview-priority'

interface PriorityReviewQueueProps {
  items: OverviewReviewQueueItem[]
  onViewModule?: (modulePath: string) => void
  onShowCycleTriage?: (cycleId?: string) => void
  onShowCleanupCandidates?: () => void
}

const categoryLabels: Record<OverviewReviewQueueCategory, string> =
  dashboardCopy.priorityReviewQueue.categoryLabels

function getQueueItemIcon(item: OverviewReviewQueueItem): React.ReactNode {
  if (item.category === 'cycles') {
    return <RefreshCw className={cn('h-4 w-4', getRiskTextClass('critical'))} />
  }

  if (item.tone === 'info') {
    return <Ghost className='h-4 w-4 text-muted-foreground' />
  }

  return (
    <AlertTriangle className={cn('h-4 w-4', getRiskTextClass(item.tone))} />
  )
}

function getCategoryLabel(category: OverviewReviewQueueCategory): string {
  return categoryLabels[category]
}

export function PriorityReviewQueue({
  items,
  onViewModule,
  onShowCycleTriage,
  onShowCleanupCandidates
}: PriorityReviewQueueProps) {
  function handleSelect(target: OverviewReviewTarget): void {
    if (target.kind === 'module' && target.value) {
      onViewModule?.(target.value)
      return
    }

    if (target.kind === 'cycles') {
      onShowCycleTriage?.()
      return
    }

    if (target.kind === 'cleanup') {
      onShowCleanupCandidates?.()
    }
  }

  return (
    <Card className='border-border/70 bg-card/80'>
      <CardContent className='space-y-3 p-4'>
        {items.map((item, index) => {
          const isPrimary = index === 0
          const interactive = item.target.kind !== 'overview'

          const content = (
            <div className='flex flex-col gap-3 md:flex-row md:items-start md:justify-between'>
              <div className='min-w-0 flex-1 space-y-2'>
                <div className='flex flex-wrap items-center gap-2'>
                  <span className='shrink-0'>{getQueueItemIcon(item)}</span>
                  <span
                    className={cn(
                      'rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                      isPrimary
                        ? 'border-primary/25 bg-primary/15 text-foreground'
                        : 'border-border/70 bg-muted/40 text-muted-foreground'
                    )}
                  >
                    {getCategoryLabel(item.category)}
                  </span>
                  <span
                    className={cn(
                      'text-xs font-medium',
                      item.tone !== 'info' && getRiskTextClass(item.tone),
                      item.tone === 'info' && 'text-muted-foreground'
                    )}
                  >
                    {item.evidenceLabel}
                  </span>
                </div>

                <div className='space-y-1.5'>
                  <p
                    className={cn(
                      'font-semibold leading-tight text-foreground',
                      isPrimary ? 'text-lg' : 'text-base'
                    )}
                  >
                    {item.title}
                  </p>
                  {isPrimary ? (
                    <>
                      <p className='max-w-3xl text-sm leading-relaxed text-muted-foreground'>
                        {item.reason}
                      </p>
                      <CardDescription className='max-w-3xl text-sm leading-relaxed text-foreground/90'>
                        {item.recommendedAction}
                      </CardDescription>
                    </>
                  ) : null}
                </div>
              </div>

              <div className='flex shrink-0 items-center justify-end text-sm font-medium text-primary'>
                <span>{item.target.ctaLabel}</span>
                <ArrowRight className='ml-1 h-4 w-4' />
              </div>
            </div>
          )

          const className = cn(
            'w-full rounded-xl border p-4 text-left',
            'min-h-11 transition-all duration-200 hover:border-border/80 hover:bg-muted/30',
            interactive &&
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            isPrimary
              ? cn(
                  'border-border bg-muted/10',
                  item.tone !== 'info' && getRiskBorderClass(item.tone),
                  item.tone !== 'info' && getRiskBgOpacityClass(item.tone, 15)
                )
              : 'border-border/60 bg-background/60'
          )

          if (!interactive) {
            return (
              <div key={item.id} className={className}>
                {content}
              </div>
            )
          }

          return (
            <button
              key={item.id}
              type='button'
              onClick={() => handleSelect(item.target)}
              className={className}
            >
              {content}
            </button>
          )
        })}
      </CardContent>
    </Card>
  )
}
