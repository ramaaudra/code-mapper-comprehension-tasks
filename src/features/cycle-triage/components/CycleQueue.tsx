import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { cn } from '@/shared/lib/utils'

import { cycleTriageCopy } from '../content/cycleTriageCopy'
import { getCycleQueueSummary } from '../lib/cycle-triage-presentation'

import type { CycleTriageItem } from '../types/cycle-triage'

interface CycleQueueProps {
  items: CycleTriageItem[]
  selectedCycleId: string | null
  onSelect: (cycleId: string) => void
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
    <ScrollArea className='h-full min-h-0'>
      <div className='space-y-3 pb-4 pr-4'>
        {items.map((item) => {
          const isSelected = selectedCycleId === item.id
          const queueSummary = getCycleQueueSummary(item)

          return (
            <button
              key={item.id}
              type='button'
              onClick={() => onSelect(item.id)}
              className={cn(
                'w-full rounded-xl border px-3 py-2.5 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                isSelected
                  ? 'border-2 border-border bg-muted/25'
                  : 'border-transparent hover:bg-muted/15'
              )}
            >
              <div className='min-w-0 space-y-1.5'>
                <p className='whitespace-normal break-normal font-mono text-[0.95rem] font-semibold leading-6 text-foreground'>
                  {item.title}
                </p>
                <p
                  aria-label='Cycle evidence'
                  className='text-xs leading-5 text-muted-foreground'
                >
                  {queueSummary}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </ScrollArea>
  )
}
