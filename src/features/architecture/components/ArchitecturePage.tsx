import { useState } from 'react'

import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/shared/components/ui/card'
import {
  AlertTriangle,
  CaretDown,
  CaretRight,
  FolderTree,
  Layers,
  Lightbulb,
  Search,
  ShieldCheck,
  TrendingUp,
  Wind
} from '@/shared/components/ui/icons'
import { Input } from '@/shared/components/ui/input'
import { MetricCard } from '@/shared/components/ui/metric-card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useAnalysisData } from '@/shared/hooks/useAnalysisData'
import {
  formatReviewSignalBandRange,
  getStructuralPositionBandLabel,
  resolveStructuralPosition
} from '@/shared/lib/metric-thresholds'
import {
  isEvolutionaryMetricsAvailable,
  summarizeEvolutionAvailability
} from '@/shared/lib/utils'

import { architectureCopy } from '../content/architectureCopy'
import { useArchitectureFolders } from '../hooks/useArchitectureMetrics'
import { useModuleReviewThresholdCalibration } from '../hooks/useReviewThresholdCalibration'
import { describeStructuralPositionStory } from '../lib/structural-position-story'
import { ArchitectureTable } from './ArchitectureTable'

import type {
  FolderArchitectureMetrics,
  SortConfig,
  SortKey
} from '../types/architecture'

interface ArchitecturePageProps {
  onShowMetricsGuide?: () => void
}

function ArchitecturePageSkeleton() {
  const skeletonIds = [
    'summary-total',
    'summary-structure',
    'summary-outward',
    'summary-cycles'
  ] as const

  return (
    <div className='h-full overflow-y-auto bg-background'>
      <div className='mx-auto max-w-full space-y-6 px-6 py-6 md:px-8 lg:px-12'>
        <Skeleton className='h-8 w-64' />
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {skeletonIds.map((skeletonId) => (
            <Skeleton key={skeletonId} className='h-24' />
          ))}
        </div>
        <Skeleton className='h-96' />
      </div>
    </div>
  )
}

export function ArchitecturePage({
  onShowMetricsGuide
}: ArchitecturePageProps) {
  const { data, isLoading, error } = useArchitectureFolders()
  const { evolutionarySummary } = useAnalysisData()
  const moduleThresholdCalibration = useModuleReviewThresholdCalibration()
  const [searchQuery, setSearchQuery] = useState('')
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'riskScore',
    direction: 'desc'
  })
  const [isReadingGuideExpanded, setIsReadingGuideExpanded] = useState(false)

  const handleSort = (key: SortKey) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }))
  }

  if (isLoading) {
    return <ArchitecturePageSkeleton />
  }

  if (error) {
    return (
      <div className='flex h-full items-center justify-center bg-background'>
        <div className='text-center'>
          <AlertTriangle className='mx-auto mb-4 h-12 w-12 text-destructive' />
          <h2 className='mb-2 text-lg font-semibold'>
            {architectureCopy.page.errorTitle}
          </h2>
          <p className='text-sm text-muted-foreground'>
            {(error as Error).message}
          </p>
        </div>
      </div>
    )
  }

  if (!data || data.folders.length === 0) {
    return (
      <div className='flex h-full items-center justify-center bg-background'>
        <div className='text-center'>
          <Layers className='mx-auto mb-4 h-12 w-12 text-muted-foreground' />
          <h2 className='mb-2 text-lg font-semibold'>
            {architectureCopy.page.emptyTitle}
          </h2>
          <p className='text-sm text-muted-foreground'>
            {architectureCopy.page.emptyDescription}
          </p>
        </div>
      </div>
    )
  }

  const folders = data.folders as FolderArchitectureMetrics[]

  // Calculate summary stats
  const totalModules = folders.length
  const totalFiles = folders.reduce((sum, f) => sum + f.fileCount, 0)
  const avgInstability =
    folders.reduce((sum, f) => sum + f.instability, 0) / totalModules
  const modulesWithCycles = folders.filter((f) => f.hasCycle).length
  const unstableModules = folders.filter(
    (f) => resolveStructuralPosition(f.instability) === 'Outward-Dependent'
  ).length
  const hotspotModules = folders.filter(
    (f) => f.evolution?.hotspotStatus === 'critical-hotspot'
  ).length
  const evolutionAvailability =
    summarizeEvolutionAvailability(evolutionarySummary)
  const changeHistoryAvailable =
    isEvolutionaryMetricsAvailable(evolutionarySummary)
  const averageStructuralStory = describeStructuralPositionStory(avgInstability)
  const outwardFacingRange = formatReviewSignalBandRange(
    'structuralPosition',
    'Outward-Dependent'
  )

  // Filter folders by search query
  const filteredFolders = folders.filter((f) =>
    f.folderPath.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const summaryCards: Array<{
    label: string
    value: number | string
    subValue: string
    icon: React.ReactNode
  }> = [
    {
      label: architectureCopy.summaryCards.totalModules,
      value: totalModules,
      subValue: `${totalFiles} files`,
      icon: <FolderTree className='h-4 w-4' />
    },
    {
      label: architectureCopy.summaryCards.averageStructuralPosition,
      value: avgInstability.toFixed(2),
      subValue: averageStructuralStory.summaryLabel,
      icon: <TrendingUp className='h-4 w-4' />
    },
    {
      label: architectureCopy.summaryCards.outwardFacingModules,
      value: unstableModules,
      subValue:
        unstableModules > 0
          ? `Modules in the ${outwardFacingRange} instability band`
          : `No modules in the ${outwardFacingRange} instability band`,
      icon: <Wind className='h-4 w-4' />
    },
    {
      label: architectureCopy.summaryCards.modulesInCycles,
      value: modulesWithCycles,
      subValue:
        modulesWithCycles > 0
          ? 'Circular dependencies detected'
          : 'No circular dependencies',
      icon: <AlertTriangle className='h-4 w-4' />
    },
    {
      label: architectureCopy.summaryCards.criticalReviewAreas,
      value: changeHistoryAvailable ? hotspotModules : 'Unavailable',
      subValue: changeHistoryAvailable
        ? hotspotModules > 0
          ? 'Recent change pressure plus high propagation sensitivity'
          : 'No critical hotspot areas detected'
        : evolutionAvailability.message,
      icon: <TrendingUp className='h-4 w-4' />
    }
  ]

  return (
    <div className='h-full overflow-y-auto bg-background'>
      <div className='mx-auto max-w-full space-y-6 px-6 py-6 pb-12 md:px-8 lg:px-12'>
        {/* Header */}
        <div className='space-y-2'>
          <h1 className='text-2xl font-semibold text-foreground'>
            {architectureCopy.page.title}
          </h1>
          <p className='text-sm text-muted-foreground'>
            {architectureCopy.page.description}
          </p>
        </div>

        <section
          aria-labelledby='architecture-summary-heading'
          className='space-y-3'
        >
          <div className='space-y-1'>
            <h2
              id='architecture-summary-heading'
              className='text-sm font-medium tracking-label text-muted-foreground'
            >
              {architectureCopy.page.summaryTitle}
            </h2>
            <p className='max-w-3xl text-sm text-muted-foreground'>
              {architectureCopy.page.summaryDescription}
            </p>
          </div>
          <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-5'>
            {summaryCards.map(({ label, value, subValue, icon }) => (
              <MetricCard
                key={label}
                label={label}
                value={value}
                subValue={subValue}
                icon={icon}
                variant='minimal'
              />
            ))}
          </div>
        </section>

        {/* Reading Guide: Instability Education Card */}
        <section
          aria-labelledby='architecture-reading-guide-heading'
          className='rounded-xl border border-border/60 bg-muted/20'
        >
          {isReadingGuideExpanded ? (
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
                      band as a defect. In dependency metrics, instability
                      describes a module&apos;s structural position in the
                      dependency graph, not code quality or direct propagation
                      risk. Use <strong>Propagation Risk</strong> to estimate
                      how strongly a modification may propagate.
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
                      setIsReadingGuideExpanded(false)
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
                    Common in: shared foundations, domain logic, configuration,
                    and utility layers
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
                    At this extreme, outgoing cross-module dependency edges
                    dominate while incoming ones are limited. These modules are
                    often easier to replace or refactor.
                  </p>
                  <p className='mt-2 text-xs font-medium text-foreground'>
                    Common in: presentation layers, route modules, UI shells,
                    and adapters
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
                    setIsReadingGuideExpanded(true)
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

        {/* Search & Filter */}
        <div className='flex flex-wrap items-center gap-4'>
          <div className='max-w-sm flex-1 space-y-2'>
            <label
              htmlFor='architecture-module-search'
              className='block text-xs font-medium tracking-label text-muted-foreground'
            >
              {architectureCopy.page.searchLabel}
            </label>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                id='architecture-module-search'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={architectureCopy.page.searchPlaceholder}
                aria-describedby='architecture-triage-count'
                className='pl-9'
              />
            </div>
          </div>
          <Badge
            id='architecture-triage-count'
            variant='outline'
            className='text-xs'
          >
            {filteredFolders.length} of {totalModules} modules
          </Badge>
        </div>

        <p className='text-sm text-muted-foreground'>
          {architectureCopy.page.triageCue}
        </p>

        {/* Main Table */}
        <Card>
          <CardHeader className='pb-3'>
            <div className='space-y-1'>
              <CardTitle className='text-base font-medium'>
                {architectureCopy.table.title}
              </CardTitle>
              <p className='text-sm text-muted-foreground'>
                {architectureCopy.table.description}
              </p>
            </div>
          </CardHeader>
          <CardContent className='p-0'>
            <ArchitectureTable
              folders={filteredFolders}
              sortConfig={sortConfig}
              onSort={handleSort}
              thresholdCalibration={moduleThresholdCalibration}
              evolutionaryMetricsAvailable={changeHistoryAvailable}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
