import { cn } from '@/shared/lib/utils'

import type { ReactNode } from 'react'

interface MetricInsightCardProps {
  icon: ReactNode
  title: string
  value?: string
  description: string
  footer?: string
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
    container: 'border-sky-500/35 bg-sky-500/5',
    title: 'text-sky-500',
    value: 'text-sky-500',
    icon: 'text-sky-500'
  },
  success: {
    container: 'border-emerald-500/35 bg-emerald-500/5',
    title: 'text-emerald-500',
    value: 'text-emerald-500',
    icon: 'text-emerald-500'
  },
  warning: {
    container: 'border-amber-500/35 bg-amber-500/5',
    title: 'text-amber-500',
    value: 'text-amber-500',
    icon: 'text-amber-500'
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
            <span className={cn('text-sm font-semibold', style.title)}>
              {title}
            </span>
            {titleSuffix}
          </div>
        </div>
        {value ? (
          <span className={cn('font-mono text-xs', style.value)}>{value}</span>
        ) : null}
      </div>

      <p className='text-xs leading-relaxed text-muted-foreground'>
        {description}
      </p>

      {footer ? (
        <p className='mt-2 text-[11px] text-muted-foreground/80'>{footer}</p>
      ) : null}
    </div>
  )
}
