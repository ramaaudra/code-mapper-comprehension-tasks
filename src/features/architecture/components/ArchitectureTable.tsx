import { Fragment, useMemo, useState } from 'react'

import { HotspotStatusLabel } from '@/shared/components/ui/hotspot-status-label'
import { CaretDown, CaretRight, CaretUp } from '@/shared/components/ui/icons'
import { Skeleton } from '@/shared/components/ui/skeleton'
import {
  getStructuralPositionBandLabel,
  resolveStructuralPosition
} from '@/shared/lib/metric-thresholds'
import {
  calculateRiskScore,
  getRiskColorClass,
  getRiskLevel
} from '@/shared/lib/utils/risk'

import { architectureCopy } from '../content/architectureCopy'
import { useFolderDetail } from '../hooks/useArchitectureMetrics'
import { CycleBadge } from './CycleBadge'
import { ExpandedModuleReviewPanel } from './ExpandedModuleReviewPanel'
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
    className: 'min-w-[18rem] text-left'
  },
  {
    key: 'ca',
    label: architectureCopy.table.columns.usedBy,
    className: 'min-w-[5rem] text-center'
  },
  {
    key: 'ce',
    label: architectureCopy.table.columns.imports,
    className: 'min-w-[5rem] text-center'
  },
  {
    key: 'instability',
    label: architectureCopy.table.columns.structuralPosition,
    className: 'min-w-[8.5rem] text-center'
  },
  {
    key: 'riskScore',
    label: architectureCopy.table.columns.spreadRisk,
    className: 'min-w-[8rem] text-center'
  },
  {
    key: 'hotspotScore',
    label: architectureCopy.table.columns.hotspotPriority,
    className: 'min-w-[9rem] text-center'
  }
]

interface ArchitectureTableProps {
  folders: FolderArchitectureMetrics[]
  sortConfig: SortConfig
  onSort: (key: SortKey) => void
  onNavigateToFile?: (filePath: string) => void
  thresholdCalibration?: ReviewThresholdCalibration
  evolutionaryMetricsAvailable?: boolean
}

function createDetailsId(folderPath: string): string {
  const normalizedPath = folderPath
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return `architecture-folder-details-${normalizedPath || 'module'}`
}

function resolveAriaSort(
  columnKey: SortKey,
  sortConfig: SortConfig
): 'ascending' | 'descending' | 'none' {
  if (sortConfig.key !== columnKey) {
    return 'none'
  }

  return sortConfig.direction === 'asc' ? 'ascending' : 'descending'
}

function getHotspotLabel(
  status: NonNullable<FolderArchitectureMetrics['evolution']>['hotspotStatus']
): string {
  const labels = {
    'critical-hotspot': 'Highest band',
    'high-review-needed': 'Needs review',
    active: 'Recently active',
    stable: 'Stable'
  } as const

  return labels[status]
}

function getRiskDotColor(
  score: number,
  thresholdCalibration?: ReviewThresholdCalibration
): string {
  const level = getRiskLevel(score, thresholdCalibration)
  return getRiskColorClass(level)
}

const instabilityBarClass = 'bg-muted-foreground/50'

function getToggleLabel(folderPath: string, hasCycle: boolean): string {
  if (!hasCycle) {
    return `Toggle file breakdown for ${folderPath}`
  }

  return `Toggle file breakdown for ${folderPath}. This module is involved in a circular dependency.`
}

function ExpandedRow({
  folderPath,
  onNavigateToFile: _onNavigateToFile,
  evolutionaryMetricsAvailable = true
}: {
  folderPath: string
  onNavigateToFile?: (filePath: string) => void
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
    <ExpandedModuleReviewPanel
      folder={data.folder}
      files={data.files}
      onNavigateToFile={_onNavigateToFile}
      evolutionaryMetricsAvailable={evolutionaryMetricsAvailable}
    />
  )
}

export function ArchitectureTable({
  folders,
  sortConfig,
  onSort,
  onNavigateToFile,
  thresholdCalibration,
  evolutionaryMetricsAvailable = true
}: ArchitectureTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const getAriaSort = (columnKey: SortKey) =>
    resolveAriaSort(columnKey, sortConfig)

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

  return (
    <div className='overflow-x-auto'>
      <table className='w-full min-w-[760px] text-sm'>
        <thead className='sticky top-0 z-10 border-b border-border bg-background'>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope='col'
                aria-sort={getAriaSort(col.key)}
                className={`px-4 py-3 font-medium text-muted-foreground ${col.className}`}
              >
                <button
                  type='button'
                  onClick={() => onSort(col.key)}
                  className={`inline-flex w-full items-center gap-1.5 rounded-md px-2 py-2 text-inherit transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    col.key === 'folderPath'
                      ? 'justify-start text-left'
                      : 'justify-center text-center'
                  }`}
                >
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
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedFolders.map((folder) => {
            const isExpanded = expandedRows.has(folder.folderPath)
            const detailsId = createDetailsId(folder.folderPath)
            const riskScore = calculateRiskScore(folder.ca, folder.instability)
            const folderStructuralRole = resolveStructuralPosition(
              folder.instability
            )
            const folderStructuralRoleLabel =
              getStructuralPositionBandLabel(folderStructuralRole)

            return (
              <Fragment key={folder.folderPath}>
                <tr
                  className={`border-b border-border/50 align-top transition-colors ${
                    isExpanded ? 'bg-muted/20' : 'hover:bg-muted/20'
                  }`}
                >
                  <td className='px-4 py-3'>
                    <div className='flex min-w-0 items-start gap-2'>
                      <button
                        type='button'
                        onClick={() => toggleRow(folder.folderPath)}
                        aria-label={getToggleLabel(
                          folder.folderPath,
                          folder.hasCycle
                        )}
                        aria-expanded={isExpanded}
                        aria-controls={detailsId}
                        className='flex min-w-0 flex-1 items-start gap-2 rounded-md text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                      >
                        {isExpanded ? (
                          <CaretDown
                            size={14}
                            className='mt-0.5 shrink-0 text-muted-foreground'
                          />
                        ) : (
                          <CaretRight
                            size={14}
                            className='mt-0.5 shrink-0 text-muted-foreground'
                          />
                        )}
                        <span
                          className='min-w-0 truncate font-mono'
                          title={folder.folderPath}
                        >
                          {folder.folderPath}
                        </span>
                      </button>
                      {folder.hasCycle ? <CycleBadge /> : null}
                    </div>
                  </td>
                  <td className='px-4 py-3 text-center font-data'>
                    {folder.ca}
                  </td>
                  <td className='px-4 py-3 text-center font-data'>
                    {folder.ce}
                  </td>
                  <td className='px-4 py-3'>
                    <div className='flex flex-col items-center gap-1.5'>
                      <div className='flex items-center justify-center gap-2'>
                        <div className='h-1.5 w-16 overflow-hidden rounded-full bg-border/70'>
                          <div
                            className={`h-full ${instabilityBarClass}`}
                            style={{ width: `${folder.instability * 100}%` }}
                          />
                        </div>
                        <InstabilityBadge value={folder.instability} />
                      </div>
                      <span className='text-[11px] font-medium text-muted-foreground'>
                        {folderStructuralRoleLabel}
                      </span>
                    </div>
                  </td>
                  <td className='px-4 py-3'>
                    <div className='flex items-center justify-center gap-2'>
                      <span className='font-data text-sm'>
                        {riskScore.toFixed(1)}
                      </span>
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${getRiskDotColor(
                          riskScore,
                          thresholdCalibration
                        )}`}
                        title={`Propagation Risk: ${riskScore.toFixed(1)}`}
                      />
                    </div>
                  </td>
                  <td className='px-4 py-3 text-center font-data text-xs'>
                    {folder.evolution && evolutionaryMetricsAvailable ? (
                      <div className='flex flex-col items-center gap-1'>
                        <span>{folder.evolution.hotspotScore.toFixed(2)}</span>
                        {folder.evolution.hotspotStatus !== 'stable' ? (
                          <HotspotStatusLabel
                            status={folder.evolution.hotspotStatus}
                            labelOverride={getHotspotLabel(
                              folder.evolution.hotspotStatus
                            )}
                            className='text-xs text-muted-foreground'
                          />
                        ) : (
                          <span className='sr-only'>
                            Stable hotspot baseline
                          </span>
                        )}
                      </div>
                    ) : (
                      'Unavailable'
                    )}
                  </td>
                </tr>
                {isExpanded ? (
                  <tr>
                    <td colSpan={6} className='p-0'>
                      <div id={detailsId}>
                        <ExpandedRow
                          folderPath={folder.folderPath}
                          onNavigateToFile={onNavigateToFile}
                          evolutionaryMetricsAvailable={
                            evolutionaryMetricsAvailable
                          }
                        />
                      </div>
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
