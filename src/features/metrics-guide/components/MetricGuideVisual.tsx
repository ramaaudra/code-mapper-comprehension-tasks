import {
  ArrowRight,
  Bomb,
  Focus,
  Layers,
  Lightbulb,
  Network,
  TrendingUp,
  Wind
} from '@/shared/components/ui/icons'
import { cn } from '@/shared/lib/utils'

import { GuideDot } from './GuideDot'

import type { MetricsGuideMetric } from '../content/metricsGuideContent'

interface MetricGuideVisualProps {
  metric: MetricsGuideMetric
}

const familyToneClasses = {
  'Core Metric':
    'border-guide-core-border bg-guide-core-surface text-guide-core-foreground',
  'Derived Heuristic':
    'border-guide-derived-border bg-guide-derived-surface text-guide-derived-foreground',
  'Review Heuristic':
    'border-guide-review-border bg-guide-review-surface text-guide-review-foreground'
} as const

function renderVisual(metricId: string) {
  switch (metricId) {
    case 'dependents':
      return (
        <div className='flex items-center justify-between gap-3'>
          <div className='space-y-2'>
            <GuideDot />
            <GuideDot />
            <GuideDot />
          </div>
          <ArrowRight className='h-4 w-4 text-muted-foreground' />
          <GuideDot emphasized />
        </div>
      )
    case 'dependencies':
      return (
        <div className='flex items-center justify-between gap-3'>
          <GuideDot emphasized />
          <ArrowRight className='h-4 w-4 text-muted-foreground' />
          <div className='space-y-2'>
            <GuideDot />
            <GuideDot />
            <GuideDot />
          </div>
        </div>
      )
    case 'instability':
      return (
        <div className='space-y-2'>
          <div className='flex items-center justify-between text-xs text-muted-foreground'>
            <span className='inline-flex items-center gap-1'>
              <Layers className='h-3.5 w-3.5' />
              Foundational
            </span>
            <span className='inline-flex items-center gap-1'>
              <Wind className='h-3.5 w-3.5' />
              Outward-facing
            </span>
          </div>
          <div className='h-2 rounded-full bg-gradient-to-r from-guide-core-foreground/70 via-guide-neutral-foreground/70 to-guide-review-foreground/70' />
        </div>
      )
    case 'relative-churn':
      return (
        <div className='flex items-end gap-2'>
          <span className='h-4 w-4 rounded-sm bg-muted-foreground/40' />
          <span className='h-7 w-4 rounded-sm bg-muted-foreground/40' />
          <span className='h-10 w-4 rounded-sm bg-primary/80' />
          <span className='h-6 w-4 rounded-sm bg-muted-foreground/40' />
          <TrendingUp className='h-4 w-4 text-primary' />
        </div>
      )
    case 'propagation-risk':
      return (
        <div className='flex items-center gap-2 text-xs text-muted-foreground'>
          <span className='rounded-full bg-guide-core-surface px-2 py-1 text-guide-core-foreground'>
            Shared reuse
          </span>
          <span>+</span>
          <span className='rounded-full bg-guide-derived-surface px-2 py-1 text-guide-derived-foreground'>
            Outward pull
          </span>
          <ArrowRight className='h-4 w-4' />
          <span className='rounded-full bg-status-critical-surface px-2 py-1 text-status-critical-foreground'>
            Wider spread
          </span>
        </div>
      )
    case 'blast-radius':
      return (
        <div className='flex items-center gap-3'>
          <div className='relative flex h-12 w-12 items-center justify-center'>
            <span className='absolute inset-0 rounded-full border border-primary/25' />
            <span className='absolute inset-1 rounded-full border border-primary/35' />
            <Focus className='h-5 w-5 text-primary' />
          </div>
          <div className='space-y-1 text-xs text-muted-foreground'>
            <p>Nearby verification</p>
            <p>around one file change</p>
          </div>
        </div>
      )
    case 'hotspot-score':
      return (
        <div className='flex items-center gap-2 text-xs text-muted-foreground'>
          <span className='rounded-full bg-status-warning-surface px-2 py-1 text-status-warning-foreground'>
            Recent activity
          </span>
          <span>+</span>
          <span className='rounded-full bg-guide-core-surface px-2 py-1 text-guide-core-foreground'>
            Structural sensitivity
          </span>
        </div>
      )
    default:
      return (
        <div className='flex items-center gap-2 text-xs text-muted-foreground'>
          <span className='rounded-full bg-status-critical-surface px-2 py-1 text-status-critical-foreground'>
            Critical
          </span>
          <span className='rounded-full bg-status-warning-surface px-2 py-1 text-status-warning-foreground'>
            Active
          </span>
          <span className='rounded-full bg-status-success-surface px-2 py-1 text-status-success-foreground'>
            Stable
          </span>
        </div>
      )
  }
}

function getMetricIcon(metricId: string) {
  switch (metricId) {
    case 'dependents':
    case 'dependencies':
      return Network
    case 'instability':
      return Wind
    case 'relative-churn':
      return TrendingUp
    case 'propagation-risk':
      return Focus
    case 'blast-radius':
      return Bomb
    case 'hotspot-score':
    case 'hotspot-status':
      return Lightbulb
    default:
      return Network
  }
}

export function MetricGuideVisual({ metric }: MetricGuideVisualProps) {
  const toneClass = familyToneClasses[metric.family]
  const Icon = getMetricIcon(metric.id)

  return (
    <div className={cn('rounded-lg border p-3', toneClass)}>
      <div className='flex items-start gap-3'>
        <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-background/70'>
          <Icon className='h-4 w-4' />
        </div>
        <div className='min-w-0 flex-1 space-y-2'>
          <div className='space-y-1'>
            <p className='text-sm font-medium text-foreground'>
              {metric.visualAnalogyTitle}
            </p>
            <p className='text-sm text-muted-foreground'>
              {metric.visualAnalogyDescription}
            </p>
          </div>
          <div className='rounded-md border border-border/50 bg-background/70 px-3 py-2'>
            {renderVisual(metric.id)}
          </div>
        </div>
      </div>
    </div>
  )
}
