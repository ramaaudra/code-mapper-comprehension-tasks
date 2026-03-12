import { useEffect, useMemo, useState } from 'react'

import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/shared/components/ui/card'
import { ArrowLeft, Lightbulb, Target } from '@/shared/components/ui/icons'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import {
  ToggleGroup,
  ToggleGroupItem
} from '@/shared/components/ui/toggle-group'

import {
  metricsGuideDecisionStates,
  metricsGuideCaveats,
  metricsGuideGlossary,
  metricsGuideMetrics,
  metricsGuidePrinciples,
  metricsGuideQuickVisuals,
  metricsGuideScreenHelp
} from '../content/metricsGuideContent'
import { DecisionMatrixGuide } from './DecisionMatrixGuide'
import { MetricGuideCard } from './MetricGuideCard'
import { MetricsGuideSection } from './MetricsGuideSection'
import { MetricsVisualPrimer } from './MetricsVisualPrimer'
import { ScreenUsageGuide } from './ScreenUsageGuide'

interface MetricsGuidePageProps {
  onBack: () => void
}

type GuideMode = 'quick' | 'reference'

const quickGuideSectionLinks = [
  { id: 'start-here', label: 'Start Here' },
  { id: 'visual-primer', label: 'Visual Primer' },
  { id: 'decision-matrix', label: 'Decision Matrix' },
  { id: 'screens', label: 'Which Screen?' },
  { id: 'important-caveats', label: 'Important Caveats' }
] as const

const referenceSectionLinks = [
  { id: 'core-metrics', label: 'Core Metrics' },
  { id: 'derived-heuristics', label: 'Derived Heuristics' },
  { id: 'how-to-read', label: 'How to Read Each Screen' },
  { id: 'glossary', label: 'Glossary' }
] as const

function parseGuideHash(
  hash: string
): { mode: GuideMode; section?: string } | null {
  if (!hash.startsWith('#metrics-guide')) {
    return null
  }

  const parts = hash.replace('#metrics-guide', '').split('/').filter(Boolean)
  const mode = parts[0] === 'reference' ? 'reference' : 'quick'
  const section = parts[1]

  return { mode, section }
}

function buildGuideHash(mode: GuideMode, section?: string) {
  return section
    ? `#metrics-guide/${mode}/${section}`
    : `#metrics-guide/${mode}`
}

export function MetricsGuidePage({ onBack }: MetricsGuidePageProps) {
  const [mode, setMode] = useState<GuideMode>('quick')
  const coreMetrics = useMemo(
    () =>
      metricsGuideMetrics.filter((metric) => metric.family === 'Core Metric'),
    []
  )
  const derivedMetrics = useMemo(
    () =>
      metricsGuideMetrics.filter((metric) => metric.family !== 'Core Metric'),
    []
  )

  const activeSectionLinks =
    mode === 'quick' ? quickGuideSectionLinks : referenceSectionLinks

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const applyHash = () => {
      const parsed = parseGuideHash(window.location.hash)

      if (!parsed) {
        window.history.replaceState(null, '', buildGuideHash('quick'))
        setMode('quick')
        return
      }

      setMode(parsed.mode)

      if (parsed.section) {
        const sectionId = parsed.section
        window.requestAnimationFrame(() => {
          document.getElementById(sectionId)?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          })
        })
      }
    }

    applyHash()
    window.addEventListener('hashchange', applyHash)

    return () => window.removeEventListener('hashchange', applyHash)
  }, [])

  const scrollToSection = (id: string) => {
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', buildGuideHash(mode, id))
    }

    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleModeChange = (nextMode: string) => {
    const resolvedMode: GuideMode =
      nextMode === 'reference' ? 'reference' : 'quick'
    setMode(resolvedMode)

    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', buildGuideHash(resolvedMode))
    }
  }

  return (
    <ScrollArea className='h-full bg-background'>
      <div className='mx-auto max-w-5xl space-y-8 p-6 pb-12'>
        <div className='space-y-3'>
          <Button
            variant='ghost'
            size='sm'
            onClick={onBack}
            className='gap-2 px-0'
          >
            <ArrowLeft className='h-4 w-4' />
            Back
          </Button>

          <div className='space-y-2'>
            <div className='flex items-center gap-2'>
              <Badge variant='outline'>Metrics Guide</Badge>
              <Badge variant='secondary'>Learning + Reference</Badge>
            </div>
            <h1 className='text-3xl font-semibold text-foreground'>
              Metrics Guide
            </h1>
            <p className='max-w-3xl text-sm text-muted-foreground/90'>
              Learn how to read structural metrics, change signals, and review
              heuristics without getting lost in the math.
            </p>
            <p className='max-w-3xl text-sm text-muted-foreground/90'>
              Use Quick Guide for a fast mental model. Use Full Reference when
              you want formulas, caveats, and exact definitions.
            </p>
          </div>
        </div>

        <div className='space-y-3'>
          <ToggleGroup
            type='single'
            value={mode}
            onValueChange={(value) => {
              if (value) {
                handleModeChange(value)
              }
            }}
            size='sm'
          >
            <ToggleGroupItem value='quick' size='sm'>
              Quick Guide
            </ToggleGroupItem>
            <ToggleGroupItem value='reference' size='sm'>
              Full Reference
            </ToggleGroupItem>
          </ToggleGroup>
          <div className='flex flex-wrap gap-2'>
            {activeSectionLinks.map((link) => (
              <Button
                key={link.id}
                variant='outline'
                size='sm'
                onClick={() => scrollToSection(link.id)}
              >
                {link.label}
              </Button>
            ))}
          </div>
        </div>

        {mode === 'quick' ? (
          <>
            <MetricsGuideSection
              id='start-here'
              eyebrow='Quick Guide'
              title='Three things to remember'
              description='If you only remember a few ideas from this guide, remember these.'
            >
              <div className='grid gap-4 md:grid-cols-3'>
                {metricsGuidePrinciples.map((principle, index) => (
                  <Card
                    key={principle}
                    className='border-primary/15 bg-primary/5'
                  >
                    <CardHeader className='pb-2'>
                      <CardTitle className='flex items-center gap-2 text-base'>
                        <Target className='h-4 w-4 text-primary' />
                        Key idea {index + 1}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='text-sm text-foreground'>
                      {principle}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </MetricsGuideSection>

            <MetricsGuideSection
              id='visual-primer'
              eyebrow='Visual Primer'
              title='Understand the core signals first'
              description='These diagrams give you a faster mental model than reading formulas first.'
            >
              <MetricsVisualPrimer visuals={metricsGuideQuickVisuals} />
            </MetricsGuideSection>

            <MetricsGuideSection
              id='decision-matrix'
              eyebrow='Decision Layer'
              title='How the app translates signals into review states'
              description='Use this matrix as a decision guide, not as a universal scientific truth.'
            >
              <DecisionMatrixGuide states={metricsGuideDecisionStates} />
            </MetricsGuideSection>

            <MetricsGuideSection
              id='screens'
              eyebrow='Which Screen Should I Use?'
              title='Choose the screen that matches your question'
              description='The app is easier to use when you know which surface answers which problem.'
            >
              <ScreenUsageGuide screens={metricsGuideScreenHelp} />
            </MetricsGuideSection>

            <MetricsGuideSection
              id='important-caveats'
              eyebrow='Important Caveats'
              title='Avoid the most common misreads'
              description='Read these before treating a metric or heuristic as certainty.'
            >
              <Card className='border-amber-500/20 bg-amber-500/5'>
                <CardHeader className='pb-2'>
                  <CardTitle className='flex items-center gap-2 text-base'>
                    <Lightbulb className='h-4 w-4 text-amber-500' />
                    Read these before making a decision
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className='space-y-2 text-sm text-foreground'>
                    {metricsGuideCaveats.map((item) => (
                      <li key={item} className='flex gap-2'>
                        <span className='mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500' />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </MetricsGuideSection>
          </>
        ) : (
          <>
            <MetricsGuideSection
              id='core-metrics'
              eyebrow='Core Metrics'
              title='Structural and historical metrics'
              description='These metrics describe the codebase directly. They are the foundation for the derived review signals in the UI.'
            >
              <div className='grid gap-4 lg:grid-cols-2'>
                {coreMetrics.map((metric) => (
                  <MetricGuideCard key={metric.id} metric={metric} />
                ))}
              </div>
            </MetricsGuideSection>

            <MetricsGuideSection
              id='derived-heuristics'
              eyebrow='Derived Heuristics'
              title='Product heuristics for prioritization'
              description='These are decision-support heuristics built from repository signals. Use them for triage, not as universal scientific truths.'
            >
              <div className='grid gap-4 lg:grid-cols-2'>
                {derivedMetrics.map((metric) => (
                  <MetricGuideCard key={metric.id} metric={metric} />
                ))}
              </div>
            </MetricsGuideSection>

            <MetricsGuideSection
              id='how-to-read'
              eyebrow='How to Read Each Screen'
              title='Match the guide to the screen you are using'
              description='Each screen answers a different question. Use the right one for the right job.'
            >
              <ScreenUsageGuide screens={metricsGuideScreenHelp} />
            </MetricsGuideSection>

            <MetricsGuideSection
              id='glossary'
              eyebrow='Glossary'
              title='Short definitions you can return to later'
              description='Use this section as a quick reference when you only need a short reminder.'
            >
              <div className='grid gap-3 md:grid-cols-2'>
                {metricsGuideGlossary.map((item) => (
                  <Card key={item.term} className='border-border/70 bg-card/40'>
                    <CardHeader className='pb-2'>
                      <CardTitle className='text-sm'>{item.term}</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-1.5'>
                      <p className='text-sm text-foreground'>
                        {item.definition}
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        {item.practicalMeaning}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </MetricsGuideSection>
          </>
        )}
      </div>
    </ScrollArea>
  )
}
