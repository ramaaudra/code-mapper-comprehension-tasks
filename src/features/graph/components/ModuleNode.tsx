import { Folder, Target, Warning } from '@phosphor-icons/react'
import { Handle, type NodeProps, Position } from '@xyflow/react'

import { cn } from '@/lib/utils'

import type { ModuleNodeData } from '../utils/moduleAggregation'

interface ModuleNodeComponentProps extends NodeProps {
  data: ModuleNodeData
}

export function ModuleNodeComponent(props: ModuleNodeComponentProps) {
  const data = props.data
  const isSelected = data.isSelected
  const isHighlighted = data.isHighlighted

  return (
    <div
      className={cn(
        'relative rounded-xl border px-5 py-4 transition-all duration-200',
        'min-w-[240px] max-w-[300px]',
        'bg-[hsl(var(--card))] border-[hsl(var(--border))]',
        isSelected &&
          'ring-2 ring-[hsl(var(--primary))] shadow-lg shadow-[hsl(var(--primary))]/20 border-[hsl(var(--primary))]',
        isHighlighted &&
          !isSelected &&
          'ring-2 ring-[hsl(var(--destructive))]/60 shadow-md shadow-[hsl(var(--destructive))]/10',
        'hover:border-[hsl(var(--primary))] hover:shadow-md',
        'cursor-pointer'
      )}
    >
      {/* Focus indicator badge */}
      {data.isSelected && (
        <div className="absolute -top-2 -right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-[10px] font-semibold shadow-sm">
          <Target size={10} weight="bold" />
          Focus
        </div>
      )}
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10">
          <Folder size={20} className="text-[hsl(var(--primary))]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-[hsl(var(--foreground))] truncate">
            {data.folderPath.split('/').pop()}
          </div>
          <div className="text-xs text-[hsl(var(--muted-foreground))] truncate">
            {data.folderPath}
          </div>
        </div>
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[hsl(var(--muted))] text-xs font-medium text-[hsl(var(--foreground))]">
          {data.fileCount}
        </div>
      </div>

      {/* Metrics */}
      <div className="flex items-center justify-between text-xs mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[hsl(var(--muted-foreground))]">◄</span>
          <span className="font-medium text-[hsl(var(--foreground))]">
            {data.totalIncoming}
          </span>
          <span className="text-[hsl(var(--muted-foreground))]">in</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[hsl(var(--muted-foreground))]">out</span>
          <span className="font-medium text-[hsl(var(--foreground))]">
            {data.totalOutgoing}
          </span>
          <span className="text-[hsl(var(--muted-foreground))]">►</span>
        </div>
      </div>

      {/* Risk Badge - Zone of Pain */}
      {data.isZoneOfPain && (
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[hsl(var(--destructive))]/10 border border-[hsl(var(--destructive))]/20">
          <Warning
            size={14}
            className="text-[hsl(var(--destructive))]"
            weight="fill"
          />
          <span className="text-xs font-medium text-[hsl(var(--destructive))]">
            Zone of Pain
          </span>
          <span className="text-xs text-[hsl(var(--destructive))]/80">
            ({Math.round(data.riskScore)})
          </span>
        </div>
      )}

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-[hsl(var(--primary))]"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-[hsl(var(--primary))]"
      />
    </div>
  )
}
