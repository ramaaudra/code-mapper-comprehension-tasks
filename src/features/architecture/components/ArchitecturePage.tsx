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
import { ArchitectureTable } from './ArchitectureTable'

import type {
  FolderArchitectureMetrics,
  SortConfig,
  SortKey
} from '../types/architecture'

function ArchitecturePageSkeleton() {
  return (
    <div className='h-full overflow-y-auto bg-background'>
      <div className='mx-auto max-w-full space-y-6 px-6 py-6 md:px-8 lg:px-12'>
        <Skeleton className='h-8 w-64' />
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className='h-24' />
          ))}
        </div>
        <Skeleton className='h-96' />
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
      <div className='flex h-full items-center justify-center bg-background'>
        <div className='text-center'>
          <AlertTriangle className='mx-auto mb-4 h-12 w-12 text-destructive' />
          <h2 className='mb-2 text-lg font-semibold'>
            Failed to load architecture data
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
          <h2 className='mb-2 text-lg font-semibold'>No architecture data</h2>
          <p className='text-sm text-muted-foreground'>
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
  const unstableModules = folders.filter((f) => f.instability >= 0.7).length

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
      icon: <FolderTree className='h-4 w-4' />,
      status: 'default'
    },
    {
      label: 'Average Instability (I)',
      value: avgInstability.toFixed(2),
      subValue:
        avgInstability > 0.6
          ? 'Flexible overall'
          : avgInstability > 0.4
            ? 'Balanced overall'
            : 'More rigid overall',
      icon: <TrendingUp className='h-4 w-4' />,
      status: 'default'
    },
    {
      label: 'Modules with High Instability',
      value: unstableModules,
      subValue: unstableModules > 0 ? 'I >= 0.70' : 'None at I >= 0.70',
      icon: <Wind className='h-4 w-4' />,
      status: 'default'
    },
    {
      label: 'Modules in Cycles',
      value: modulesWithCycles,
      subValue:
        modulesWithCycles > 0
          ? 'Circular dependencies detected'
          : 'No circular dependencies',
      icon: <AlertTriangle className='h-4 w-4' />,
      status: modulesWithCycles > 0 ? 'destructive' : 'default'
    }
  ]

  return (
    <div className='h-full overflow-y-auto bg-background'>
      <div className='mx-auto max-w-full space-y-6 px-6 py-6 pb-12 md:px-8 lg:px-12'>
        {/* Header */}
        <div className='space-y-2'>
          <h1 className='text-2xl font-semibold text-foreground'>
            Architecture Analysis
          </h1>
          <p className='text-sm text-muted-foreground'>
            Module-level coupling metrics, structural profile, and
            change-propagation analysis. Use Propagation Risk as a derived
            impact indicator to identify hotspots, and read Instability as a
            structural position rather than a danger score.
          </p>
        </div>

        {/* Summary Cards */}
        <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
          {summaryCards.map(({ label, value, subValue, icon, status }) => (
            <MetricCard
              key={label}
              label={label}
              value={value}
              subValue={subValue}
              icon={icon}
              variant='detailed'
              status={status}
            />
          ))}
        </div>

        {/* Reading Guide: Instability Education Card */}
        <button
          type='button'
          className={`relative overflow-hidden rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 transition-all duration-300 dark:from-blue-950/30 dark:to-cyan-950/20 ${
            isReadingGuideExpanded
              ? ''
              : 'cursor-pointer hover:border-blue-500/40'
          }`}
          onClick={() =>
            !isReadingGuideExpanded && setIsReadingGuideExpanded(true)
          }
        >
          <div className='absolute inset-0 bg-blue-400/5 dark:bg-blue-400/10' />
          <div className='relative'>
            {isReadingGuideExpanded ? (
              <div className='p-5'>
                <div className='flex items-start gap-4'>
                  <div className='flex-shrink-0'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 dark:bg-blue-500/20'>
                      <Lightbulb className='h-5 w-5 text-blue-600 dark:text-blue-400' />
                    </div>
                  </div>
                  <div className='min-w-0 flex-1'>
                    <h3 className='mb-2 text-sm font-semibold text-foreground'>
                      Understanding the Instability (I) Metric
                    </h3>
                    <p className='mb-4 text-sm leading-relaxed text-muted-foreground'>
                      Do not treat the <strong>Flexible / Unstable</strong>{' '}
                      label as a defect. In dependency metrics, instability
                      describes a module's structural position in the dependency
                      graph, not code quality or direct propagation risk. Use{' '}
                      <strong>Propagation Risk</strong> to estimate how strongly
                      a modification may propagate.
                    </p>
                    <div className='grid gap-4 md:grid-cols-3'>
                      <div className='space-y-2'>
                        <div className='flex items-center gap-2'>
                          <ShieldCheck className='h-5 w-5 text-blue-600 dark:text-blue-400' />
                          <span className='text-sm font-medium text-foreground'>
                            0.00 — Rigid / Stable
                          </span>
                        </div>
                        <p className='pl-7 text-xs leading-relaxed text-muted-foreground'>
                          At this extreme, other modules depend on this module
                          more than it depends on them. Changes here often
                          deserve careful regression testing.
                        </p>
                        <p className='pl-7 text-xs font-medium text-blue-600 dark:text-blue-400'>
                          Common in: shared foundations, domain logic,
                          configuration, and utility layers
                        </p>
                      </div>
                      <div className='space-y-2'>
                        <div className='flex items-center gap-2'>
                          <Layers className='h-5 w-5 text-slate-500 dark:text-slate-300' />
                          <span className='text-sm font-medium text-foreground'>
                            0.40 to &lt; 0.70 - Balanced
                          </span>
                        </div>
                        <p className='pl-7 text-xs leading-relaxed text-muted-foreground'>
                          Incoming and outgoing coupling are both significant.
                          These modules often sit between foundational layers
                          and UI-facing layers.
                        </p>
                        <p className='pl-7 text-xs font-medium text-slate-500 dark:text-slate-300'>
                          Common in: orchestration layers, feature modules, and
                          shared application services
                        </p>
                      </div>
                      <div className='space-y-2'>
                        <div className='flex items-center gap-2'>
                          <Wind className='h-5 w-5 text-emerald-600 dark:text-emerald-400' />
                          <span className='text-sm font-medium text-foreground'>
                            1.00 — Flexible / Unstable
                          </span>
                        </div>
                        <p className='pl-7 text-xs leading-relaxed text-muted-foreground'>
                          At this extreme, the module depends on others while no
                          other modules depend on it directly. These modules are
                          often easier to replace or refactor.
                        </p>
                        <p className='pl-7 text-xs font-medium text-emerald-600 dark:text-emerald-400'>
                          Common in: presentation layers, route modules, UI
                          shells, and adapters
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsReadingGuideExpanded(false)
                    }}
                    className='flex-shrink-0 rounded-md p-1.5 text-muted-foreground/60 transition-colors hover:bg-background/80 hover:text-foreground'
                    aria-label='Collapse reading guide'
                  >
                    <CaretDown className='h-4 w-4' />
                  </button>
                </div>
              </div>
            ) : (
              <div className='flex items-center gap-4 p-4'>
                <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 dark:from-blue-500/30 dark:to-cyan-500/30'>
                  <Lightbulb className='h-6 w-6 text-blue-600 dark:text-blue-400' />
                </div>
                <div className='min-w-0 flex-1'>
                  <h3 className='mb-0.5 text-base font-semibold text-foreground'>
                    New to Instability Metrics?
                  </h3>
                  <p className='text-sm text-muted-foreground'>
                    <span className='font-medium text-blue-600 dark:text-blue-400'>
                      Click to learn
                    </span>{' '}
                    why instability is a structural metric, not a defect or a
                    direct danger score.
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsReadingGuideExpanded(true)
                  }}
                  className='flex items-center gap-1.5 rounded-lg bg-blue-500/10 px-3 py-1.5 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400 dark:hover:bg-blue-500/30'
                >
                  Read Guide
                  <CaretRight className='h-4 w-4' />
                </button>
              </div>
            )}
          </div>
        </button>

        {/* Search & Filter */}
        <div className='flex items-center gap-4'>
          <div className='relative max-w-sm flex-1'>
            <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Search modules...'
              className='pl-9'
            />
          </div>
          <Badge variant='outline' className='text-xs'>
            {filteredFolders.length} of {totalModules} modules
          </Badge>
        </div>

        {/* Main Table */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-base font-medium'>
              Module Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className='p-0'>
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
