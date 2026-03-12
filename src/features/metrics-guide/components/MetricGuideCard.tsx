import { Badge } from '@/shared/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/shared/components/ui/collapsible'
import { CaretDown } from '@/shared/components/ui/icons'

import { MetricGuideVisual } from './MetricGuideVisual'

import type { MetricsGuideMetric } from '../content/metricsGuideContent'

interface MetricGuideCardProps {
  metric: MetricsGuideMetric
}

export function MetricGuideCard({ metric }: MetricGuideCardProps) {
  return (
    <div className='rounded-xl border border-border/70 bg-card/50 p-4 shadow-sm'>
      <div className='flex flex-wrap items-center gap-2'>
        <h3 className='text-base font-semibold text-foreground'>
          {metric.title}
        </h3>
        <Badge variant='outline' className='text-[11px] text-muted-foreground'>
          {metric.family}
        </Badge>
      </div>

      <div className='mt-3 space-y-3'>
        <MetricGuideVisual metric={metric} />

        <div>
          <p className='text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground/85'>
            What it means
          </p>
          <p className='mt-1 text-sm text-foreground'>
            {metric.shortDefinition}
          </p>
        </div>

        <div>
          <p className='text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground/85'>
            Why it matters
          </p>
          <p className='mt-1 text-sm text-foreground'>{metric.whyItMatters}</p>
        </div>

        <Collapsible>
          <CollapsibleTrigger className='flex items-center gap-2 text-sm font-medium text-primary'>
            <span>See practical reading tips and caveats</span>
            <CaretDown className='h-4 w-4' />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className='mt-3 space-y-3 rounded-lg border border-border/60 bg-muted/20 px-3 py-3'>
              <div>
                <p className='text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground/85'>
                  How to read it
                </p>
                <p className='mt-1 text-sm text-foreground'>
                  {metric.practicalRead}
                </p>
              </div>

              <div>
                <p className='text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground/85'>
                  Important caveat
                </p>
                <p className='mt-1 text-sm text-muted-foreground'>
                  {metric.caveat}
                </p>
              </div>

              <div>
                <p className='text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground/85'>
                  Where you see it
                </p>
                <div className='mt-2 flex flex-wrap gap-2'>
                  {metric.screens.map((screen) => (
                    <Badge
                      key={screen}
                      variant='secondary'
                      className='text-[11px]'
                    >
                      {screen}
                    </Badge>
                  ))}
                </div>
              </div>

              {metric.formula ? (
                <div>
                  <p className='text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground/85'>
                    Formula
                  </p>
                  <p className='mt-1 text-sm font-medium text-foreground'>
                    {metric.formula}
                  </p>
                  <p className='mt-2 text-sm text-muted-foreground'>
                    This formula is shown for transparency. Use the
                    decision-facing copy in the app first, then use formulas
                    here when you need a deeper explanation.
                  </p>
                </div>
              ) : null}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  )
}
