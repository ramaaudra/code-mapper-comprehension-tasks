import { ArrowDown, ArrowRight } from '@/shared/components/ui/icons'
import { cn } from '@/shared/lib/utils'

import type { MetricsGuidePriorityQuadrant } from '../content/metricsGuideContent'

interface DecisionMatrixGuideProps {
  quadrants: Record<
    'criticalHotspot' | 'activeLocal' | 'sharedFoundation' | 'likelyLocal',
    MetricsGuidePriorityQuadrant
  >
}

const toneClasses = {
  criticalHotspot:
    'border-status-critical-border bg-status-critical-surface text-status-critical-foreground',
  activeLocal:
    'border-status-warning-border bg-status-warning-surface text-status-warning-foreground',
  sharedFoundation:
    'border-guide-core-border bg-guide-core-surface text-guide-core-foreground',
  likelyLocal:
    'border-status-success-border bg-status-success-surface text-status-success-foreground'
} as const

export function DecisionMatrixGuide({ quadrants }: DecisionMatrixGuideProps) {
  return (
    <div className='rounded-xl border border-border/40 bg-card/30 p-6'>
      <div className='mb-6 space-y-1.5'>
        <p className='text-foreground/90'>
          This matrix maps two dimensions — change activity and structural
          impact — into four review-oriented states.
        </p>
      </div>

      <div className='overflow-x-auto py-2'>
        {/* 2x2 matrix with integrated axis labels */}
        <div className='grid min-w-[400px] grid-cols-[auto_1fr_1fr] grid-rows-[auto_1fr_1fr] gap-0'>
          {/* Top-left corner: empty */}
          <div className='col-start-1 row-start-1' />

          {/* Column headers (change activity axis) */}
          <div className='col-start-2 row-start-1 flex items-end justify-center pb-2'>
            <span className='text-[10px] font-medium uppercase tracking-widest text-muted-foreground'>
              Higher change activity
            </span>
          </div>
          <div className='col-start-3 row-start-1 flex items-end justify-center pb-2'>
            <span className='text-[10px] font-medium uppercase tracking-widest text-muted-foreground'>
              Lower change activity
            </span>
          </div>

          {/* Row header: Broad impact */}
          <div className='col-start-1 row-start-2 flex items-center pr-3'>
            <span className='rotate-180 text-[10px] font-medium uppercase tracking-widest text-muted-foreground [writing-mode:vertical-lr]'>
              Broad impact
            </span>
          </div>

          {/* Top-left quadrant: Critical Hotspot */}
          <div className='col-start-2 row-start-2 p-1'>
            <div
              className={cn(
                'h-full rounded-lg border p-4 shadow-sm',
                toneClasses.criticalHotspot
              )}
            >
              <p className='text-sm font-semibold'>
                {quadrants.criticalHotspot.title}
              </p>
              <p className='mt-1 text-sm leading-snug opacity-90'>
                {quadrants.criticalHotspot.action}
              </p>
            </div>
          </div>

          {/* Top-right quadrant: Shared Foundation */}
          <div className='col-start-3 row-start-2 p-1'>
            <div
              className={cn(
                'h-full rounded-lg border p-4 shadow-sm',
                toneClasses.sharedFoundation
              )}
            >
              <p className='text-sm font-semibold'>
                {quadrants.sharedFoundation.title}
              </p>
              <p className='mt-1 text-sm leading-snug opacity-90'>
                {quadrants.sharedFoundation.action}
              </p>
            </div>
          </div>

          {/* Row header: Lower impact */}
          <div className='col-start-1 row-start-3 flex items-center pr-3'>
            <span className='rotate-180 text-[10px] font-medium uppercase tracking-widest text-muted-foreground [writing-mode:vertical-lr]'>
              Lower impact
            </span>
          </div>

          {/* Bottom-left quadrant: Active but Local */}
          <div className='col-start-2 row-start-3 p-1'>
            <div
              className={cn(
                'h-full rounded-lg border p-4 shadow-sm',
                toneClasses.activeLocal
              )}
            >
              <p className='text-sm font-semibold'>
                {quadrants.activeLocal.title}
              </p>
              <p className='mt-1 text-sm leading-snug opacity-90'>
                {quadrants.activeLocal.action}
              </p>
            </div>
          </div>

          {/* Bottom-right quadrant: Likely Local Change */}
          <div className='col-start-3 row-start-3 p-1'>
            <div
              className={cn(
                'h-full rounded-lg border p-4 shadow-sm',
                toneClasses.likelyLocal
              )}
            >
              <p className='text-sm font-semibold'>
                {quadrants.likelyLocal.title}
              </p>
              <p className='mt-1 text-sm leading-snug opacity-90'>
                {quadrants.likelyLocal.action}
              </p>
            </div>
          </div>
        </div>

        {/* Axis direction hints */}
        <div className='mt-4 flex max-w-xl items-center justify-between border-t border-border/40 px-8 pt-2 text-muted-foreground'>
          <div className='flex items-center gap-1 text-[11px]'>
            <ArrowRight className='h-3 w-3' />
            <span>Change activity decreases</span>
          </div>
          <div className='flex items-center gap-1 text-[11px]'>
            <ArrowDown className='h-3 w-3' />
            <span>Impact decreases</span>
          </div>
        </div>
      </div>
    </div>
  )
}
