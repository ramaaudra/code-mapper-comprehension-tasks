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
  }
> = {
  default: {
    container: 'border-border bg-muted/35',
    value: 'text-foreground'
  },
  info: {
    container: 'border-border bg-muted/35',
    value: 'text-foreground'
  },
  success: {
    container: 'border-status-success-border bg-status-success-surface',
    value: 'text-status-success-foreground'
  },
  warning: {
    container: 'border-border bg-muted/35',
    value: 'text-foreground'
  },
  danger: {
    container: 'border-destructive/30 bg-destructive/5',
    value: 'text-destructive'
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
      <div className='mt-1.5 flex items-center gap-1 text-sm font-medium text-foreground/80'>
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
        <div className='mt-2 text-xs text-muted-foreground'>{helper}</div>
      ) : null}
    </div>
  )
}
