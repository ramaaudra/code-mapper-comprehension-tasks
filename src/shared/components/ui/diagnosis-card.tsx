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
    container: 'border-sky-500/35 bg-sky-500/5',
    icon: 'text-sky-500',
    headline: 'text-sky-600',
    taxonomy: 'text-sky-600/80'
  },
  success: {
    container: 'border-emerald-500/35 bg-emerald-500/5',
    icon: 'text-emerald-500',
    headline: 'text-emerald-600',
    taxonomy: 'text-emerald-600/80'
  },
  warning: {
    container: 'border-amber-500/35 bg-amber-500/5',
    icon: 'text-amber-500',
    headline: 'text-amber-600',
    taxonomy: 'text-amber-600/80'
  },
  danger: {
    container: 'border-destructive/35 bg-destructive/5',
    icon: 'text-destructive',
    headline: 'text-destructive',
    taxonomy: 'text-destructive/80'
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
          <p className='text-[11px] font-semibold uppercase tracking-wide text-muted-foreground'>
            Diagnosis
          </p>
          <p className='text-sm leading-relaxed text-foreground'>{summary}</p>
          <p className='text-xs leading-relaxed text-muted-foreground'>
            {basisSummary}
          </p>
        </div>

        <div className='space-y-1.5'>
          <p className='text-[11px] font-semibold uppercase tracking-wide text-muted-foreground'>
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
          <p className='text-[11px] font-semibold uppercase tracking-wide text-muted-foreground'>
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
