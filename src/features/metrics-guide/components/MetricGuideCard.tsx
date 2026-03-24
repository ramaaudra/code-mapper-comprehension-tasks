import { Badge } from '@/shared/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/shared/components/ui/collapsible'
import { CaretDown, Lightbulb, AlertCircle } from '@/shared/components/ui/icons'

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
        <Badge variant='outline' className='text-xs text-muted-foreground'>
          {metric.family}
        </Badge>
      </div>

      <div className='mt-3 space-y-4'>
        <MetricGuideVisual metric={metric} />

        <div>
          <p className='text-sm text-foreground'>{metric.shortDefinition}</p>
        </div>

        <div className='rounded-lg border border-primary/20 bg-primary/5 p-3'>
          <div className='flex items-start gap-2'>
            <AlertCircle className='mt-0.5 h-4 w-4 shrink-0 text-primary' />
            <div className='space-y-1'>
              <p className='text-sm font-medium text-foreground'>
                When to care
              </p>
              <p className='text-sm text-foreground/85'>{metric.whenToCare}</p>
            </div>
          </div>
        </div>

        <div className='rounded-lg border border-border/60 bg-muted/30 p-3'>
          <div className='flex items-start gap-2'>
            <Lightbulb className='mt-0.5 h-4 w-4 shrink-0 text-amber-500' />
            <div className='space-y-1'>
              <p className='text-sm font-medium text-foreground'>
                Quick action
              </p>
              <p className='text-sm text-foreground/85'>{metric.quickAction}</p>
            </div>
          </div>
        </div>

        <Collapsible>
          <CollapsibleTrigger className='flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground'>
            <span>Show details</span>
            <CaretDown className='h-4 w-4' />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className='mt-3 space-y-3 rounded-lg border border-border/60 bg-muted/20 px-3 py-3'>
              <div>
                <p className='text-xs font-medium uppercase tracking-label text-muted-foreground/85'>
                  Why it matters
                </p>
                <p className='mt-1 text-sm text-foreground'>
                  {metric.whyItMatters}
                </p>
              </div>

              <div>
                <p className='text-xs font-medium uppercase tracking-label text-muted-foreground/85'>
                  How to read it
                </p>
                <p className='mt-1 text-sm text-foreground'>
                  {metric.practicalRead}
                </p>
              </div>

              <div>
                <p className='text-xs font-medium uppercase tracking-label text-muted-foreground/85'>
                  Important caveat
                </p>
                <p className='mt-1 text-sm text-muted-foreground'>
                  {metric.caveat}
                </p>
              </div>

              <div>
                <p className='text-xs font-medium uppercase tracking-label text-muted-foreground/85'>
                  Where you see it
                </p>
                <div className='mt-2 flex flex-wrap gap-2'>
                  {metric.screens.map((screen) => (
                    <Badge key={screen} variant='secondary' className='text-xs'>
                      {screen}
                    </Badge>
                  ))}
                </div>
              </div>

              {metric.formula ? (
                <div>
                  <p className='text-xs font-medium uppercase tracking-label text-muted-foreground/85'>
                    Formula
                  </p>
                  <p className='mt-1 rounded bg-muted/50 px-2 py-1 font-mono text-sm text-foreground'>
                    {metric.formula}
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
