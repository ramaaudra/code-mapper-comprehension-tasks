import { WarningCircle } from '@/shared/components/ui/icons'
import { MetricValueCard } from '@/shared/components/ui/metric-value-card'

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
          label='Dependents (Ca)'
          tooltip='Afferent Coupling. Number of incoming dependencies targeting this file. Higher Ca usually means more files may be affected by a change here.'
        />
        <MetricValueCard
          value={ce}
          label='Dependencies (Ce)'
          tooltip='Efferent Coupling. Number of outgoing dependencies from this file to other files. Higher Ce means this file relies on more external code.'
        />
        <MetricValueCard
          value={instability.toFixed(2)}
          label='Instability (I)'
          tooltip='Structural metric calculated as I = Ce / (Ca + Ce). Values near 0 indicate a rigid or stable position; values near 1 indicate a flexible or unstable position.'
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
