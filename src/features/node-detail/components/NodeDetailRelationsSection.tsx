import { DetailPanelState } from '@/shared/components/ui/detail-panel-state'
import { Map as MapIcon } from '@/shared/components/ui/icons'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { getFileIcon, truncateMiddle } from '@/shared/lib/utils'

import { nodeDetailCopy } from '../content/nodeDetailCopy'

import type { DependencyReference } from '@/shared/types/analysis'

interface NodeDetailRelationsSectionProps {
  items: DependencyReference[]
  type: 'imports' | 'importers'
  showTracePathAction: boolean
  isTracing: boolean
  onTracePath: (targetFile: string) => void
}

export function NodeDetailRelationsSection({
  items,
  type,
  showTracePathAction,
  isTracing,
  onTracePath
}: NodeDetailRelationsSectionProps) {
  if (items.length === 0) {
    return (
      <div className='p-4'>
        <DetailPanelState
          title={nodeDetailCopy.dependencyList.emptyTitle(type)}
          description={nodeDetailCopy.dependencyList.emptyDescription(type)}
          compact={true}
        />
      </div>
    )
  }

  return (
    <ScrollArea className='h-[calc(100vh-200px)] w-full lg:h-[calc(100vh-220px)]'>
      <div className='space-y-1 p-4'>
        {items.map((item) => {
          const ItemFileIcon = getFileIcon(item.basename)

          return (
            <div
              key={item.id}
              className='group flex items-center justify-between rounded-md p-2 transition-colors hover:bg-muted/50'
            >
              <div className='min-w-0 flex-1 pr-2'>
                <div className='flex items-center gap-2'>
                  <ItemFileIcon className='h-4 w-4 shrink-0 text-muted-foreground' />
                  <span className='truncate font-mono text-sm font-medium'>
                    {item.basename}
                  </span>
                  {item.strength > 1 && (
                    <span className='rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground'>
                      x{item.strength}
                    </span>
                  )}
                </div>
                <div
                  className='truncate pl-6 font-mono text-xs text-muted-foreground'
                  title={item.label}
                >
                  {truncateMiddle(item.label, 52)}
                </div>
              </div>

              {showTracePathAction ? (
                <button
                  type='button'
                  onClick={() => onTracePath(item.id)}
                  disabled={isTracing}
                  className='inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-background/60 px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:bg-background hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50'
                  title={nodeDetailCopy.dependencyList.tracePath}
                  aria-label={`Trace path to ${item.basename}`}
                >
                  <MapIcon className='h-3.5 w-3.5 shrink-0' />
                  <span>{nodeDetailCopy.dependencyList.tracePath}</span>
                </button>
              ) : null}
            </div>
          )
        })}
      </div>
    </ScrollArea>
  )
}
