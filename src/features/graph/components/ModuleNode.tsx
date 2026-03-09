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
  const isFocusContext = data.isFocusContext
  const relationToFocus = data.relationToFocus ?? 'overview'
  const showCompactRelationCard = isFocusContext && !isSelected

  const relationLabel = {
    overview: 'Module',
    focus: 'Focus',
    incoming: 'Dependent',
    outgoing: 'Dependency',
    bidirectional: 'Cycle'
  }[relationToFocus]

  const relationDescription = {
    overview: 'Module overview',
    focus: 'Selected module',
    incoming: 'Depends on the focus module',
    outgoing: 'Used by the focus module',
    bidirectional: 'Connected to the focus module in both directions'
  }[relationToFocus]

  return (
    <div
      className={cn(
        'relative rounded-xl border px-5 py-4 transition-all duration-200',
        showCompactRelationCard
          ? 'min-w-[220px] max-w-[260px]'
          : 'min-w-[240px] max-w-[300px]',
        'border-[hsl(var(--border))] bg-[hsl(var(--card))]',
        isSelected &&
          'border-[hsl(var(--primary))] shadow-lg shadow-[hsl(var(--primary))]/20 ring-2 ring-[hsl(var(--primary))]',
        isHighlighted &&
          !isSelected &&
          'shadow-md shadow-[hsl(var(--destructive))]/10 ring-2 ring-[hsl(var(--destructive))]/60',
        'hover:border-[hsl(var(--primary))] hover:shadow-md',
        'cursor-pointer'
      )}
    >
      {/* Focus indicator badge */}
      {data.isSelected && (
        <div className='absolute -right-2 -top-2 flex items-center gap-1 rounded-full bg-[hsl(var(--primary))] px-2 py-0.5 text-[10px] font-semibold text-[hsl(var(--primary-foreground))] shadow-sm'>
          <Target size={10} weight='bold' />
          Focus
        </div>
      )}
      {/* Header */}
      <div className='mb-3 flex items-center gap-3'>
        <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10'>
          <Folder size={20} className='text-[hsl(var(--primary))]' />
        </div>
        <div className='min-w-0 flex-1'>
          <div className='truncate text-sm font-semibold text-[hsl(var(--foreground))]'>
            {data.folderPath.split('/').pop()}
          </div>
          <div className='truncate text-xs text-[hsl(var(--muted-foreground))]'>
            {data.folderPath}
          </div>
        </div>
        <div className='flex h-6 w-6 items-center justify-center rounded-full bg-[hsl(var(--muted))] text-xs font-medium text-[hsl(var(--foreground))]'>
          {data.fileCount}
        </div>
      </div>

      {showCompactRelationCard ? (
        <div className='rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/50 px-3 py-2'>
          <div className='flex items-center justify-between gap-2'>
            <span className='text-[11px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--primary))]'>
              {relationLabel}
            </span>
            <span className='text-[11px] text-[hsl(var(--muted-foreground))]'>
              {data.fileCount} files
            </span>
          </div>
          <p className='mt-1 text-xs leading-relaxed text-[hsl(var(--muted-foreground))]'>
            {relationDescription}
          </p>
        </div>
      ) : (
        <div className='mb-3 flex items-center justify-between text-xs'>
          <div className='flex items-center gap-2'>
            <span className='text-[hsl(var(--muted-foreground))]'>◄</span>
            <span className='font-medium text-[hsl(var(--foreground))]'>
              {data.totalIncoming}
            </span>
            <span className='text-[hsl(var(--muted-foreground))]'>in</span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-[hsl(var(--muted-foreground))]'>out</span>
            <span className='font-medium text-[hsl(var(--foreground))]'>
              {data.totalOutgoing}
            </span>
            <span className='text-[hsl(var(--muted-foreground))]'>►</span>
          </div>
        </div>
      )}

      {/* Risk Badge - Zone of Pain */}
      {data.isZoneOfPain && !showCompactRelationCard && (
        <div className='flex items-center gap-1.5 rounded-md border border-[hsl(var(--destructive))]/20 bg-[hsl(var(--destructive))]/10 px-2.5 py-1.5'>
          <Warning
            size={14}
            className='text-[hsl(var(--destructive))]'
            weight='fill'
          />
          <span className='text-xs font-medium text-[hsl(var(--destructive))]'>
            Zone of Pain
          </span>
          <span className='text-xs text-[hsl(var(--destructive))]/80'>
            ({Math.round(data.riskScore)})
          </span>
        </div>
      )}

      {/* Handles */}
      <Handle
        type='target'
        position={Position.Left}
        style={{ opacity: 0, width: 12, height: 12, pointerEvents: 'none' }}
      />
      <Handle
        type='source'
        position={Position.Right}
        style={{ opacity: 0, width: 12, height: 12, pointerEvents: 'none' }}
      />
    </div>
  )
}
