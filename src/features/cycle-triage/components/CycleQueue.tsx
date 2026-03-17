import { Badge } from '@/shared/components/ui/badge'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { cn } from '@/shared/lib/utils'

import { cycleTriageCopy } from '../content/cycleTriageCopy'
import { getPriorityDriverChipLabel } from '../content/priorityDriverCopy'

import type { CycleTriageItem, FixPriority } from '../types/cycle-triage'

interface CycleQueueProps {
  items: CycleTriageItem[]
  selectedCycleId: string | null
  onSelect: (cycleId: string) => void
}

const priorityToneClass: Record<FixPriority, string> = {
  high: 'border-red-500/35 bg-red-500/10 text-red-600 dark:text-red-300',
  medium:
    'border-amber-500/35 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  low: 'border-slate-500/25 bg-slate-500/10 text-slate-700 dark:text-slate-300'
}

export function CycleQueue({
  items,
  selectedCycleId,
  onSelect
}: CycleQueueProps) {
  if (items.length === 0) {
    return (
      <div className='rounded-lg border border-dashed border-border/70 bg-muted/20 px-4 py-8 text-sm text-muted-foreground'>
        {cycleTriageCopy.queue.empty}
      </div>
    )
  }

  return (
    <ScrollArea className='h-[min(70vh,720px)]'>
      <div className='space-y-3 pr-4'>
        {items.map((item) => {
          const isSelected = selectedCycleId === item.id

          return (
            <button
              key={item.id}
              type='button'
              onClick={() => onSelect(item.id)}
              className={cn(
                'w-full rounded-xl border px-4 py-4 text-left transition-all',
                isSelected
                  ? 'bg-primary/8 border-primary/45 shadow-sm ring-1 ring-primary/25'
                  : 'border-border/70 bg-card hover:border-primary/35 hover:bg-primary/5'
              )}
            >
              <div className='flex items-start justify-between gap-3'>
                <div className='min-w-0'>
                  <p className='whitespace-normal break-normal text-sm font-semibold leading-5 text-foreground'>
                    {item.title}
                  </p>
                </div>
                <Badge
                  variant='outline'
                  className={cn(
                    'shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em]',
                    priorityToneClass[item.fixPriority]
                  )}
                >
                  {item.fixPriority}
                </Badge>
              </div>

              <div className='mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground'>
                <span className='rounded-full border border-border/60 bg-background/70 px-2 py-0.5'>
                  {item.uniqueFileCount} files
                </span>
                <span className='rounded-full border border-border/60 bg-background/70 px-2 py-0.5'>
                  {item.moduleKeys.length || 1} module area
                </span>
                {item.entryLikeFiles.length > 0 ? (
                  <span className='rounded-full border border-border/60 bg-background/70 px-2 py-0.5'>
                    Includes entry wiring
                  </span>
                ) : null}
                {item.priorityDrivers[0] ? (
                  <span className='rounded-full border border-border/60 bg-background/70 px-2 py-0.5'>
                    {getPriorityDriverChipLabel(item.priorityDrivers[0])}
                  </span>
                ) : null}
              </div>
            </button>
          )
        })}
      </div>
    </ScrollArea>
  )
}
