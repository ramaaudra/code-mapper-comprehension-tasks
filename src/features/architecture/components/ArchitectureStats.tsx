import type { ReactNode } from 'react'

import { WarningCircle } from '@/shared/components/ui/icons'
import { SimpleTooltip } from '@/shared/components/ui/simple-tooltip'

import { InstabilityBadge } from './InstabilityBadge'

interface StackedMetricBoxProps {
  primaryLabel: string
  symbol: string
  value: number | string
  tooltip: string
  isBadge?: boolean
  children?: ReactNode
}

function StackedMetricBox({
  primaryLabel,
  symbol,
  value,
  tooltip,
  isBadge = false,
  children
}: StackedMetricBoxProps) {
  return (
    <SimpleTooltip content={tooltip} side="top">
      <div className="flex flex-col items-center p-3 rounded bg-muted/30 cursor-help hover:bg-muted/50 transition-colors">
        <span className="text-[10px] text-foreground font-medium leading-tight">
          {primaryLabel}
        </span>
        <span className="text-[10px] text-muted-foreground leading-tight">
          ({symbol})
        </span>
        {isBadge && children ? (
          <div className="mt-1">{children}</div>
        ) : (
          <span className="text-2xl font-mono font-semibold mt-1">{value}</span>
        )}
      </div>
    </SimpleTooltip>
  )
}

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
    <div className="space-y-3">
      {/* Metrics grid */}
      <div className="grid grid-cols-3 gap-2">
        <StackedMetricBox
          primaryLabel="Dependents"
          symbol="Ca"
          value={ca}
          tooltip="How many files depend on this file"
        />
        <StackedMetricBox
          primaryLabel="Dependencies"
          symbol="Ce"
          value={ce}
          tooltip="How many files this file depends on"
        />
        <StackedMetricBox
          primaryLabel="Instability"
          symbol="I"
          value={instability.toFixed(2)}
          tooltip="Ratio of vulnerability to change. 1.0 = Highly unstable"
          isBadge={true}
        >
          <InstabilityBadge value={instability} />
        </StackedMetricBox>
      </div>

      {/* Cycle warning - conditional */}
      {hasCycle && (
        <div className="flex items-center gap-2 p-2 rounded bg-red-500/10 border border-red-500/20">
          <WarningCircle size={14} className="text-red-400" weight="fill" />
          <span className="text-xs text-red-400">
            Involved in circular dependency
          </span>
        </div>
      )}
    </div>
  )
}
