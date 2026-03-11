import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/shared/components/ui/tooltip'
import { METRIC_LABELS, METRIC_TOOLTIPS } from '@/shared/lib/metric-copy'
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
}

function getHotspotStatusDescription(status: HotspotStatus): string {
  switch (status) {
    case 'critical-hotspot':
      return 'This item sits in the highest repo-relative hotspot band and deserves the broadest review attention.'
    case 'high-review-needed':
      return 'This item is above the normal hotspot band, so changes here deserve closer review.'
    case 'active':
      return 'This item shows recent change activity, but it is not in the strongest hotspot band.'
    default:
      return 'This item sits in a lower hotspot band relative to the rest of the repository.'
  }
}

export function HotspotStatusLabel({
  status,
  className,
  variant = 'default'
}: HotspotStatusLabelProps) {
  const label =
    variant === 'graph'
      ? getGraphHotspotStatusLabel(status)
      : getHotspotStatusLabel(status)

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            'inline-flex cursor-help items-center underline decoration-dotted underline-offset-2',
            className
          )}
        >
          {label}
        </span>
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
