import { Button } from '@/shared/components/ui/button'
import { AlertTriangle, ArrowRight } from '@/shared/components/ui/icons'

import type { NodeDetailCycleTriageSummary } from '../lib/cycle-triage-link'
import type { CycleTriageNavigationRequest } from '@/shared/types/explorer'
import type { ReactElement } from 'react'

interface NodeDetailCycleTriageCalloutProps {
  summary: NodeDetailCycleTriageSummary
  resolvedNodeId: string
  onShowCycleTriage: (request: CycleTriageNavigationRequest) => void
}

export function NodeDetailCycleTriageCallout({
  summary,
  resolvedNodeId,
  onShowCycleTriage
}: NodeDetailCycleTriageCalloutProps): ReactElement {
  function handleShowCycleTriage(): void {
    onShowCycleTriage({
      cycleId: summary.selectedCycleId,
      focusFilePath: resolvedNodeId
    })
  }

  return (
    <div className='rounded-lg border border-status-critical-border bg-status-critical-surface p-4 shadow-sm'>
      <div className='flex flex-col gap-3'>
        <div className='min-w-0 space-y-2'>
          <div className='flex items-start gap-2'>
            <AlertTriangle className='mt-0.5 h-4 w-4 shrink-0 text-status-critical-foreground' />
            <p className='text-sm font-semibold leading-relaxed text-status-critical-foreground'>
              {summary.title}
            </p>
          </div>

          <p className='pl-6 text-sm leading-relaxed text-status-critical-foreground/85'>
            {summary.description}
          </p>
        </div>

        <Button
          type='button'
          variant='outline'
          size='sm'
          className='w-full justify-between border-status-critical-border bg-background/85 text-status-critical-foreground shadow-sm hover:bg-background hover:text-status-critical-foreground focus-visible:ring-status-critical-border'
          onClick={handleShowCycleTriage}
        >
          {summary.actionLabel}
          <ArrowRight className='ml-2 h-3 w-3' />
        </Button>
      </div>
    </div>
  )
}
