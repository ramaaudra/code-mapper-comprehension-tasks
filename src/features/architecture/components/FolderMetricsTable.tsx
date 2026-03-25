import { useMemo } from 'react'

import { CaretDown, CaretUp } from '@/shared/components/ui/icons'
import { METRIC_LABELS } from '@/shared/lib/metric-copy'
import { calculateRiskScore } from '@/shared/lib/utils/risk'

import { FolderMetricsRow } from './FolderMetricsRow'

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
  { key: 'folderPath', label: 'Module', className: 'text-left' },
  {
    key: 'ca',
    label: METRIC_LABELS.dependentsCa,
    className: 'text-center w-24'
  },
  {
    key: 'ce',
    label: METRIC_LABELS.dependenciesCe,
    className: 'text-center w-24'
  },
  {
    key: 'instability',
    label: METRIC_LABELS.instability,
    className: 'text-center w-20'
  },
  {
    key: 'riskScore',
    label: METRIC_LABELS.propagationRisk,
    className: 'text-center w-24'
  }
]

interface FolderMetricsTableProps {
  folders: FolderArchitectureMetrics[]
  sortConfig: SortConfig
  onSort: (key: SortKey) => void
  thresholdCalibration?: ReviewThresholdCalibration
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

export function FolderMetricsTable({
  folders,
  sortConfig,
  onSort,
  thresholdCalibration
}: FolderMetricsTableProps) {
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

  const handleSort = (key: SortKey) => {
    onSort(key)
  }

  return (
    <table className='w-full text-xs'>
      <thead className='sticky top-0 z-10 border-b border-border bg-background'>
        <tr>
          {columns.map((col) => (
            <th
              key={col.key}
              scope='col'
              aria-sort={resolveAriaSort(col.key, sortConfig)}
              className={`px-3 py-2 font-medium text-muted-foreground ${col.className}`}
            >
              <button
                type='button'
                onClick={() => handleSort(col.key)}
                className={`inline-flex w-full items-center gap-1 rounded-md px-2 py-2 text-inherit transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  col.key === 'folderPath'
                    ? 'justify-start text-left'
                    : 'justify-center text-center'
                }`}
              >
                {col.label}
                {sortConfig.key === col.key && (
                  <span className='text-foreground'>
                    {sortConfig.direction === 'asc' ? (
                      <CaretUp size={12} />
                    ) : (
                      <CaretDown size={12} />
                    )}
                  </span>
                )}
              </button>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sortedFolders.map((folder) => (
          <FolderMetricsRow
            key={folder.folderPath}
            folder={folder}
            thresholdCalibration={thresholdCalibration}
          />
        ))}
      </tbody>
    </table>
  )
}
