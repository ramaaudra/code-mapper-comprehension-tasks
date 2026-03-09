import { InfoTooltip } from '@/shared/components/ui/info-tooltip'
import { cn } from '@/shared/lib/utils'

import type { ReactNode } from 'react'

interface MetricValueCardProps {
  value: string | number
  label: string
  tooltip?: string
  helper?: ReactNode
  className?: string
}

export function MetricValueCard({
  value,
  label,
  tooltip,
  helper,
  className
}: MetricValueCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-muted/35 p-3 shadow-sm',
        className
      )}
    >
      <div className='text-2xl font-semibold tabular-nums text-foreground'>
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
