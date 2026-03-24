import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/shared/components/ui/card'
import { cn } from '@/shared/lib/utils'

import type { MetricsGuideDecisionState } from '../content/metricsGuideContent'

interface DecisionMatrixGuideProps {
  states: MetricsGuideDecisionState[]
}

const toneClasses = {
  danger: 'border-red-500/25 bg-red-500/5 text-red-600',
  warning: 'border-amber-500/25 bg-amber-500/5 text-amber-600',
  info: 'border-sky-500/25 bg-sky-500/5 text-sky-600',
  success: 'border-emerald-500/25 bg-emerald-500/5 text-emerald-600'
} as const

export function DecisionMatrixGuide({ states }: DecisionMatrixGuideProps) {
  return (
    <Card className='border-border/70 bg-card/50'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-base'>Decision guide</CardTitle>
        <p className='text-sm text-muted-foreground'>
          This matrix is a product interpretation layer. It compresses multiple
          structural and historical signals into four review-oriented states.
        </p>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid gap-3 md:grid-cols-[auto_1fr]'>
          <div className='hidden flex-col justify-between text-xs font-medium uppercase tracking-label text-muted-foreground md:flex'>
            <span>Broad impact</span>
            <span>Lower impact</span>
          </div>
          <div className='space-y-2'>
            <div className='grid gap-2 sm:grid-cols-2'>
              {states.slice(0, 2).map((state) => (
                <div
                  key={state.id}
                  className={cn(
                    'rounded-lg border p-3',
                    toneClasses[state.tone]
                  )}
                >
                  <p className='text-sm font-semibold text-foreground'>
                    {state.title}
                  </p>
                  <p className='mt-1 text-sm text-foreground/80'>
                    {state.summary}
                  </p>
                </div>
              ))}
            </div>
            <div className='grid gap-2 sm:grid-cols-2'>
              {states.slice(2).map((state) => (
                <div
                  key={state.id}
                  className={cn(
                    'rounded-lg border p-3',
                    toneClasses[state.tone]
                  )}
                >
                  <p className='text-sm font-semibold text-foreground'>
                    {state.title}
                  </p>
                  <p className='mt-1 text-sm text-foreground/80'>
                    {state.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className='flex items-center justify-between text-xs font-medium uppercase tracking-label text-muted-foreground'>
          <span>Higher change activity</span>
          <span>Lower change activity</span>
        </div>
      </CardContent>
    </Card>
  )
}
