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
      <div className='min-w-0 space-y-2'>
        <div>
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

        <button
          type='button'
          className='group inline-flex items-center gap-1 pl-6 text-sm font-medium text-status-critical-foreground transition-colors hover:text-status-critical-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-critical-border focus-visible:ring-offset-2 focus-visible:ring-offset-status-critical-surface'
          onClick={handleShowCycleTriage}
        >
          {summary.actionLabel}
          <ArrowRight className='h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5' />
        </button>
      </div>
    </div>
  )
}
