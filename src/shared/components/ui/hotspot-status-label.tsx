import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/shared/components/ui/tooltip'
import { METRIC_LABELS, METRIC_TOOLTIPS } from '@/shared/lib/metric-copy'
import { getHotspotStatusDescription } from '@/shared/lib/metric-thresholds'
import {
  cn,
  getGraphHotspotStatusLabel,
  getHotspotStatusLabel
} from '@/shared/lib/utils'

import type { HotspotStatus } from '@/shared/types/analysis'

interface HotspotStatusLabelProps {
  status: HotspotStatus
  className?: string
  variant?: 'default' | 'graph'
  labelOverride?: string
}

export function HotspotStatusLabel({
  status,
  className,
  variant = 'default',
  labelOverride
}: HotspotStatusLabelProps) {
  const label =
    labelOverride ??
    (variant === 'graph'
      ? getGraphHotspotStatusLabel(status)
      : getHotspotStatusLabel(status))

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type='button'
          aria-label={`Explain hotspot priority status: ${label}`}
          className={cn(
            'inline-flex cursor-help items-center rounded-sm bg-transparent underline decoration-dotted underline-offset-2 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            className
          )}
        >
          {label}
        </button>
      </TooltipTrigger>
      <TooltipContent side='top' align='start' className='max-w-xs'>
        <div className='space-y-2'>
          <p className='font-semibold text-popover-foreground'>
            {METRIC_LABELS.hotspotStatus}
          </p>
          <p className='text-xs leading-relaxed text-popover-foreground'>
            {getHotspotStatusDescription(status)}
          </p>
          <p className='border-t border-border pt-2 text-xs leading-relaxed text-popover-foreground/80'>
            {METRIC_TOOLTIPS.hotspotStatus}
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
