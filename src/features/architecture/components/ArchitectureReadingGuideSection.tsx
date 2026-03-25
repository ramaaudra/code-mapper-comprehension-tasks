import { useState } from 'react'

import { Button } from '@/shared/components/ui/button'
import {
  CaretDown,
  CaretRight,
  Layers,
  Lightbulb,
  ShieldCheck,
  Wind
} from '@/shared/components/ui/icons'
import {
  formatReviewSignalBandRange,
  getStructuralPositionBandLabel
} from '@/shared/lib/metric-thresholds'

import { architectureCopy } from '../content/architectureCopy'

interface ArchitectureReadingGuideSectionProps {
  onShowMetricsGuide?: () => void
}

export function ArchitectureReadingGuideSection({
  onShowMetricsGuide
}: ArchitectureReadingGuideSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <section
      aria-labelledby='architecture-reading-guide-heading'
      className='rounded-xl border border-border/60 bg-muted/20'
    >
      {isExpanded ? (
        <div className='space-y-5 p-5'>
          <div className='flex flex-wrap items-start justify-between gap-4'>
            <div className='flex min-w-0 items-start gap-3'>
              <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background/70 text-foreground'>
                <Lightbulb className='h-5 w-5' />
              </div>
              <div className='min-w-0 space-y-2'>
                <h2
                  id='architecture-reading-guide-heading'
                  className='text-sm font-semibold text-foreground'
                >
                  {architectureCopy.readingGuide.expandedTitle}
                </h2>
                <p className='max-w-3xl text-sm leading-relaxed text-muted-foreground'>
                  Do not treat the{' '}
                  <strong>
                    {getStructuralPositionBandLabel('Outward-Dependent')}
                  </strong>{' '}
                  band as a defect. In dependency metrics, instability describes
                  a module&apos;s structural position in the dependency graph,
                  not code quality or direct propagation risk. Use{' '}
                  <strong>Propagation Risk</strong> to estimate how strongly a
                  modification may propagate.
                </p>
              </div>
            </div>
            <div className='flex flex-wrap items-center gap-2'>
              {onShowMetricsGuide ? (
                <Button onClick={onShowMetricsGuide} variant='outline'>
                  {architectureCopy.readingGuide.fullGuide}
                  <CaretRight className='ml-1 h-4 w-4' />
                </Button>
              ) : null}
              <Button
                type='button'
                variant='secondary'
                onClick={() => {
                  setIsExpanded(false)
                }}
                aria-label='Collapse reading guide'
              >
                Collapse guide
                <CaretDown className='ml-1 h-4 w-4' />
              </Button>
            </div>
          </div>

          <div className='grid gap-3 md:grid-cols-3'>
            <div className='rounded-lg border border-border/60 bg-background/70 p-4'>
              <div className='flex items-center gap-2'>
                <ShieldCheck className='h-5 w-5 text-foreground' />
                <span className='text-sm font-medium text-foreground'>
                  {formatReviewSignalBandRange(
                    'structuralPosition',
                    'Foundation-like'
                  )}{' '}
                  - {getStructuralPositionBandLabel('Foundation-like')}
                </span>
              </div>
              <p className='mt-3 text-xs leading-relaxed text-muted-foreground'>
                At this extreme, more incoming cross-module dependency edges
                point into this module than out of it. Changes here often
                deserve careful regression testing.
              </p>
              <p className='mt-2 text-xs font-medium text-foreground'>
                Common in: shared foundations, domain logic, configuration, and
                utility layers
              </p>
            </div>
            <div className='rounded-lg border border-border/60 bg-background/70 p-4'>
              <div className='flex items-center gap-2'>
                <Layers className='h-5 w-5 text-foreground' />
                <span className='text-sm font-medium text-foreground'>
                  {formatReviewSignalBandRange(
                    'structuralPosition',
                    'Balanced'
                  )}{' '}
                  - {getStructuralPositionBandLabel('Balanced')}
                </span>
              </div>
              <p className='mt-3 text-xs leading-relaxed text-muted-foreground'>
                Incoming and outgoing coupling are both significant. These
                modules often sit between foundational layers and UI-facing
                layers.
              </p>
              <p className='mt-2 text-xs font-medium text-foreground'>
                Common in: orchestration layers, feature modules, and shared
                application services
              </p>
            </div>
            <div className='rounded-lg border border-border/60 bg-background/70 p-4'>
              <div className='flex items-center gap-2'>
                <Wind className='h-5 w-5 text-foreground' />
                <span className='text-sm font-medium text-foreground'>
                  {formatReviewSignalBandRange(
                    'structuralPosition',
                    'Outward-Dependent'
                  )}{' '}
                  - {getStructuralPositionBandLabel('Outward-Dependent')}
                </span>
              </div>
              <p className='mt-3 text-xs leading-relaxed text-muted-foreground'>
                At this extreme, outgoing cross-module dependency edges dominate
                while incoming ones are limited. These modules are often easier
                to replace or refactor.
              </p>
              <p className='mt-2 text-xs font-medium text-foreground'>
                Common in: presentation layers, route modules, UI shells, and
                adapters
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className='flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between'>
          <div className='flex min-w-0 items-start gap-3'>
            <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background/70 text-foreground'>
              <Lightbulb className='h-5 w-5' />
            </div>
            <div className='min-w-0 space-y-1'>
              <h2
                id='architecture-reading-guide-heading'
                className='text-sm font-semibold text-foreground'
              >
                {architectureCopy.readingGuide.collapsedTitle}
              </h2>
              <p className='max-w-3xl text-sm leading-relaxed text-muted-foreground'>
                {architectureCopy.readingGuide.collapsedDescription}
              </p>
            </div>
          </div>
          <div className='flex flex-wrap items-center gap-2'>
            <Button
              type='button'
              variant='secondary'
              onClick={() => {
                setIsExpanded(true)
              }}
            >
              {architectureCopy.readingGuide.readHere}
              <CaretRight className='ml-1 h-4 w-4' />
            </Button>
            {onShowMetricsGuide ? (
              <Button
                type='button'
                variant='outline'
                onClick={onShowMetricsGuide}
              >
                {architectureCopy.readingGuide.fullGuide}
                <CaretRight className='ml-1 h-4 w-4' />
              </Button>
            ) : null}
          </div>
        </div>
      )}
    </section>
  )
}
