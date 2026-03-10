import { InfoTooltip } from '@/shared/components/ui/info-tooltip'
import { METRIC_LABELS } from '@/shared/lib/metric-copy'
import { cn, getHotspotStatusLabel } from '@/shared/lib/utils'

import type { HotspotStatus } from '@/shared/types/analysis'

interface HotspotStatusLabelProps {
  status: HotspotStatus
  className?: string
}

export function HotspotStatusLabel({
  status,
  className
}: HotspotStatusLabelProps) {
  return (
    <InfoTooltip
      title={METRIC_LABELS.hotspotStatus}
      side='top'
      align='start'
      className='max-w-sm'
      asChild
    >
      <span
        className={cn(
          'inline-flex cursor-help items-center underline decoration-dotted underline-offset-2',
          className
        )}
      >
        {getHotspotStatusLabel(status)}
      </span>
    </InfoTooltip>
  )
}
