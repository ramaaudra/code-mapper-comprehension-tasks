import { useState } from 'react'

import { Skeleton } from '@/shared/components/ui/skeleton'

import { architectureCopy } from '../content/architectureCopy'
import { useArchitectureFolders } from '../hooks/useArchitectureMetrics'
import { useModuleReviewThresholdCalibration } from '../hooks/useReviewThresholdCalibration'
import { FolderMetricsTable } from './FolderMetricsTable'

import type {
  FolderArchitectureMetrics,
  SortConfig,
  SortKey
} from '../types/architecture'

function ArchitectureSkeleton() {
  return (
    <div className='space-y-3 p-4'>
      <Skeleton className='h-4 w-32' />
      <Skeleton className='h-8 w-full' />
      <Skeleton className='h-8 w-full' />
      <Skeleton className='h-8 w-full' />
      <Skeleton className='h-8 w-full' />
    </div>
  )
}

export function ArchitectureTab() {
  const { data, isLoading, error } = useArchitectureFolders()
  const moduleThresholdCalibration = useModuleReviewThresholdCalibration()
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'riskScore',
    direction: 'desc' // Default: show highest risk first (Ca × I formula)
  })

  const handleSort = (key: SortKey) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }))
  }

  if (isLoading) {
    return <ArchitectureSkeleton />
  }

  if (error) {
    return (
      <div className='p-4 text-center text-muted-foreground'>
        <p className='text-sm'>Failed to load architecture data</p>
        <p className='mt-1 text-xs'>{(error as Error).message}</p>
      </div>
    )
  }

  if (!data || data.folders.length === 0) {
    return (
      <div className='p-4 text-center text-muted-foreground'>
        <p className='text-sm'>{architectureCopy.tab.empty}</p>
      </div>
    )
  }

  // Calculate summary stats
  const totalFolders = data.folders.length
  const foldersWithCycles = data.folders.filter(
    (f: FolderArchitectureMetrics) => f.hasCycle
  ).length
  const avgInstability =
    data.folders.reduce(
      (sum: number, f: FolderArchitectureMetrics) => sum + f.instability,
      0
    ) / totalFolders

  return (
    <div className='flex h-full flex-col'>
      {/* Header dengan summary stats */}
      <div className='shrink-0 border-b border-border p-4'>
        <h2 className='text-sm font-medium text-foreground'>
          {architectureCopy.tab.title}
        </h2>
        <div className='mt-2 flex items-center gap-4 text-xs text-muted-foreground'>
          <span>{totalFolders} modules</span>
          <span>
            {architectureCopy.tab.averageInstabilityLabel}:{' '}
            {avgInstability.toFixed(2)}
          </span>
          {foldersWithCycles > 0 && (
            <span className='rounded-md border border-status-critical-border bg-status-critical-surface px-2 py-0.5 text-status-critical-foreground'>
              {architectureCopy.tab.modulesInCycles(foldersWithCycles)}
            </span>
          )}
        </div>
      </div>

      {/* Tabel utama */}
      <div className='flex-1 overflow-auto'>
        <FolderMetricsTable
          folders={data.folders}
          sortConfig={sortConfig}
          onSort={handleSort}
          thresholdCalibration={moduleThresholdCalibration}
        />
      </div>
    </div>
  )
}
