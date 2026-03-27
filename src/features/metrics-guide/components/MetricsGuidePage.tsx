import { useEffect, useMemo, useRef, useState } from 'react'

import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/shared/components/ui/card'
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  List
} from '@/shared/components/ui/icons'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import {
  ToggleGroup,
  ToggleGroupItem
} from '@/shared/components/ui/toggle-group'
import { shellCopy } from '@/shared/content/shellCopy'
import {
  buildMetricsGuideHash,
  parseMetricsGuideHash
} from '@/shared/lib/utils'

import {
  metricsGuideDecisionStates,
  metricsGuideCaveats,
  metricsGuideGlossary,
  metricsGuideHeroInsight,
  metricsGuideMetrics,
  metricsGuidePrinciples,
  metricsGuideQuickVisuals,
  metricsGuideScreenHelp
} from '../content/metricsGuideContent'
import { DecisionMatrixGuide } from './DecisionMatrixGuide'
import { MetricGuideCard } from './MetricGuideCard'
import { MetricsGuideSection } from './MetricsGuideSection'
import { MetricsGuideTOC } from './MetricsGuideTOC'
import { MetricsVisualPrimer } from './MetricsVisualPrimer'
import { ScreenUsageGuide } from './ScreenUsageGuide'

import type { MetricsGuideMode } from '@/shared/types/explorer'

interface MetricsGuidePageProps {
  onBack: () => void
  onModeChange?: (mode: MetricsGuideMode) => void
}

export function MetricsGuidePage({
  onBack,
  onModeChange
}: MetricsGuidePageProps) {
  const [mode, setMode] = useState<MetricsGuideMode>('quick')
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const applyHash = () => {
      const parsed = parseMetricsGuideHash(window.location.hash)

      if (!parsed) {
        window.history.replaceState(null, '', buildMetricsGuideHash('quick'))
        setMode('quick')
        onModeChange?.('quick')
        return
      }

      setMode(parsed.mode)
      onModeChange?.(parsed.mode)

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
  }, [onModeChange])

  useEffect(() => {
    if (typeof window === 'undefined' || !contentRef.current) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        if (visibleSections.length > 0) {
          setActiveSection(visibleSections[0].target.id)
        }
      },
      {
        rootMargin: '-80px 0px -70% 0px',
        threshold: 0
      }
    )

    const sections = contentRef.current.querySelectorAll('section[id]')
    sections.forEach((section) => observer.observe(section))

    return () => observer.disconnect()
  }, [mode])

  const scrollToSection = (id: string) => {
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', buildMetricsGuideHash(mode, id))
    }

    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })

    setIsMobileMenuOpen(false)
  }

  const handleModeChange = (nextMode: string) => {
    const resolvedMode: MetricsGuideMode =
      nextMode === 'reference' ? 'reference' : 'quick'
    setMode(resolvedMode)
    setActiveSection(null)
    onModeChange?.(resolvedMode)

    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', buildMetricsGuideHash(resolvedMode))
    }
  }

  return (
    <div
      className={`flex h-full ${mode === 'quick' ? 'bg-guide-quick-surface' : 'bg-guide-reference-surface'}`}
    >
      <aside className='hidden shrink-0 border-r border-border/50 lg:block lg:w-56 xl:w-64'>
        <div className='sticky top-0 h-full overflow-y-auto p-4'>
          <MetricsGuideTOC
            mode={mode}
            activeSection={activeSection}
            onSectionClick={scrollToSection}
          />
        </div>
      </aside>

      <ScrollArea className='flex-1'>
        <div className='mx-auto max-w-4xl space-y-6 p-6 pb-12 lg:space-y-8'>
          <div className='space-y-4'>
            <div className='flex items-center justify-between gap-4'>
              <Button
                variant='ghost'
                size='sm'
                onClick={onBack}
                className='gap-2 px-0'
              >
                <ArrowLeft className='h-4 w-4' />
                {shellCopy.utilities.back}
              </Button>

              <Button
                variant='outline'
                size='sm'
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className='min-h-[44px] gap-2 lg:hidden'
                aria-expanded={isMobileMenuOpen}
                aria-controls='mobile-toc'
              >
                <List className='h-4 w-4' />
                Contents
              </Button>
            </div>

            {isMobileMenuOpen && (
              <div
                id='mobile-toc'
                className='rounded-lg border border-border/70 bg-card p-4 lg:hidden'
              >
                <MetricsGuideTOC
                  mode={mode}
                  activeSection={activeSection}
                  onSectionClick={scrollToSection}
                />
              </div>
            )}

            <div className='space-y-3'>
              <div className='flex items-center gap-2'>
                <Badge variant='outline'>Metrics Guide</Badge>
              </div>
              <h1 className='text-2xl font-semibold text-foreground'>
                How to use the metrics
              </h1>
              <p className='max-w-3xl text-sm text-muted-foreground'>
                This guide shows you how to read metrics, understand what they
                mean for your code, and decide what to do next. Skip the math —
                focus on the decisions.
              </p>
            </div>
          </div>

          <div className='space-y-3'>
            <div className='flex flex-wrap items-center gap-3'>
              <ToggleGroup
                type='single'
                value={mode}
                onValueChange={(value) => {
                  if (value) {
                    handleModeChange(value)
                  }
                }}
                size='sm'
                className='bg-muted/50'
              >
                <ToggleGroupItem
                  value='quick'
                  size='sm'
                  className='data-[state=on]:bg-primary/15 data-[state=on]:font-semibold data-[state=on]:text-foreground data-[state=on]:shadow-none'
                >
                  Quick Guide
                </ToggleGroupItem>
                <ToggleGroupItem
                  value='reference'
                  size='sm'
                  className='data-[state=on]:bg-card data-[state=on]:font-medium data-[state=on]:text-foreground data-[state=on]:shadow-sm'
                >
                  Full Reference
                </ToggleGroupItem>
              </ToggleGroup>
              <span className='text-xs text-muted-foreground'>
                {mode === 'quick'
                  ? 'Answers in 30 seconds'
                  : 'Deep dive with formulas'}
              </span>
            </div>
          </div>

          <div ref={contentRef} className='space-y-6 lg:space-y-8'>
            {mode === 'quick' ? (
              <>
                {/* Hero section — visually prominent */}
                <MetricsGuideSection
                  id='what-you-can-do'
                  eyebrow='Start Here'
                  title='What this guide will help you do'
                  description='Answer these three questions and the metrics will make sense.'
                  mode={mode}
                  className='rounded-xl border border-primary/10 bg-primary/[0.03] p-5'
                >
                  <div className='space-y-4'>
                    {metricsGuideHeroInsight.actions.map((action, index) => (
                      <Card
                        key={index}
                        className='overflow-hidden border-border/70 bg-card/50'
                      >
                        <div className='flex'>
                          <div className='flex w-10 shrink-0 items-center justify-center bg-primary/10'>
                            <HelpCircle className='h-5 w-5 text-primary' />
                          </div>
                          <div className='flex-1 p-4'>
                            <p className='text-sm font-medium text-foreground'>
                              {action.question}
                            </p>
                            <p className='mt-1 text-sm text-muted-foreground'>
                              {action.answer}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </MetricsGuideSection>

                <MetricsGuideSection
                  id='key-ideas'
                  eyebrow='Key Ideas'
                  title='Three things to remember'
                  description='If you only remember a few ideas from this guide, remember these.'
                  mode={mode}
                >
                  <div className='grid gap-4 md:grid-cols-3'>
                    {metricsGuidePrinciples.map((principle) => (
                      <Card
                        key={principle.label}
                        className='border-primary/15 bg-primary/5'
                      >
                        <CardHeader className='pb-2'>
                          <CardTitle className='flex items-center gap-2 text-base'>
                            <CheckCircle className='h-4 w-4 text-primary' />
                            {principle.label}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className='text-sm text-foreground'>
                          {principle.text}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </MetricsGuideSection>

                <MetricsGuideSection
                  id='visual-primer'
                  eyebrow='Visual Primer'
                  title='Understand the core signals'
                  description='These diagrams give you a mental model faster than reading formulas.'
                  mode={mode}
                >
                  <MetricsVisualPrimer visuals={metricsGuideQuickVisuals} />
                </MetricsGuideSection>

                <MetricsGuideSection
                  id='decision-matrix'
                  eyebrow='Decision Matrix'
                  title='How signals become review priorities'
                  description='The app uses this matrix to decide what to show you first.'
                  mode={mode}
                >
                  <DecisionMatrixGuide states={metricsGuideDecisionStates} />
                </MetricsGuideSection>

                <MetricsGuideSection
                  id='screens'
                  eyebrow='Which Screen?'
                  title='Choose the right screen for your question'
                  description='Each screen answers a different question. Pick the one that matches what you need.'
                  mode={mode}
                >
                  <ScreenUsageGuide screens={metricsGuideScreenHelp} />
                </MetricsGuideSection>

                {/* Caveats — subtler treatment */}
                <MetricsGuideSection
                  id='important-caveats'
                  eyebrow='Caveats'
                  title='Common mistakes to avoid'
                  description='Read these before you make decisions based on metrics.'
                  mode={mode}
                >
                  <Card className='border-status-caution-border/40 bg-status-caution-surface/50'>
                    <CardHeader className='pb-2'>
                      <CardTitle className='flex items-center gap-2 text-base'>
                        <AlertTriangle className='h-4 w-4 text-status-caution-foreground' />
                        Keep in mind
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className='space-y-2 text-sm text-foreground'>
                        {metricsGuideCaveats.map((item) => (
                          <li key={item} className='flex gap-2'>
                            <span className='mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-status-caution-foreground/60' />
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
                  description='These metrics describe the codebase directly. They are the foundation for derived signals.'
                  mode={mode}
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
                  description='These are decision-support heuristics built from repository signals. Use them for triage.'
                  mode={mode}
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
                  mode={mode}
                >
                  <ScreenUsageGuide screens={metricsGuideScreenHelp} />
                </MetricsGuideSection>

                <MetricsGuideSection
                  id='glossary'
                  eyebrow='Glossary'
                  title='Quick reference'
                  description='Short definitions you can return to later.'
                  mode={mode}
                >
                  <div className='grid gap-3 md:grid-cols-2'>
                    {metricsGuideGlossary.map((item) => (
                      <Card
                        key={item.term}
                        className='border-border/70 bg-card/40'
                      >
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
        </div>
      </ScrollArea>
    </div>
  )
}
