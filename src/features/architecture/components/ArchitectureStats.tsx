import { WarningCircle } from '@/shared/components/ui/icons'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/shared/components/ui/tooltip'

import { InstabilityBadge } from './InstabilityBadge'

interface MetricBoxProps {
  label: string
  value: number
  tooltip: string
}

function MetricBox({ label, value, tooltip }: MetricBoxProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex flex-col items-center p-2 rounded bg-muted/30 cursor-help hover:bg-muted/50 transition-colors">
            <span className="text-[10px] text-muted-foreground">{label}</span>
            <span className="text-sm font-mono font-medium">{value}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-xs">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
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
      {/* Section header */}
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Architecture
      </h3>

      {/* Metrics grid */}
      <div className="grid grid-cols-3 gap-2">
        <MetricBox
          label="Ca"
          value={ca}
          tooltip="Afferent Coupling: jumlah file lain yang import file ini"
        />
        <MetricBox
          label="Ce"
          value={ce}
          tooltip="Efferent Coupling: jumlah file yang diimport oleh file ini"
        />
        <div className="flex flex-col items-center p-2 rounded bg-muted/30">
          <span className="text-[10px] text-muted-foreground mb-1">
            Instability
          </span>
          <InstabilityBadge value={instability} />
        </div>
      </div>

      {/* Cycle warning - conditional */}
      {hasCycle && (
        <div className="flex items-center gap-2 p-2 rounded bg-red-500/10 border border-red-500/20">
          <WarningCircle size={14} className="text-red-400" weight="fill" />
          <span className="text-xs text-red-400">
            Terlibat dalam circular dependency
          </span>
        </div>
      )}
    </div>
  )
}
