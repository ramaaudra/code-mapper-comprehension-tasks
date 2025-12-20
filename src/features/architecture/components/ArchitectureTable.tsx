import { useMemo, useState } from 'react'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/shared/components/ui/collapsible'
import { CaretDown, CaretRight, CaretUp } from '@/shared/components/ui/icons'
import { Progress } from '@/shared/components/ui/progress'
import { Skeleton } from '@/shared/components/ui/skeleton'

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
  { key: 'fileCount', label: 'Files', className: 'text-center w-20' },
  { key: 'ca', label: 'Ca (Fan-in)', className: 'text-center w-24' },
  { key: 'ce', label: 'Ce (Fan-out)', className: 'text-center w-24' },
  { key: 'instability', label: 'Instability', className: 'text-center w-40' }
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
                  <Progress
                    value={file.instability * 100}
                    className="h-1.5 w-16"
                  />
                  <span className="text-xs w-8">
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

  const getInstabilityColor = (value: number) => {
    if (value >= 0.8) {
      return 'bg-red-500'
    }
    if (value >= 0.6) {
      return 'bg-orange-500'
    }
    if (value >= 0.4) {
      return 'bg-yellow-500'
    }
    return 'bg-green-500'
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
                      <td className="px-4 py-3 text-center text-muted-foreground">
                        {folder.fileCount}
                      </td>
                      <td className="px-4 py-3 text-center font-mono">
                        {folder.ca}
                      </td>
                      <td className="px-4 py-3 text-center font-mono">
                        {folder.ce}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${getInstabilityColor(folder.instability)}`}
                              style={{ width: `${folder.instability * 100}%` }}
                            />
                          </div>
                          <InstabilityBadge value={folder.instability} />
                        </div>
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
