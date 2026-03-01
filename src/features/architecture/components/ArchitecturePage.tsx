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
    status: 'default' | 'warning' | 'destructive'
  }> = [
    {
      label: 'Total Modules',
      value: totalModules,
      subValue: `${totalFiles} files`,
      icon: <FolderTree className="h-4 w-4" />,
      status: 'default'
    },
    {
      label: 'Avg Instability',
      value: avgInstability.toFixed(2),
      subValue:
        avgInstability > 0.6 ? 'High' : avgInstability > 0.4 ? 'Medium' : 'Low',
      icon: <TrendingUp className="h-4 w-4" />,
      status: avgInstability > 0.6 ? 'warning' : 'default'
    },
    {
      label: 'Unstable Modules',
      value: unstableModules,
      subValue: unstableModules > 0 ? 'Need attention' : 'All stable',
      icon: <AlertTriangle className="h-4 w-4" />,
      status: unstableModules > 0 ? 'warning' : 'default'
    },
    {
      label: 'With Cycles',
      value: modulesWithCycles,
      subValue: modulesWithCycles > 0 ? 'Circular deps' : 'No cycles',
      icon: <AlertTriangle className="h-4 w-4" />,
      status: modulesWithCycles > 0 ? 'destructive' : 'default'
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
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map(({ label, value, subValue, icon, status }) => (
            <MetricCard
              key={label}
              label={label}
              value={value}
              subValue={subValue}
              icon={icon}
              variant="detailed"
              status={status}
            />
          ))}
        </div>

        {/* Reading Guide: Instability Education Card */}
        <div
          className={`relative overflow-hidden rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 transition-all duration-300 dark:from-blue-950/30 dark:to-cyan-950/20 ${
            isReadingGuideExpanded
              ? ''
              : 'hover:border-blue-500/40 cursor-pointer'
          }`}
          onClick={() =>
            !isReadingGuideExpanded && setIsReadingGuideExpanded(true)
          }
        >
          <div className="absolute inset-0 bg-blue-400/5 dark:bg-blue-400/10" />
          <div className="relative">
            {isReadingGuideExpanded ? (
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 dark:bg-blue-500/20">
                      <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground mb-2">
                      Understanding the Instability (I) Metric
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      Don't be alarmed by the <strong>Unstable</strong> label.
                      In software architecture, this metric is not a bug
                      indicator, but rather an indicator of how safe a file is
                      to completely refactor.
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          <span className="text-sm font-medium text-foreground">
                            0.00 — Stable (Rigid)
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground pl-7 leading-relaxed">
                          Difficult to change because many other files depend on
                          it. If changed, it can trigger a domino effect.
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 pl-7 font-medium">
                          Ideal for: Core Logic, utils/, lib/, configuration
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Wind className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-sm font-medium text-foreground">
                            1.00 — Unstable (Flexible)
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground pl-7 leading-relaxed">
                          Completely safe to change at any time because no other
                          files depend on it.
                        </p>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 pl-7 font-medium">
                          Ideal for: UI Components, app/page.tsx, visual
                          elements
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsReadingGuideExpanded(false)
                    }}
                    className="flex-shrink-0 p-1.5 rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-background/80 transition-colors"
                    aria-label="Collapse reading guide"
                  >
                    <CaretDown className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 dark:from-blue-500/30 dark:to-cyan-500/30">
                  <Lightbulb className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-foreground mb-0.5">
                    New to Instability Metrics?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                      Click to learn
                    </span>{' '}
                    why <strong>Unstable</strong> doesn't mean broken — and why
                    it's often a good thing for UI code.
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsReadingGuideExpanded(true)
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-sm font-medium hover:bg-blue-500/20 dark:hover:bg-blue-500/30 transition-colors"
                >
                  Read Guide
                  <CaretRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
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
