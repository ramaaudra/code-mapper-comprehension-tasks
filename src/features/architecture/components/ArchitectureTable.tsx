import { useMemo, useState } from 'react'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/shared/components/ui/collapsible'
import { HotspotStatusLabel } from '@/shared/components/ui/hotspot-status-label'
import { CaretDown, CaretRight, CaretUp } from '@/shared/components/ui/icons'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { formatRelativeChurn } from '@/shared/lib/utils'
import {
  calculateRiskScore,
  getRiskColorClass,
  getRiskLevel
} from '@/shared/lib/utils/risk'

import { architectureCopy } from '../content/architectureCopy'
import { useFolderDetail } from '../hooks/useArchitectureMetrics'
import { CycleBadge } from './CycleBadge'
import { InstabilityBadge } from './InstabilityBadge'

import type {
  FolderArchitectureMetrics,
  SortConfig,
  SortKey
} from '../types/architecture'
import type { ReviewThresholdCalibration } from '@/shared/lib/metric-thresholds'

interface Column {
  key: SortKey
  label: string
  className: string
}

const columns: Column[] = [
  {
    key: 'folderPath',
    label: architectureCopy.table.columns.module,
    className: 'text-left'
  },
  {
    key: 'ca',
    label: architectureCopy.table.columns.usedBy,
    className: 'text-center w-24'
  },
  {
    key: 'ce',
    label: architectureCopy.table.columns.imports,
    className: 'text-center w-24'
  },
  {
    key: 'instability',
    label: architectureCopy.table.columns.structuralPosition,
    className: 'text-center w-32'
  },
  {
    key: 'riskScore',
    label: architectureCopy.table.columns.spreadRisk,
    className: 'text-center w-32'
  },
  {
    key: 'hotspotScore',
    label: architectureCopy.table.columns.hotspotPriority,
    className: 'text-center w-40'
  }
]

interface ArchitectureTableProps {
  folders: FolderArchitectureMetrics[]
  sortConfig: SortConfig
  onSort: (key: SortKey) => void
  thresholdCalibration?: ReviewThresholdCalibration
  evolutionaryMetricsAvailable?: boolean
}

function ExpandedRow({
  folderPath,
  evolutionaryMetricsAvailable = true
}: {
  folderPath: string
  evolutionaryMetricsAvailable?: boolean
}) {
  const { data, isLoading } = useFolderDetail(folderPath)

  if (isLoading) {
    return (
      <div className='space-y-2 px-8 py-4'>
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-3/4' />
        <Skeleton className='h-4 w-1/2' />
      </div>
    )
  }

  if (!data?.files || data.files.length === 0) {
    return (
      <div className='px-8 py-4 text-sm text-muted-foreground'>
        {architectureCopy.table.expanded.empty}
      </div>
    )
  }

  return (
    <div className='bg-muted/30 px-8 py-4'>
      <table className='w-full text-xs'>
        <thead>
          <tr className='text-muted-foreground'>
            <th className='py-2 text-left font-medium'>
              {architectureCopy.table.expanded.file}
            </th>
            <th className='w-20 py-2 text-center font-medium'>
              {architectureCopy.table.expanded.usedBy}
            </th>
            <th className='w-20 py-2 text-center font-medium'>
              {architectureCopy.table.expanded.imports}
            </th>
            <th className='w-32 py-2 text-center font-medium'>
              {architectureCopy.table.expanded.structuralPosition}
            </th>
            <th className='w-28 py-2 text-center font-medium'>
              {architectureCopy.table.expanded.changedIn30d}
            </th>
          </tr>
        </thead>
        <tbody>
          {data.files.map((file) => (
            <tr key={file.filePath} className='border-t border-border/30'>
              <td
                className='max-w-xs truncate py-2 font-mono text-xs'
                title={file.filePath}
              >
                {file.filePath.split('/').pop()}
              </td>
              <td className='py-2 text-center font-data'>{file.ca}</td>
              <td className='py-2 text-center font-data'>{file.ce}</td>
              <td className='py-2'>
                <div className='flex items-center justify-center gap-2'>
                  <div className='h-1.5 w-16 overflow-hidden rounded-full bg-slate-800'>
                    <div
                      className='h-full bg-slate-600'
                      style={{ width: `${file.instability * 100}%` }}
                    />
                  </div>
                  <span className='w-8 font-data text-xs text-slate-400'>
                    {file.instability.toFixed(2)}
                  </span>
                </div>
              </td>
              <td className='py-2 text-center'>
                {file.evolution && evolutionaryMetricsAvailable
                  ? formatRelativeChurn(file.evolution.churn30d.relativeChurn)
                  : 'Unavailable'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function ArchitectureTable({
  folders,
  sortConfig,
  onSort,
  thresholdCalibration,
  evolutionaryMetricsAvailable = true
}: ArchitectureTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const sortedFolders = useMemo(() => {
    return [...folders].sort((a, b) => {
      // Handle riskScore as computed field
      if (sortConfig.key === 'riskScore') {
        const aRisk = calculateRiskScore(a.ca, a.instability)
        const bRisk = calculateRiskScore(b.ca, b.instability)
        return sortConfig.direction === 'asc' ? aRisk - bRisk : bRisk - aRisk
      }

      if (sortConfig.key === 'hotspotScore') {
        const aHotspot = a.evolution?.hotspotScore ?? 0
        const bHotspot = b.evolution?.hotspotScore ?? 0
        return sortConfig.direction === 'asc'
          ? aHotspot - bHotspot
          : bHotspot - aHotspot
      }

      const aVal = a[sortConfig.key]
      const bVal = b[sortConfig.key]

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortConfig.direction === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal
      }

      return 0
    })
  }, [folders, sortConfig])

  const toggleRow = (path: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }

  /**
   * Neutral color for Instability bar.
   * Instability is a structural property, not a danger indicator.
   */
  const getInstabilityBarColor = () => {
    return 'bg-slate-600'
  }

  /**
   * Get color class for propagation-risk dot based on risk level.
   * Uses same scheme as HighRiskModules panel.
   */
  const getRiskDotColor = (score: number) => {
    const level = getRiskLevel(score, thresholdCalibration)
    return getRiskColorClass(level)
  }

  return (
    <div className='overflow-x-auto'>
      <table className='w-full text-sm'>
        <thead className='sticky top-0 z-10 border-b border-border bg-background'>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`cursor-pointer select-none px-4 py-3 font-medium text-muted-foreground hover:bg-muted/50 ${col.className}`}
                onClick={() => onSort(col.key)}
              >
                <span className='inline-flex items-center gap-1.5'>
                  {col.label}
                  {sortConfig.key === col.key && (
                    <span className='text-foreground'>
                      {sortConfig.direction === 'asc' ? (
                        <CaretUp size={14} />
                      ) : (
                        <CaretDown size={14} />
                      )}
                    </span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedFolders.map((folder) => {
            const isExpanded = expandedRows.has(folder.folderPath)

            return (
              <Collapsible
                key={folder.folderPath}
                open={isExpanded}
                onOpenChange={() => toggleRow(folder.folderPath)}
                asChild
              >
                <>
                  <CollapsibleTrigger asChild>
                    <tr className='cursor-pointer border-b border-border/50 transition-colors hover:bg-muted/30'>
                      <td className='px-4 py-3'>
                        <span className='flex items-center gap-2'>
                          {isExpanded ? (
                            <CaretDown
                              size={14}
                              className='shrink-0 text-muted-foreground'
                            />
                          ) : (
                            <CaretRight
                              size={14}
                              className='shrink-0 text-muted-foreground'
                            />
                          )}
                          <span
                            className='truncate font-mono'
                            title={folder.folderPath}
                          >
                            {folder.folderPath}
                          </span>
                          {folder.hasCycle && <CycleBadge />}
                        </span>
                      </td>
                      <td className='px-4 py-3 text-center font-data'>
                        {folder.ca}
                      </td>
                      <td className='px-4 py-3 text-center font-data'>
                        {folder.ce}
                      </td>
                      <td className='px-4 py-3'>
                        <div className='flex items-center justify-center gap-2'>
                          <div className='h-1.5 w-16 overflow-hidden rounded-full bg-slate-800'>
                            <div
                              className={`h-full transition-all ${getInstabilityBarColor()}`}
                              style={{ width: `${folder.instability * 100}%` }}
                            />
                          </div>
                          <InstabilityBadge value={folder.instability} />
                        </div>
                      </td>
                      <td className='px-4 py-3'>
                        {(() => {
                          const riskScore = calculateRiskScore(
                            folder.ca,
                            folder.instability
                          )
                          return (
                            <div className='flex items-center justify-center gap-2'>
                              <span className='font-data text-sm'>
                                {riskScore.toFixed(1)}
                              </span>
                              <span
                                className={`h-2.5 w-2.5 rounded-full ${getRiskDotColor(riskScore)}`}
                                title={`Propagation Risk: ${riskScore.toFixed(1)}`}
                              />
                            </div>
                          )
                        })()}
                      </td>
                      <td className='px-4 py-3 text-center font-data text-xs'>
                        {folder.evolution && evolutionaryMetricsAvailable ? (
                          <div className='flex flex-col items-center gap-1'>
                            <span>
                              {folder.evolution.hotspotScore.toFixed(2)}
                            </span>
                            <HotspotStatusLabel
                              status={folder.evolution.hotspotStatus}
                              className='text-xs text-muted-foreground'
                            />
                          </div>
                        ) : (
                          'Unavailable'
                        )}
                      </td>
                    </tr>
                  </CollapsibleTrigger>
                  <CollapsibleContent asChild>
                    <tr>
                      <td colSpan={6} className='p-0'>
                        <ExpandedRow
                          folderPath={folder.folderPath}
                          evolutionaryMetricsAvailable={
                            evolutionaryMetricsAvailable
                          }
                        />
                      </td>
                    </tr>
                  </CollapsibleContent>
                </>
              </Collapsible>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
