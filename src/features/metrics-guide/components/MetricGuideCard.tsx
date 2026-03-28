import { Badge } from '@/shared/components/ui/badge'

import { MetricGuideVisual } from './MetricGuideVisual'

import type { MetricsGuideMetric } from '../content/metricsGuideContent'

interface MetricGuideCardProps {
  metric: MetricsGuideMetric
}

export function MetricGuideCard({ metric }: MetricGuideCardProps) {
  return (
    <div className='border-b border-border/40 py-6 last:border-0'>
      <div className='mb-4 flex flex-wrap items-center gap-2'>
        <h3 className='text-lg font-semibold text-foreground'>
          {metric.title}
        </h3>
        <Badge variant='outline' className='text-xs text-muted-foreground'>
          {metric.family}
        </Badge>
      </div>

      <div className='space-y-5 text-sm md:text-base'>
        <MetricGuideVisual metric={metric} />

        <div className='space-y-4 text-foreground/90'>
          <p>
            <strong className='inline-block min-w-[140px] font-medium text-foreground'>
              What it means:{' '}
            </strong>
            {metric.whatItMeans}
          </p>
          <p>
            <strong className='inline-block min-w-[140px] font-medium text-foreground'>
              Why you should care:{' '}
            </strong>
            {metric.whyYouShouldCare}
          </p>
          <p>
            <strong className='inline-block min-w-[140px] font-medium text-foreground'>
              What you should do:{' '}
            </strong>
            {metric.whatYouShouldDo}
          </p>
        </div>

        {(metric.caveat ||
          metric.formula ||
          (metric.whereYouSeeIt && metric.whereYouSeeIt.length > 0)) && (
          <div className='mt-6 space-y-3 rounded-lg border-t border-border/30 bg-muted/20 p-4 pt-4'>
            {metric.caveat && (
              <p className='text-sm text-foreground/80'>
                <strong className='font-medium text-foreground'>
                  Keep in mind:{' '}
                </strong>
                <span className='italic'>{metric.caveat}</span>
              </p>
            )}

            {metric.formula && (
              <p className='text-sm text-foreground/80'>
                <strong className='font-medium text-foreground'>
                  Formula:{' '}
                </strong>
                <span className='rounded bg-muted/50 px-1.5 py-0.5 font-mono text-muted-foreground'>
                  {metric.formula}
                </span>
              </p>
            )}

            {metric.whereYouSeeIt && metric.whereYouSeeIt.length > 0 && (
              <div className='flex flex-wrap items-center gap-2 pt-1 text-sm text-foreground/80'>
                <strong className='font-medium text-foreground'>
                  Where you see it:
                </strong>
                <div className='flex flex-wrap gap-1.5'>
                  {metric.whereYouSeeIt.map((screen) => (
                    <Badge
                      key={screen}
                      variant='secondary'
                      className='text-[10px] font-semibold uppercase text-muted-foreground'
                    >
                      {screen}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
