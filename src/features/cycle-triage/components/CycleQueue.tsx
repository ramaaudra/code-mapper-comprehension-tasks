import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { cn } from '@/shared/lib/utils'

import { cycleTriageCopy } from '../content/cycleTriageCopy'
import { getCycleEvidenceItems } from '../lib/cycle-triage-presentation'
import { CycleEvidenceList } from './CycleEvidenceList'

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
          const evidenceItems = getCycleEvidenceItems(item)

          return (
            <button
              key={item.id}
              type='button'
              onClick={() => onSelect(item.id)}
              className={cn(
                'w-full rounded-lg border border-transparent px-3 py-3 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                isSelected
                  ? 'bg-primary/8 border-primary/35 shadow-sm ring-1 ring-primary/20'
                  : 'bg-transparent hover:bg-muted/20'
              )}
            >
              <div className='flex items-start gap-3'>
                <span
                  aria-hidden='true'
                  className={cn(
                    'mt-1 h-2 w-2 shrink-0 rounded-full',
                    isSelected ? 'bg-primary' : 'bg-muted-foreground/40'
                  )}
                />
                <div className='min-w-0 space-y-2'>
                  <p className='whitespace-normal break-normal font-mono text-[0.975rem] font-semibold leading-6 text-foreground'>
                    {item.title}
                  </p>
                  <CycleEvidenceList
                    items={evidenceItems}
                    aria-label='Cycle evidence'
                    className='text-[11px] tabular-nums'
                  />
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </ScrollArea>
  )
}
