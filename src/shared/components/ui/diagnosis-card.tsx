import { ReviewPriorityBadge } from '@/shared/components/ui/review-priority-badge'
import { cn } from '@/shared/lib/utils'

import type { DecisionStatusTone, ReviewPriority } from '@/shared/lib/utils'
import type { ReactNode } from 'react'

interface DiagnosisCardProps {
  icon: ReactNode
  headline: string
  taxonomyLabel: string
  reviewPriority: ReviewPriority
  summary: string
  basisSummary: string
  actionLead: string
  actionList?: ReactNode
  driversLead: string
  driversList?: ReactNode
  tone?: DecisionStatusTone
  className?: string
}

const toneStyles: Record<
  DecisionStatusTone,
  {
    container: string
    icon: string
    headline: string
    taxonomy: string
  }
> = {
  default: {
    container: 'border-border bg-card/60',
    icon: 'text-muted-foreground',
    headline: 'text-foreground',
    taxonomy: 'text-muted-foreground'
  },
  info: {
    container: 'border-primary/20 bg-primary/5',
    icon: 'text-primary',
    headline: 'text-primary',
    taxonomy: 'text-primary/80'
  },
  success: {
    container: 'border-status-success-border bg-status-success-surface',
    icon: 'text-status-success-foreground',
    headline: 'text-status-success-foreground',
    taxonomy: 'text-status-success-foreground/80'
  },
  warning: {
    container: 'border-status-warning-border bg-status-warning-surface',
    icon: 'text-status-warning-foreground',
    headline: 'text-status-warning-foreground',
    taxonomy: 'text-status-warning-foreground/80'
  },
  danger: {
    container: 'border-status-critical-border bg-status-critical-surface',
    icon: 'text-status-critical-foreground',
    headline: 'text-status-critical-foreground',
    taxonomy: 'text-status-critical-foreground/80'
  }
}

export function DiagnosisCard({
  icon,
  headline,
  taxonomyLabel,
  reviewPriority,
  summary,
  basisSummary,
  actionLead,
  actionList,
  driversLead,
  driversList,
  tone = 'default',
  className
}: DiagnosisCardProps) {
  const style = toneStyles[tone]

  return (
    <div
      className={cn(
        'rounded-lg border p-4 shadow-sm transition-colors',
        style.container,
        className
      )}
    >
      <div className='flex items-start justify-between gap-3'>
        <div className='min-w-0'>
          <div className='flex items-start gap-2'>
            <span className={cn('mt-0.5 shrink-0', style.icon)}>{icon}</span>
            <div className='min-w-0'>
              <h3
                className={cn(
                  'text-lg font-semibold leading-tight sm:text-xl',
                  style.headline
                )}
              >
                {headline}
              </h3>
              <p className={cn('mt-1 text-xs font-medium', style.taxonomy)}>
                {taxonomyLabel}
              </p>
            </div>
          </div>
        </div>
        <ReviewPriorityBadge priority={reviewPriority} />
      </div>

      <div className='mt-4 space-y-4'>
        <div className='space-y-1.5'>
          <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
            Diagnosis
          </p>
          <p className='text-sm leading-relaxed text-foreground'>{summary}</p>
          <p className='text-xs leading-relaxed text-muted-foreground'>
            {basisSummary}
          </p>
        </div>

        <div className='space-y-1.5'>
          <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
            What to do next
          </p>
          <p className='text-sm leading-relaxed text-foreground'>
            {actionLead}
          </p>
          {actionList ? (
            <div className='text-xs text-muted-foreground'>{actionList}</div>
          ) : null}
        </div>

        <div className='space-y-1.5'>
          <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
            Top drivers
          </p>
          <p className='text-sm leading-relaxed text-foreground'>
            {driversLead}
          </p>
          {driversList ? (
            <div className='text-xs text-muted-foreground'>{driversList}</div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
