import { useMemo } from 'react'

import { CaretDown, CaretUp } from '@/shared/components/ui/icons'
import { calculateRiskScore } from '@/shared/lib/utils/risk'

import type {
  FolderArchitectureMetrics,
  SortConfig,
  SortKey
} from '../types/architecture'
import { FolderMetricsRow } from './FolderMetricsRow'

interface Column {
  key: SortKey
  label: string
  className: string
}

const columns: Column[] = [
  { key: 'folderPath', label: 'Module', className: 'text-left' },
  { key: 'ca', label: 'Ca', className: 'text-center w-14' },
  { key: 'ce', label: 'Ce', className: 'text-center w-14' },
  { key: 'instability', label: 'I', className: 'text-center w-20' },
  { key: 'riskScore', label: 'Risk', className: 'text-center w-20' }
]

interface FolderMetricsTableProps {
  folders: FolderArchitectureMetrics[]
  sortConfig: SortConfig
  onSort: (key: SortKey) => void
}

export function FolderMetricsTable({
  folders,
  sortConfig,
  onSort
}: FolderMetricsTableProps) {
  const sortedFolders = useMemo(() => {
    return [...folders].sort((a, b) => {
      // Handle riskScore as computed field
      if (sortConfig.key === 'riskScore') {
        const aRisk = calculateRiskScore(a.ca, a.instability)
        const bRisk = calculateRiskScore(b.ca, b.instability)
        return sortConfig.direction === 'asc' ? aRisk - bRisk : bRisk - aRisk
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
    <table className="w-full text-xs">
      <thead className="sticky top-0 bg-background border-b border-border z-10">
        <tr>
          {columns.map((col) => (
            <th
              key={col.key}
              className={`px-3 py-2 cursor-pointer hover:bg-muted/50 text-muted-foreground font-medium select-none ${col.className}`}
              onClick={() => handleSort(col.key)}
            >
              <span className="inline-flex items-center gap-1">
                {col.label}
                {sortConfig.key === col.key && (
                  <span className="text-foreground">
                    {sortConfig.direction === 'asc' ? (
                      <CaretUp size={12} />
                    ) : (
                      <CaretDown size={12} />
                    )}
                  </span>
                )}
              </span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sortedFolders.map((folder) => (
          <FolderMetricsRow key={folder.folderPath} folder={folder} />
        ))}
      </tbody>
    </table>
  )
}
