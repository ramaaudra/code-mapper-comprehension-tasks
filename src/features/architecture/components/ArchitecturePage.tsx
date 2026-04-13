import { useState } from 'react'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/shared/components/ui/card'
import {
  AlertTriangle,
  FolderTree,
  Layers,
  TrendingUp,
  Wind
} from '@/shared/components/ui/icons'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useAnalysisData } from '@/shared/hooks/useAnalysisData'
import {
  formatReviewSignalBandRange,
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
import { ArchitectureReadingGuideSection } from './ArchitectureReadingGuideSection'
import { ArchitectureReviewToolbar } from './ArchitectureReviewToolbar'
import {
  ArchitectureSummarySection,
  type ArchitectureSummaryCard
} from './ArchitectureSummarySection'
import { ArchitectureTable } from './ArchitectureTable'

import type {
  FolderArchitectureMetrics,
  SortConfig,
  SortKey
} from '../types/architecture'

interface ArchitecturePageProps {
  onShowMetricsGuide?: () => void
  onNavigateToFile?: (filePath: string) => void
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
  onShowMetricsGuide,
  onNavigateToFile
}: ArchitecturePageProps) {
  const { data, isLoading, error } = useArchitectureFolders()
  const { evolutionarySummary } = useAnalysisData()
  const moduleThresholdCalibration = useModuleReviewThresholdCalibration()
  const [searchQuery, setSearchQuery] = useState('')
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'riskScore',
    direction: 'desc'
  })

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
          <AlertTriangle className='mx-auto mb-4 h-12 w-12 text-status-critical-foreground' />
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

  const summaryCards: ArchitectureSummaryCard[] = [
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

        <ArchitectureSummarySection
          title={architectureCopy.page.summaryTitle}
          description={architectureCopy.page.summaryDescription}
          cards={summaryCards}
        />

        <ArchitectureReadingGuideSection
          onShowMetricsGuide={onShowMetricsGuide}
        />

        <ArchitectureReviewToolbar
          searchQuery={searchQuery}
          totalModules={totalModules}
          filteredFoldersCount={filteredFolders.length}
          onSearchQueryChange={setSearchQuery}
        />

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
              onNavigateToFile={onNavigateToFile}
              thresholdCalibration={moduleThresholdCalibration}
              evolutionaryMetricsAvailable={changeHistoryAvailable}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
