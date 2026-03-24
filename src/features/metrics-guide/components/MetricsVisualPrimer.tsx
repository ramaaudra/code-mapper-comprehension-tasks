import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/shared/components/ui/card'
import { ArrowRight, Layers, Wind } from '@/shared/components/ui/icons'

import type { MetricsGuideQuickVisual } from '../content/metricsGuideContent'

interface MetricsVisualPrimerProps {
  visuals: MetricsGuideQuickVisual[]
}

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

function DependentsDiagram() {
  return (
    <div className='flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/20 p-3'>
      <div className='space-y-2'>
        <Dot />
        <Dot />
        <Dot />
      </div>
      <ArrowRight className='h-4 w-4 text-muted-foreground' />
      <Dot emphasized />
    </div>
  )
}

function DependenciesDiagram() {
  return (
    <div className='flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/20 p-3'>
      <Dot emphasized />
      <ArrowRight className='h-4 w-4 text-muted-foreground' />
      <div className='space-y-2'>
        <Dot />
        <Dot />
        <Dot />
      </div>
    </div>
  )
}

function InstabilityDiagram() {
  return (
    <div className='space-y-2 rounded-lg border border-border/60 bg-muted/20 p-3'>
      <div className='flex items-center justify-between text-xs text-muted-foreground'>
        <span className='inline-flex items-center gap-1'>
          <Layers className='h-3.5 w-3.5' />
          Foundation-like
        </span>
        <span className='inline-flex items-center gap-1'>
          <Wind className='h-3.5 w-3.5' />
          Outward-facing
        </span>
      </div>
      <div className='relative h-2 rounded-full bg-gradient-to-r from-sky-500/70 via-slate-500/70 to-emerald-500/70'>
        <span className='absolute left-[12%] top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-background bg-sky-500' />
        <span className='absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-slate-500' />
        <span className='absolute right-[12%] top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-background bg-emerald-500' />
      </div>
      <div className='flex items-center justify-between text-xs text-muted-foreground'>
        <span>Low I</span>
        <span>Balanced</span>
        <span>High I</span>
      </div>
    </div>
  )
}

function renderDiagram(id: string) {
  switch (id) {
    case 'dependents':
      return <DependentsDiagram />
    case 'dependencies':
      return <DependenciesDiagram />
    default:
      return <InstabilityDiagram />
  }
}

export function MetricsVisualPrimer({ visuals }: MetricsVisualPrimerProps) {
  return (
    <div className='grid gap-4 lg:grid-cols-3'>
      {visuals.map((visual) => (
        <Card key={visual.id} className='border-border/70 bg-card/50'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-base'>{visual.title}</CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            {renderDiagram(visual.id)}
            <p className='text-sm text-foreground'>{visual.summary}</p>
            <p className='text-sm text-muted-foreground'>{visual.takeaway}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
