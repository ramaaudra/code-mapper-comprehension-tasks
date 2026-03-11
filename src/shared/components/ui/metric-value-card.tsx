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
    container: 'border-sky-500/30 bg-sky-500/5',
    value: 'text-sky-600'
  },
  success: {
    container: 'border-emerald-500/30 bg-emerald-500/5',
    value: 'text-emerald-600'
  },
  warning: {
    container: 'border-amber-500/30 bg-amber-500/5',
    value: 'text-amber-600'
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
      <div className={cn('text-2xl font-semibold tabular-nums', style.value)}>
        {value}
      </div>
      <div className='mt-1 flex items-center gap-1 text-xs text-muted-foreground'>
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
      {helper ? <div className='mt-2'>{helper}</div> : null}
    </div>
  )
}
