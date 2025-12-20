import { useState } from 'react'

import { Badge } from '@/shared/components/ui/badge'
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
  Search,
  TrendingUp
} from '@/shared/components/ui/icons'
import { Input } from '@/shared/components/ui/input'
import { Skeleton } from '@/shared/components/ui/skeleton'

import { useArchitectureFolders } from '../hooks/useArchitectureMetrics'
import type {
  FolderArchitectureMetrics,
  SortConfig,
  SortKey
} from '../types/architecture'
import { ArchitectureTable } from './ArchitectureTable'

function ArchitecturePageSkeleton() {
  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="max-w-full mx-auto px-6 md:px-8 lg:px-12 py-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    </div>
  )
}

export function ArchitecturePage() {
  const { data, isLoading, error } = useArchitectureFolders()
  const [searchQuery, setSearchQuery] = useState('')
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'instability',
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
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
          <h2 className="text-lg font-semibold mb-2">
            Failed to load architecture data
          </h2>
          <p className="text-sm text-muted-foreground">
            {(error as Error).message}
          </p>
        </div>
      </div>
    )
  }

  if (!data || data.folders.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-center">
          <Layers className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-lg font-semibold mb-2">No architecture data</h2>
          <p className="text-sm text-muted-foreground">
            Run analysis to see module metrics
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
  const unstableModules = folders.filter((f) => f.instability > 0.7).length

  // Filter folders by search query
  const filteredFolders = folders.filter((f) =>
    f.folderPath.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const summaryCards: Array<{
    label: string
    value: number | string
    subValue: string
    icon: React.ReactNode
    variant: 'default' | 'warning' | 'destructive'
  }> = [
    {
      label: 'Total Modules',
      value: totalModules,
      subValue: `${totalFiles} files`,
      icon: <FolderTree className="h-4 w-4" />,
      variant: 'default'
    },
    {
      label: 'Avg Instability',
      value: avgInstability.toFixed(2),
      subValue:
        avgInstability > 0.6 ? 'High' : avgInstability > 0.4 ? 'Medium' : 'Low',
      icon: <TrendingUp className="h-4 w-4" />,
      variant: avgInstability > 0.6 ? 'warning' : 'default'
    },
    {
      label: 'Unstable Modules',
      value: unstableModules,
      subValue: unstableModules > 0 ? 'Need attention' : 'All stable',
      icon: <AlertTriangle className="h-4 w-4" />,
      variant: unstableModules > 0 ? 'warning' : 'default'
    },
    {
      label: 'With Cycles',
      value: modulesWithCycles,
      subValue: modulesWithCycles > 0 ? 'Circular deps' : 'No cycles',
      icon: <AlertTriangle className="h-4 w-4" />,
      variant: modulesWithCycles > 0 ? 'destructive' : 'default'
    }
  ]

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="max-w-full mx-auto px-6 md:px-8 lg:px-12 py-6 pb-12 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">
            Architecture Analysis
          </h1>
          <p className="text-sm text-muted-foreground">
            Module-level coupling metrics and stability analysis. Identify
            high-risk dependencies.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {summaryCards.map(({ label, value, subValue, icon, variant }) => (
            <Card key={label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-2xl font-semibold mt-1">{value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {subValue}
                    </p>
                  </div>
                  <div
                    className={`p-2 rounded-full ${
                      variant === 'destructive'
                        ? 'bg-destructive/10 text-destructive'
                        : variant === 'warning'
                          ? 'bg-orange-500/10 text-orange-500'
                          : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search modules..."
              className="pl-9"
            />
          </div>
          <Badge variant="outline" className="text-xs">
            {filteredFolders.length} of {totalModules} modules
          </Badge>
        </div>

        {/* Main Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">
              Module Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ArchitectureTable
              folders={filteredFolders}
              sortConfig={sortConfig}
              onSort={handleSort}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
