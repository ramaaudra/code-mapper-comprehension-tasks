import { cn } from '@/shared/lib/utils'

import type { ReactNode } from 'react'

interface MetricInsightCardProps {
  icon: ReactNode
  title: string
  value?: string
  valueSlot?: ReactNode
  description: string
  footer?: ReactNode
  tone?: 'default' | 'info' | 'success' | 'warning' | 'danger'
  titleSuffix?: ReactNode
  className?: string
}

const toneStyles: Record<
  NonNullable<MetricInsightCardProps['tone']>,
  {
    container: string
    title: string
    value: string
    icon: string
  }
> = {
  default: {
    container: 'border-border bg-card/60',
    title: 'text-foreground',
    value: 'text-foreground',
    icon: 'text-muted-foreground'
  },
  info: {
    container: 'border-border bg-card/60',
    title: 'text-foreground',
    value: 'text-foreground',
    icon: 'text-muted-foreground'
  },
  success: {
    container: 'border-status-success-border bg-status-success-surface',
    title: 'text-status-success-foreground',
    value: 'text-status-success-foreground',
    icon: 'text-status-success-foreground'
  },
  warning: {
    container: 'border-border bg-card/60',
    title: 'text-foreground',
    value: 'text-foreground',
    icon: 'text-muted-foreground'
  },
  danger: {
    container: 'border-destructive/35 bg-destructive/5',
    title: 'text-destructive',
    value: 'text-destructive',
    icon: 'text-destructive'
  }
}

export function MetricInsightCard({
  icon,
  title,
  value,
  valueSlot,
  description,
  footer,
  tone = 'default',
  titleSuffix,
  className
}: MetricInsightCardProps) {
  const style = toneStyles[tone]

  return (
    <div
      className={cn(
        'rounded-lg border p-4 shadow-sm transition-colors',
        style.container,
        className
      )}
    >
      <div className='mb-2 flex items-start justify-between gap-3'>
        <div className='flex items-center gap-2'>
          <span className={cn('shrink-0', style.icon)}>{icon}</span>
          <div className='flex items-center gap-2'>
            <span className={cn('text-base font-semibold', style.title)}>
              {title}
            </span>
            {titleSuffix}
          </div>
        </div>
        {valueSlot ? (
          valueSlot
        ) : value ? (
          <span className={cn('font-data text-sm tabular-nums', style.value)}>
            {value}
          </span>
        ) : null}
      </div>

      <p className='text-xs leading-relaxed text-muted-foreground'>
        {description}
      </p>

      {footer ? (
        <div className='mt-2 text-xs text-muted-foreground/80'>{footer}</div>
      ) : null}
    </div>
  )
}
