import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/shared/components/ui/card'
import { ArrowDown, ArrowRight } from '@/shared/components/ui/icons'
import { cn } from '@/shared/lib/utils'

import type { MetricsGuideDecisionState } from '../content/metricsGuideContent'

interface DecisionMatrixGuideProps {
  states: MetricsGuideDecisionState[]
}

const toneClasses = {
  danger:
    'border-status-critical-border bg-status-critical-surface text-status-critical-foreground',
  warning:
    'border-status-warning-border bg-status-warning-surface text-status-warning-foreground',
  info: 'border-guide-core-border bg-guide-core-surface text-guide-core-foreground',
  success:
    'border-status-success-border bg-status-success-surface text-status-success-foreground'
} as const

export function DecisionMatrixGuide({ states }: DecisionMatrixGuideProps) {
  return (
    <Card className='border-border/70 bg-card/50'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-base'>Decision guide</CardTitle>
        <p className='text-sm text-muted-foreground'>
          This matrix maps two dimensions — change activity and structural
          impact — into four review-oriented states.
        </p>
      </CardHeader>
      <CardContent className='space-y-2'>
        {/* 2x2 matrix with integrated axis labels */}
        <div className='grid grid-cols-[auto_1fr_1fr] grid-rows-[auto_1fr_1fr] gap-0'>
          {/* Top-left corner: empty */}
          <div className='col-start-1 row-start-1' />

          {/* Column headers (change activity axis) */}
          <div className='col-start-2 row-start-1 flex items-end justify-center pb-2'>
            <span className='text-2xs font-medium uppercase tracking-label text-muted-foreground'>
              Higher change activity
            </span>
          </div>
          <div className='col-start-3 row-start-1 flex items-end justify-center pb-2'>
            <span className='text-2xs font-medium uppercase tracking-label text-muted-foreground'>
              Lower change activity
            </span>
          </div>

          {/* Row header: Broad impact */}
          <div className='col-start-1 row-start-2 flex items-center pr-3'>
            <span className='rotate-180 text-2xs font-medium uppercase tracking-label text-muted-foreground [writing-mode:vertical-lr]'>
              Broad impact
            </span>
          </div>

          {/* Top-left quadrant: Critical Hotspot */}
          <div className='col-start-2 row-start-2 p-1'>
            <div
              className={cn(
                'h-full rounded-lg border p-3',
                toneClasses[states[0].tone]
              )}
            >
              <p className='text-sm font-semibold text-foreground'>
                {states[0].title}
              </p>
              <p className='mt-1 text-sm text-foreground/80'>
                {states[0].summary}
              </p>
            </div>
          </div>

          {/* Top-right quadrant: Shared Foundation */}
          <div className='col-start-3 row-start-2 p-1'>
            <div
              className={cn(
                'h-full rounded-lg border p-3',
                toneClasses[states[2].tone]
              )}
            >
              <p className='text-sm font-semibold text-foreground'>
                {states[2].title}
              </p>
              <p className='mt-1 text-sm text-foreground/80'>
                {states[2].summary}
              </p>
            </div>
          </div>

          {/* Row header: Lower impact */}
          <div className='col-start-1 row-start-3 flex items-center pr-3'>
            <span className='rotate-180 text-2xs font-medium uppercase tracking-label text-muted-foreground [writing-mode:vertical-lr]'>
              Lower impact
            </span>
          </div>

          {/* Bottom-left quadrant: Active but Local */}
          <div className='col-start-2 row-start-3 p-1'>
            <div
              className={cn(
                'h-full rounded-lg border p-3',
                toneClasses[states[1].tone]
              )}
            >
              <p className='text-sm font-semibold text-foreground'>
                {states[1].title}
              </p>
              <p className='mt-1 text-sm text-foreground/80'>
                {states[1].summary}
              </p>
            </div>
          </div>

          {/* Bottom-right quadrant: Likely Local Change */}
          <div className='col-start-3 row-start-3 p-1'>
            <div
              className={cn(
                'h-full rounded-lg border p-3',
                toneClasses[states[3].tone]
              )}
            >
              <p className='text-sm font-semibold text-foreground'>
                {states[3].title}
              </p>
              <p className='mt-1 text-sm text-foreground/80'>
                {states[3].summary}
              </p>
            </div>
          </div>
        </div>

        {/* Axis direction hints */}
        <div className='flex items-center justify-between px-8 pt-1'>
          <div className='flex items-center gap-1 text-2xs text-muted-foreground/70'>
            <ArrowRight className='h-3 w-3' />
            <span>Change activity decreases</span>
          </div>
          <div className='flex items-center gap-1 text-2xs text-muted-foreground/70'>
            <ArrowDown className='h-3 w-3' />
            <span>Impact decreases</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
