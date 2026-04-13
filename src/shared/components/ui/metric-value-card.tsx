import { InfoTooltip } from '@/shared/components/ui/info-tooltip'
import { cn } from '@/shared/lib/utils'

import type { ReactNode } from 'react'

interface MetricValueCardProps {
  value: string | number
  label: string
  tooltip?: string
  helper?: ReactNode
  tone?: 'default' | 'info' | 'success' | 'warning' | 'danger'
  className?: string
}

const toneStyles: Record<
  NonNullable<MetricValueCardProps['tone']>,
  {
    container: string
    value: string
    label: string
    helper: string
  }
> = {
  default: {
    container: 'border-border bg-muted/35',
    value: 'text-foreground',
    label: 'text-foreground/80',
    helper: 'text-muted-foreground'
  },
  info: {
    container: 'border-border bg-muted/35',
    value: 'text-foreground',
    label: 'text-foreground/80',
    helper: 'text-muted-foreground'
  },
  success: {
    container: 'border-status-success-border bg-status-success-surface',
    value: 'text-status-success-foreground',
    label: 'text-status-success-foreground/85',
    helper: 'text-status-success-foreground/80'
  },
  warning: {
    container: 'border-border bg-muted/35',
    value: 'text-foreground',
    label: 'text-foreground/80',
    helper: 'text-muted-foreground'
  },
  danger: {
    container: 'border-status-critical-border bg-status-critical-surface',
    value: 'text-status-critical-foreground',
    label: 'text-status-critical-foreground/85',
    helper: 'text-status-critical-foreground/80'
  }
}

export function MetricValueCard({
  value,
  label,
  tooltip,
  helper,
  tone = 'default',
  className
}: MetricValueCardProps) {
  const style = toneStyles[tone]

  return (
    <div
      className={cn(
        'rounded-lg border p-3 shadow-sm transition-colors',
        style.container,
        className
      )}
    >
      <div
        className={cn(
          'font-data text-lg font-semibold tabular-nums leading-tight tracking-tight sm:text-xl',
          style.value
        )}
      >
        {value}
      </div>
      <div
        className={cn(
          'mt-1.5 flex items-center gap-1 text-sm font-medium',
          style.label
        )}
      >
        <span>{label}</span>
        {tooltip ? (
          <InfoTooltip
            title={label}
            side='top'
            align='start'
            className='max-w-sm'
            iconClassName='text-muted-foreground/70 hover:text-foreground'
          >
            <p className='text-xs text-popover-foreground'>{tooltip}</p>
          </InfoTooltip>
        ) : null}
      </div>
      {helper ? (
        <div className={cn('mt-2 text-xs', style.helper)}>{helper}</div>
      ) : null}
    </div>
  )
}
