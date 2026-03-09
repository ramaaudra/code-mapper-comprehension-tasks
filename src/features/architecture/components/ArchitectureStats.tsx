import { WarningCircle } from '@/shared/components/ui/icons'
import { MetricValueCard } from '@/shared/components/ui/metric-value-card'
import { METRIC_LABELS, METRIC_TOOLTIPS } from '@/shared/lib/metric-copy'

import { InstabilityBadge } from './InstabilityBadge'

interface ArchitectureStatsProps {
  ca: number
  ce: number
  instability: number
  hasCycle: boolean
}

export function ArchitectureStats({
  ca,
  ce,
  instability,
  hasCycle
}: ArchitectureStatsProps) {
  return (
    <div className='space-y-3'>
      <div className='grid grid-cols-3 gap-3'>
        <MetricValueCard
          value={ca}
          label={METRIC_LABELS.dependentsCa}
          tooltip={METRIC_TOOLTIPS.dependentsCa}
        />
        <MetricValueCard
          value={ce}
          label={METRIC_LABELS.dependenciesCe}
          tooltip={METRIC_TOOLTIPS.dependenciesCe}
        />
        <MetricValueCard
          value={instability.toFixed(2)}
          label={METRIC_LABELS.instability}
          tooltip={METRIC_TOOLTIPS.instability}
          helper={<InstabilityBadge value={instability} />}
        />
      </div>

      {hasCycle && (
        <div className='flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3'>
          <WarningCircle size={14} className='text-red-400' weight='fill' />
          <span className='text-xs text-red-400'>
            Involved in circular dependency
          </span>
        </div>
      )}
    </div>
  )
}
