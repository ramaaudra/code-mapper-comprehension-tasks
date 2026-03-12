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

import type { MetricsGuideMetric } from '../content/metricsGuideContent'

interface MetricGuideVisualProps {
  metric: MetricsGuideMetric
}

const familyToneClasses = {
  'Core Metric': 'border-sky-500/20 bg-sky-500/5 text-sky-600',
  'Derived Heuristic': 'border-amber-500/20 bg-amber-500/5 text-amber-600',
  'Review Heuristic': 'border-emerald-500/20 bg-emerald-500/5 text-emerald-600'
} as const

function Dot({ emphasized = false }: { emphasized?: boolean }) {
  return (
    <span
      className={
        emphasized
          ? 'h-4 w-4 rounded-full bg-primary'
          : 'h-3 w-3 rounded-full bg-muted-foreground/60'
      }
    />
  )
}

function renderVisual(metricId: string) {
  switch (metricId) {
    case 'dependents':
      return (
        <div className='flex items-center justify-between gap-3'>
          <div className='space-y-2'>
            <Dot />
            <Dot />
            <Dot />
          </div>
          <ArrowRight className='h-4 w-4 text-muted-foreground' />
          <Dot emphasized />
        </div>
      )
    case 'dependencies':
      return (
        <div className='flex items-center justify-between gap-3'>
          <Dot emphasized />
          <ArrowRight className='h-4 w-4 text-muted-foreground' />
          <div className='space-y-2'>
            <Dot />
            <Dot />
            <Dot />
          </div>
        </div>
      )
    case 'instability':
      return (
        <div className='space-y-2'>
          <div className='flex items-center justify-between text-[11px] text-muted-foreground'>
            <span className='inline-flex items-center gap-1'>
              <Layers className='h-3.5 w-3.5' />
              Foundational
            </span>
            <span className='inline-flex items-center gap-1'>
              <Wind className='h-3.5 w-3.5' />
              Outward-facing
            </span>
          </div>
          <div className='h-2 rounded-full bg-gradient-to-r from-sky-500/70 via-slate-500/70 to-emerald-500/70' />
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
          <span className='rounded-full bg-sky-500/15 px-2 py-1 text-sky-600'>
            Shared reuse
          </span>
          <span>+</span>
          <span className='rounded-full bg-amber-500/15 px-2 py-1 text-amber-600'>
            Outward pull
          </span>
          <ArrowRight className='h-4 w-4' />
          <span className='rounded-full bg-red-500/15 px-2 py-1 text-red-600'>
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
          <span className='rounded-full bg-orange-500/15 px-2 py-1 text-orange-600'>
            Recent activity
          </span>
          <span>+</span>
          <span className='rounded-full bg-sky-500/15 px-2 py-1 text-sky-600'>
            Structural sensitivity
          </span>
        </div>
      )
    default:
      return (
        <div className='flex items-center gap-2 text-xs text-muted-foreground'>
          <span className='rounded-full bg-red-500/15 px-2 py-1 text-red-600'>
            Critical
          </span>
          <span className='rounded-full bg-amber-500/15 px-2 py-1 text-amber-600'>
            Active
          </span>
          <span className='rounded-full bg-emerald-500/15 px-2 py-1 text-emerald-600'>
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
