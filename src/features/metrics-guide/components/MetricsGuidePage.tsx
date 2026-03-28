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
import { shellCopy } from '@/shared/content/shellCopy'
import {
  buildMetricsGuideHash,
  parseMetricsGuideHash
} from '@/shared/lib/utils'

import {
  metricsGuideDecisionQuadrants,
  metricsGuideCaveats,
  metricsGuideGlossary,
  metricsGuideHeroInsight,
  metricsGuideMetrics,
  metricsGuidePrinciples,
  metricsGuideQuickVisuals,
  metricsGuideScreenUsage as metricsGuideScreenHelp
} from '../content/metricsGuideContent'
import { DecisionMatrixGuide } from './DecisionMatrixGuide'
import { MetricGuideCard } from './MetricGuideCard'
import { MetricsGuideSection } from './MetricsGuideSection'
import { MetricsGuideTOC } from './MetricsGuideTOC'
import { MetricsVisualPrimer } from './MetricsVisualPrimer'
import { ScreenUsageGuide } from './ScreenUsageGuide'

import type { MetricsGuideSectionId } from '@/shared/lib/utils'

interface MetricsGuidePageProps {
  onBack: () => void
}

export function MetricsGuidePage({ onBack }: MetricsGuidePageProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  const codebaseSignals = useMemo(
    () => metricsGuideMetrics.filter((m) => m.family === 'Codebase Signals'),
    []
  )
  const impactEstimates = useMemo(
    () => metricsGuideMetrics.filter((m) => m.family === 'Impact Estimates'),
    []
  )
  const reviewPriorities = useMemo(
    () => metricsGuideMetrics.filter((m) => m.family === 'Review Priorities'),
    []
  )

  useEffect(() => {
    if (typeof window === 'undefined' || !contentRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        if (visibleSections.length > 0) {
          setActiveSection(visibleSections[0].target.id)
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
    )

    const sections = contentRef.current.querySelectorAll('section[id]')
    sections.forEach((section) => observer.observe(section))

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const applyMetricsGuideHash = () => {
      const parsedHash = parseMetricsGuideHash(window.location.hash)

      if (!parsedHash) {
        return
      }

      const canonicalHash = buildMetricsGuideHash(parsedHash.section)

      if (window.location.hash !== canonicalHash) {
        window.history.replaceState(
          null,
          '',
          `${window.location.pathname}${window.location.search}${canonicalHash}`
        )
      }

      if (parsedHash.section) {
        const targetSection = parsedHash.section
        window.requestAnimationFrame(() => {
          document.getElementById(targetSection)?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          })
        })
      }
    }

    applyMetricsGuideHash()
    window.addEventListener('hashchange', applyMetricsGuideHash)

    return () => window.removeEventListener('hashchange', applyMetricsGuideHash)
  }, [])

  const scrollToSection = (id: MetricsGuideSectionId) => {
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', buildMetricsGuideHash(id))
    }
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setIsMobileMenuOpen(false)
  }

  return (
    <div className='flex h-full bg-background'>
      <aside className='hidden shrink-0 border-r border-border/50 lg:block lg:w-56 xl:w-64'>
        <div className='sticky top-0 h-full overflow-y-auto p-4'>
          <MetricsGuideTOC
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
                  activeSection={activeSection}
                  onSectionClick={scrollToSection}
                />
              </div>
            )}

            <div className='space-y-3'>
              <div className='flex items-center gap-2'>
                <Badge variant='outline'>Documentation</Badge>
              </div>
              <h1 className='text-3xl font-semibold tracking-tight text-foreground'>
                Metrics Guide
              </h1>
              <p className='max-w-3xl text-base text-muted-foreground'>
                This guide shows you how to read the signals, understand what
                they mean for your code, and decide what to do next. All in one
                place.
              </p>
            </div>
          </div>

          <div ref={contentRef} className='space-y-16 pt-6 lg:space-y-20'>
            <MetricsGuideSection
              id='start-here'
              eyebrow='1. Quick Start'
              title='Start Here'
              description='Answer these three questions and the metrics will make sense.'
            >
              <div className='space-y-8'>
                <div className='space-y-4'>
                  {metricsGuideHeroInsight.actions.map((action, index) => (
                    <div
                      key={index}
                      className='flex gap-4 rounded-xl border border-primary/10 bg-primary/[0.02] p-5'
                    >
                      <div className='flex w-8 shrink-0 items-start justify-center pt-0.5'>
                        <HelpCircle className='h-5 w-5 text-primary' />
                      </div>
                      <div className='flex-1'>
                        <p className='mb-1 text-base font-semibold text-foreground'>
                          {action.question}
                        </p>
                        <p className='text-base leading-relaxed text-foreground/80'>
                          {action.answer}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className='grid gap-4 border-t border-border/40 pt-6 md:grid-cols-3'>
                  {metricsGuidePrinciples.map((principle) => (
                    <div
                      key={principle.label}
                      className='rounded-lg bg-muted/30 p-4'
                    >
                      <div className='mb-2 flex items-center gap-2'>
                        <CheckCircle className='h-4 w-4 text-primary' />
                        <h4 className='text-sm font-semibold'>
                          {principle.label}
                        </h4>
                      </div>
                      <p className='text-sm text-muted-foreground'>
                        {principle.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </MetricsGuideSection>

            <MetricsGuideSection
              id='how-to-read'
              eyebrow='2. The Metrics'
              title='How to Read the Metrics'
              description='Every metric explained plainly: what it means, why you care, and what to do.'
            >
              <div className='space-y-12'>
                <MetricsVisualPrimer visuals={metricsGuideQuickVisuals} />

                <div className='space-y-6 pt-4'>
                  <h3 className='border-b border-border/60 pb-2 text-xl font-semibold text-foreground/90'>
                    Codebase Signals
                  </h3>
                  <div className='space-y-0'>
                    {codebaseSignals.map((metric) => (
                      <MetricGuideCard key={metric.id} metric={metric} />
                    ))}
                  </div>
                </div>

                <div className='mt-12 space-y-6'>
                  <h3 className='border-b border-border/60 pb-2 text-xl font-semibold text-foreground/90'>
                    Impact Estimates
                  </h3>
                  <div className='space-y-0'>
                    {impactEstimates.map((metric) => (
                      <MetricGuideCard key={metric.id} metric={metric} />
                    ))}
                  </div>
                </div>

                <div className='mt-12 space-y-6'>
                  <h3 className='border-b border-border/60 pb-2 text-xl font-semibold text-foreground/90'>
                    Review Priorities
                  </h3>
                  <div className='space-y-0'>
                    {reviewPriorities.map((metric) => (
                      <MetricGuideCard key={metric.id} metric={metric} />
                    ))}
                  </div>
                </div>
              </div>
            </MetricsGuideSection>

            <MetricsGuideSection
              id='decision-matrix'
              eyebrow='3. Prioritization'
              title='How the App Sets Priorities'
              description='The app uses a 2x2 matrix of activity versus structural impact to recommend where you should look first.'
            >
              <DecisionMatrixGuide quadrants={metricsGuideDecisionQuadrants} />
            </MetricsGuideSection>

            <MetricsGuideSection
              id='which-screen'
              eyebrow='4. Workflow'
              title='Which Screen Should I Use?'
              description='Each screen answers a different question. Pick the one that matches what you need to know.'
            >
              <ScreenUsageGuide screens={metricsGuideScreenHelp} />
            </MetricsGuideSection>

            <MetricsGuideSection
              id='caveats-terms'
              eyebrow='5. Appendix'
              title='Caveats and Terms'
              description='Keep these in mind before making decisions, and use the glossary for quick definitions.'
            >
              <div className='space-y-8'>
                <Card className='border-status-caution-border/40 bg-status-caution-surface/30'>
                  <CardHeader className='pb-3'>
                    <CardTitle className='flex items-center gap-2 text-base'>
                      <AlertTriangle className='h-4 w-4 text-status-caution-foreground' />
                      Important Caveats
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className='space-y-3 text-sm text-foreground/90'>
                      {metricsGuideCaveats.map((item, idx) => (
                        <li key={idx} className='flex items-start gap-2.5'>
                          <span className='mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-status-caution-foreground/60' />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <div className='space-y-4 pt-4'>
                  <h4 className='text-base font-semibold'>Glossary</h4>
                  <dl className='grid gap-6 sm:grid-cols-2'>
                    {metricsGuideGlossary.map((item) => (
                      <div
                        key={item.term}
                        className='rounded-xl border border-border/40 bg-muted/10 p-4'
                      >
                        <dt className='mb-1.5 text-sm font-semibold'>
                          {item.term}
                        </dt>
                        <dd className='mb-2 text-sm text-muted-foreground'>
                          {item.definition}
                        </dd>
                        <dd className='text-sm italic text-foreground/90'>
                          {item.practicalMeaning}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </MetricsGuideSection>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
