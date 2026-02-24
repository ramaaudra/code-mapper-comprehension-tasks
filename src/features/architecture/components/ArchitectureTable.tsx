import { useMemo, useState } from 'react'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/shared/components/ui/collapsible'
import { CaretDown, CaretRight, CaretUp } from '@/shared/components/ui/icons'
import { Skeleton } from '@/shared/components/ui/skeleton'
import {
  calculateRiskScore,
  getRiskColorClass,
  getRiskLevel
} from '@/shared/lib/utils/risk'

import { useFolderDetail } from '../hooks/useArchitectureMetrics'
import type {
  FolderArchitectureMetrics,
  SortConfig,
  SortKey
} from '../types/architecture'
import { CycleBadge } from './CycleBadge'
import { InstabilityBadge } from './InstabilityBadge'

interface Column {
  key: SortKey
  label: string
  className: string
}

const columns: Column[] = [
  { key: 'folderPath', label: 'Module', className: 'text-left' },
  { key: 'ca', label: 'Ca (Fan-in)', className: 'text-center w-24' },
  { key: 'ce', label: 'Ce (Fan-out)', className: 'text-center w-24' },
  { key: 'instability', label: 'Instability', className: 'text-center w-32' },
  { key: 'riskScore', label: 'Risk Score', className: 'text-center w-32' }
]

interface ArchitectureTableProps {
  folders: FolderArchitectureMetrics[]
  sortConfig: SortConfig
  onSort: (key: SortKey) => void
}

function ExpandedRow({ folderPath }: { folderPath: string }) {
  const { data, isLoading } = useFolderDetail(folderPath)

  if (isLoading) {
    return (
      <div className="px-8 py-4 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    )
  }

  if (!data?.files || data.files.length === 0) {
    return (
      <div className="px-8 py-4 text-sm text-muted-foreground">
        No files in this module
      </div>
    )
  }

  return (
    <div className="px-8 py-4 bg-muted/30">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-muted-foreground">
            <th className="text-left py-2 font-medium">File</th>
            <th className="text-center py-2 font-medium w-20">Ca</th>
            <th className="text-center py-2 font-medium w-20">Ce</th>
            <th className="text-center py-2 font-medium w-32">Instability</th>
          </tr>
        </thead>
        <tbody>
          {data.files.map((file) => (
            <tr key={file.filePath} className="border-t border-border/30">
              <td
                className="py-2 font-mono text-xs truncate max-w-xs"
                title={file.filePath}
              >
                {file.filePath.split('/').pop()}
              </td>
              <td className="py-2 text-center">{file.ca}</td>
              <td className="py-2 text-center">{file.ce}</td>
              <td className="py-2">
                <div className="flex items-center gap-2 justify-center">
                  <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-600"
                      style={{ width: `${file.instability * 100}%` }}
                    />
                  </div>
                  <span className="text-xs w-8 text-slate-400">
                    {file.instability.toFixed(2)}
                  </span>
                </div>
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
  onSort
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
   * Get color class for Risk Score dot based on risk level.
   * Uses same scheme as HighRiskModules panel.
   */
  const getRiskDotColor = (score: number) => {
    const level = getRiskLevel(score)
    return getRiskColorClass(level)
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-background border-b border-border z-10">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 cursor-pointer hover:bg-muted/50 text-muted-foreground font-medium select-none ${col.className}`}
                onClick={() => onSort(col.key)}
              >
                <span className="inline-flex items-center gap-1.5">
                  {col.label}
                  {sortConfig.key === col.key && (
                    <span className="text-foreground">
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
                    <tr className="border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors">
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-2">
                          {isExpanded ? (
                            <CaretDown
                              size={14}
                              className="shrink-0 text-muted-foreground"
                            />
                          ) : (
                            <CaretRight
                              size={14}
                              className="shrink-0 text-muted-foreground"
                            />
                          )}
                          <span
                            className="font-mono truncate"
                            title={folder.folderPath}
                          >
                            {folder.folderPath}
                          </span>
                          {folder.hasCycle && <CycleBadge />}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-mono">
                        {folder.ca}
                      </td>
                      <td className="px-4 py-3 text-center font-mono">
                        {folder.ce}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${getInstabilityBarColor()}`}
                              style={{ width: `${folder.instability * 100}%` }}
                            />
                          </div>
                          <InstabilityBadge value={folder.instability} />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {(() => {
                          const riskScore = calculateRiskScore(
                            folder.ca,
                            folder.instability
                          )
                          return (
                            <div className="flex items-center justify-center gap-2">
                              <span className="font-mono text-sm">
                                {riskScore.toFixed(1)}
                              </span>
                              <span
                                className={`w-2.5 h-2.5 rounded-full ${getRiskDotColor(riskScore)}`}
                                title={`Risk Score: ${riskScore.toFixed(1)}`}
                              />
                            </div>
                          )
                        })()}
                      </td>
                    </tr>
                  </CollapsibleTrigger>
                  <CollapsibleContent asChild>
                    <tr>
                      <td colSpan={5} className="p-0">
                        <ExpandedRow folderPath={folder.folderPath} />
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
