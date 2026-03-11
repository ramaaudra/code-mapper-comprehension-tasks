import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/shared/components/ui/collapsible'
import { CaretRight } from '@/shared/components/ui/icons'
import { cn } from '@/shared/lib/utils'

import type { ReactNode } from 'react'

interface DetailPanelDisclosureProps {
  title: string
  summary?: string
  children: ReactNode
  defaultOpen?: boolean
  className?: string
  contentClassName?: string
}

export function DetailPanelDisclosure({
  title,
  summary,
  children,
  defaultOpen = false,
  className,
  contentClassName
}: DetailPanelDisclosureProps) {
  return (
    <Collapsible
      defaultOpen={defaultOpen}
      className={cn(
        'rounded-lg border border-border/70 bg-card/40 shadow-sm',
        className
      )}
    >
      <CollapsibleTrigger asChild>
        <button
          type='button'
          className='group flex w-full items-start justify-between gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-muted/35'
        >
          <div className='min-w-0'>
            <div className='text-sm font-semibold text-foreground'>{title}</div>
            {summary ? (
              <p className='mt-1 text-xs leading-relaxed text-muted-foreground'>
                {summary}
              </p>
            ) : null}
          </div>
          <CaretRight className='mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-90' />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className='border-t border-border/60 px-3 pb-3 pt-3'>
        <div className={cn('space-y-4', contentClassName)}>{children}</div>
      </CollapsibleContent>
    </Collapsible>
  )
}
