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
    description: string
    footer: string
  }
> = {
  default: {
    container: 'border-border bg-card/60',
    title: 'text-foreground',
    value: 'text-foreground',
    icon: 'text-muted-foreground',
    description: 'text-muted-foreground',
    footer: 'text-muted-foreground/80'
  },
  info: {
    container: 'border-border bg-card/60',
    title: 'text-foreground',
    value: 'text-foreground',
    icon: 'text-muted-foreground',
    description: 'text-muted-foreground',
    footer: 'text-muted-foreground/80'
  },
  success: {
    container: 'border-status-success-border bg-status-success-surface',
    title: 'text-status-success-foreground',
    value: 'text-status-success-foreground',
    icon: 'text-status-success-foreground',
    description: 'text-status-success-foreground/85',
    footer: 'text-status-success-foreground/80'
  },
  warning: {
    container: 'border-border bg-card/60',
    title: 'text-foreground',
    value: 'text-foreground',
    icon: 'text-muted-foreground',
    description: 'text-muted-foreground',
    footer: 'text-muted-foreground/80'
  },
  danger: {
    container: 'border-status-critical-border bg-status-critical-surface',
    title: 'text-status-critical-foreground',
    value: 'text-status-critical-foreground',
    icon: 'text-status-critical-foreground',
    description: 'text-status-critical-foreground/85',
    footer: 'text-status-critical-foreground/80'
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

      <p className={cn('text-xs leading-relaxed', style.description)}>
        {description}
      </p>

      {footer ? (
        <div className={cn('mt-2 text-xs', style.footer)}>{footer}</div>
      ) : null}
    </div>
  )
}
