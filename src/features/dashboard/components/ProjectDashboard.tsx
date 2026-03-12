import { memo, useMemo } from 'react'

import { useArchitectureFolders } from '@/features/architecture'
import {
  type DependencyEdgeData,
  DependencyGraph,
  type DependencyNodeData
} from '@/features/graph'
import {
  CaretRight,
  FileText,
  Lightbulb,
  Network,
  TrendingUp
} from '@/shared/components/ui/icons'
import { MetricCard } from '@/shared/components/ui/metric-card'
import {
  buildEvolutionaryHotspots,
  summarizeEvolutionAvailability
} from '@/shared/lib/utils'
import { RISK_THRESHOLDS, calculateRiskScore } from '@/shared/lib/utils/risk'

import { ActionableInsights } from './ActionableInsights'
import { ArchitectureHealthScore } from './ArchitectureHealthScore'
import { CouplingDistribution } from './CouplingDistribution'
import { EvolutionaryHotspots } from './EvolutionaryHotspots'
import { HighRiskModules } from './HighRiskModules'
import { IssuesPanel } from './IssuesPanel'

import type { AnalysisData } from '@/shared/types/analysis'
import type { Edge, Node } from '@xyflow/react'

interface OverviewSectionHeaderProps {
  eyebrow: string
  title: string
  description: string
}

interface CouplingBucketFile {
  path: string
  count: number
}

function OverviewSectionHeader({
  eyebrow,
  title,
  description
}: OverviewSectionHeaderProps) {
  return (
    <div className='space-y-1.5'>
      <p className='text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground/85'>
        {eyebrow}
      </p>
      <div className='space-y-1'>
        <h2 className='text-lg font-semibold text-foreground'>{title}</h2>
        <p className='max-w-3xl text-sm text-muted-foreground/90'>
          {description}
        </p>
      </div>
    </div>
  )
}

interface ProjectDashboardProps {
  analysisData: AnalysisData | null
  dependencyGraph: {
    nodes: Node<DependencyNodeData>[]
    edges: Edge<DependencyEdgeData>[]
    focusNodeId: string | null
  }
  hoveredFile: string | null
  layoutDirection: 'LR' | 'TB'
  onLayoutDirectionChange?: (direction: 'LR' | 'TB') => void
  viewMode: 'overview' | 'architecture'
  selectedFileId: string | null
  onNavigateToFile: (fileId: string) => void
  onShowArchitecture?: () => void
  onShowModuleGraph?: (modulePath: string) => void
  isLayoutTransitioning?: boolean
}

export const ProjectDashboard = memo(
  function ProjectDashboard({
    analysisData,
    dependencyGraph,
    hoveredFile,
    layoutDirection,
    onLayoutDirectionChange,
    viewMode,
    selectedFileId,
    onNavigateToFile,
    onShowArchitecture,
    onShowModuleGraph,
    isLayoutTransitioning
  }: ProjectDashboardProps) {
    const { data: architectureData } = useArchitectureFolders()
    const evolutionarySummary =
      analysisData?.evolutionaryMetrics.summary ?? null

    // Calculate health breakdown
    const healthBreakdown = useMemo(() => {
      if (!architectureData?.folders) {
        return { stabilityScore: 0, cycleCount: 0, orphanCount: 0 }
      }

      const folders = architectureData.folders
      const avgInstability =
        folders.reduce((sum, f) => sum + f.instability, 0) / folders.length
      const cycleCount = folders.filter((f) => f.hasCycle).length

      return {
        stabilityScore: avgInstability,
        cycleCount,
        orphanCount: analysisData?.issues?.orphans?.length ?? 0
      }
    }, [architectureData, analysisData])

    // Calculate risk profiles for all folders using unified formula: RiskScore = Ca × I
    const allRiskProfiles = useMemo(() => {
      if (!architectureData?.folders) {
        return []
      }

      return architectureData.folders
        .map((f) => ({
          path: f.folderPath,
          instability: f.instability,
          fanIn: f.ca,
          riskScore: calculateRiskScore(f.ca, f.instability),
          hasCycle: f.hasCycle
        }))
        .sort((a, b) => b.riskScore - a.riskScore)
    }, [architectureData])

    // Segmented risk lists for Actionable Insights (triage view)
    const criticalRisks = useMemo(() => {
      return allRiskProfiles.filter(
        (r) => r.riskScore >= RISK_THRESHOLDS.CRITICAL
      )
    }, [allRiskProfiles])

    const warningRisks = useMemo(() => {
      return allRiskProfiles.filter(
        (r) =>
          r.riskScore >= RISK_THRESHOLDS.HIGH &&
          r.riskScore < RISK_THRESHOLDS.CRITICAL
      )
    }, [allRiskProfiles])

    const hotspotAvailability = useMemo(() => {
      return summarizeEvolutionAvailability(evolutionarySummary)
    }, [evolutionarySummary])

    const evolutionaryHotspots = useMemo(() => {
      return architectureData?.folders
        ? buildEvolutionaryHotspots(architectureData.folders)
        : []
    }, [architectureData])

    const topHotspot = evolutionaryHotspots[0] ?? null

    // Calculate coupling distribution
    const couplingDistribution = useMemo(() => {
      if (!analysisData?.dependencyMap) {
        return {
          avgDependencies: 0,
          distribution: [],
          mostCoupledFile: undefined,
          godObjects: []
        }
      }

      const depCounts = Object.entries(analysisData.dependencyMap).map(
        ([path, deps]) => ({
          path,
          count: deps.length
        })
      )

      const sortedByCount = [...depCounts].sort((a, b) => b.count - a.count)

      const toBucketFiles = (items: CouplingBucketFile[]) =>
        [...items].sort((a, b) => b.count - a.count)

      const total = depCounts.length
      const looseFiles = depCounts.filter((d) => d.count <= 2)
      const mediumFiles = depCounts.filter((d) => d.count > 2 && d.count <= 6)
      const tightFiles = depCounts.filter((d) => d.count > 6 && d.count <= 10)
      const heavyFiles = depCounts.filter((d) => d.count > 10)

      const loose = looseFiles.length
      const medium = mediumFiles.length
      const tight = tightFiles.length
      const heavy = heavyFiles.length

      const avgDeps =
        depCounts.reduce((sum, d) => sum + d.count, 0) / Math.max(total, 1)
      const mostCoupled = sortedByCount[0]

      // Identify God Objects (files with >15 dependencies)
      const godObjects = depCounts
        .filter((d) => d.count > 15)
        .map((d) => ({
          path: d.path,
          dependencyCount: d.count
        }))

      return {
        avgDependencies: avgDeps,
        godObjects,
        distribution: [
          {
            label: 'Loose',
            range: '1-2',
            count: loose,
            percentage: (loose / total) * 100,
            color: 'bg-green-500',
            files: toBucketFiles(looseFiles)
          },
          {
            label: 'Medium',
            range: '3-5',
            count: medium,
            percentage: (medium / total) * 100,
            color: 'bg-yellow-500',
            files: toBucketFiles(mediumFiles)
          },
          {
            label: 'Tight',
            range: '6-10',
            count: tight,
            percentage: (tight / total) * 100,
            color: 'bg-orange-500',
            files: toBucketFiles(tightFiles)
          },
          {
            label: 'Heavy',
            range: '10+',
            count: heavy,
            percentage: (heavy / total) * 100,
            color: 'bg-red-500',
            files: toBucketFiles(heavyFiles)
          }
        ],
        mostCoupledFile: mostCoupled
      }
    }, [analysisData])

    if (viewMode === 'overview' && !selectedFileId) {
      const snapshot = {
        totalFiles:
          analysisData?.detailedMetrics?.totalFiles ??
          analysisData?.metrics?.fileCount ??
          0,
        totalDependencies:
          analysisData?.detailedMetrics?.totalDependencies ??
          analysisData?.metrics?.edgeCount ??
          0,
        averageDependenciesPerFile:
          analysisData?.detailedMetrics?.averageDependenciesPerFile ??
          analysisData?.metrics?.avgDegree ??
          0,
        averageRelativeChurn30d:
          analysisData?.evolutionaryMetrics.summary.averageRelativeChurn30d ?? 0
      }

      const overviewCards = [
        {
          label: 'Total Files',
          value: snapshot.totalFiles.toLocaleString(),
          icon: <FileText className='h-4 w-4' />
        },
        {
          label: 'Dependencies',
          value: snapshot.totalDependencies.toLocaleString(),
          icon: <Network className='h-4 w-4' />
        },
        {
          label: 'Avg. Dependencies / File',
          value:
            typeof snapshot.averageDependenciesPerFile === 'number'
              ? `${snapshot.averageDependenciesPerFile}`
              : snapshot.averageDependenciesPerFile,
          icon: <TrendingUp className='h-4 w-4' />
        },
        {
          label: 'Avg. Relative Churn (30d)',
          value: hotspotAvailability.isAvailable
            ? `${(snapshot.averageRelativeChurn30d * 100).toFixed(1)}%`
            : 'Unavailable',
          icon: <TrendingUp className='h-4 w-4' />
        }
      ]

      // Generate critical insights for Health Card
      const criticalInsights = []
      if (healthBreakdown.cycleCount > 0) {
        criticalInsights.push({
          type: 'critical' as const,
          message: `${healthBreakdown.cycleCount} circular ${healthBreakdown.cycleCount === 1 ? 'dependency' : 'dependencies'} need attention`
        })
      }
      const highRiskCount = criticalRisks.length + warningRisks.length
      if (highRiskCount > 0) {
        criticalInsights.push({
          type: 'warning' as const,
          message: `${highRiskCount} module${highRiskCount > 1 ? 's' : ''} with elevated propagation risk detected`
        })
      }
      if (criticalInsights.length === 0) {
        criticalInsights.push({
          type: 'success' as const,
          message: 'Architecture is in excellent shape'
        })
      }

      return (
        <div className='h-full w-full overflow-y-auto overflow-x-hidden bg-background'>
          <div className='mx-auto max-w-full space-y-8 px-6 py-6 pb-12 md:px-8 lg:px-12'>
            <div className='space-y-2'>
              <h1 className='text-2xl font-semibold text-foreground'>
                Project Overview
              </h1>
              <p className='text-sm text-muted-foreground'>
                Dependency analysis summary and repair priorities for your
                project.
              </p>
            </div>

            <div className='space-y-3'>
              <ActionableInsights
                cycleCount={healthBreakdown.cycleCount}
                orphanCount={healthBreakdown.orphanCount}
                criticalRisks={criticalRisks}
                warningRisks={warningRisks}
                godObjects={couplingDistribution.godObjects}
                topHotspot={topHotspot}
                onNavigateToFile={onNavigateToFile}
                onViewModule={onShowModuleGraph}
                onShowArchitecture={onShowArchitecture}
              />
            </div>

            <div className='space-y-4'>
              <OverviewSectionHeader
                eyebrow='Quick Snapshot'
                title='Project size and recent activity'
                description='Use this row to orient yourself before diving into the review queues below.'
              />
              <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
                {overviewCards.map(({ label, value, icon }) => (
                  <MetricCard
                    key={label}
                    label={label}
                    value={value}
                    icon={icon}
                    variant='minimal'
                  />
                ))}
              </div>
            </div>

            <div className='space-y-4'>
              <OverviewSectionHeader
                eyebrow='Review First'
                title='Shared and active areas that deserve attention'
                description='Use these two views together: the left list shows where changes can spread, and the right list shows where recent change pressure is highest.'
              />
              <div className='grid gap-6 lg:grid-cols-2'>
                <HighRiskModules
                  modules={allRiskProfiles.slice(0, 5)}
                  onViewModule={onShowModuleGraph}
                  onViewArchitecture={onShowArchitecture}
                />
                <EvolutionaryHotspots
                  hotspots={evolutionaryHotspots}
                  isAvailable={hotspotAvailability.isAvailable}
                  unavailableReason={hotspotAvailability.message}
                  onViewModule={onShowModuleGraph}
                />
              </div>
            </div>

            <div className='space-y-4'>
              <OverviewSectionHeader
                eyebrow='Current Issues'
                title='Blockers and cleanup candidates'
                description='Check cycles first, then review orphaned files when you have maintenance time.'
              />
              <IssuesPanel
                data={analysisData}
                onNavigateToFile={onNavigateToFile}
              />
            </div>

            <div className='space-y-4'>
              <OverviewSectionHeader
                eyebrow='System Context'
                title='Overall change safety and dependency load'
                description='These summaries help you understand the broader system condition after triaging the urgent areas above.'
              />
              <div className='grid gap-6 lg:grid-cols-2'>
                <ArchitectureHealthScore
                  breakdown={healthBreakdown}
                  riskMetrics={{
                    criticalCount: criticalRisks.length,
                    warningCount: warningRisks.length,
                    godObjectCount: couplingDistribution.godObjects.length
                  }}
                  criticalInsights={criticalInsights}
                />
                <CouplingDistribution
                  {...couplingDistribution}
                  onNavigateToFile={onNavigateToFile}
                />
              </div>
            </div>

            {/* Instability Teaser Card */}
            {onShowArchitecture && (
              <button
                onClick={onShowArchitecture}
                className='group relative w-full overflow-hidden rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 transition-all duration-300 hover:border-blue-500/40 hover:shadow-lg dark:from-blue-950/30 dark:to-cyan-950/20'
              >
                <div className='absolute inset-0 bg-blue-400/5 dark:bg-blue-400/10' />
                <div className='relative flex items-center gap-4 p-4'>
                  <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 transition-transform duration-300 group-hover:scale-110 dark:from-blue-500/30 dark:to-cyan-500/30'>
                    <Lightbulb className='h-6 w-6 text-blue-600 dark:text-blue-400' />
                  </div>
                  <div className='min-w-0 flex-1 text-left'>
                    <h3 className='mb-0.5 text-base font-semibold text-foreground'>
                      New to Instability Metrics?
                    </h3>
                    <p className='text-sm text-muted-foreground'>
                      Learn why{' '}
                      <span className='font-medium text-blue-600 dark:text-blue-400'>
                        Unstable
                      </span>{' '}
                      doesn't mean broken — and why high instability is often a
                      good thing for UI code.
                    </p>
                  </div>
                  <div className='flex flex-shrink-0 items-center gap-2'>
                    <span className='text-sm font-medium text-blue-600 dark:text-blue-400'>
                      Read Guide
                    </span>
                    <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 transition-colors group-hover:bg-blue-500/20 dark:bg-blue-500/20 dark:group-hover:bg-blue-500/30'>
                      <CaretRight className='h-4 w-4 text-blue-600 transition-transform group-hover:translate-x-0.5 dark:text-blue-400' />
                    </div>
                  </div>
                </div>
              </button>
            )}
          </div>
        </div>
      )
    }

    return (
      <div className='h-full bg-background'>
        <DependencyGraph
          nodes={dependencyGraph.nodes}
          edges={dependencyGraph.edges}
          focusNodeId={dependencyGraph.focusNodeId}
          hoveredFile={hoveredFile}
          layoutDirection={layoutDirection}
          onLayoutDirectionChange={onLayoutDirectionChange}
          onNodeClick={onNavigateToFile}
          isLayoutTransitioning={isLayoutTransitioning}
        />
      </div>
    )
  },
  (prev, next) => {
    // Overview mode: only re-render if data changed
    if (next.viewMode === 'overview' && !next.selectedFileId) {
      return (
        prev.analysisData?.metrics?.fileCount ===
          next.analysisData?.metrics?.fileCount &&
        prev.analysisData?.evolutionaryMetrics?.summary
          .averageRelativeChurn30d ===
          next.analysisData?.evolutionaryMetrics?.summary
            .averageRelativeChurn30d &&
        prev.analysisData?.evolutionaryMetrics?.summary.availability ===
          next.analysisData?.evolutionaryMetrics?.summary.availability &&
        prev.viewMode === next.viewMode &&
        prev.selectedFileId === next.selectedFileId
      )
    }

    // Graph mode: re-render if graph changed
    return (
      prev.dependencyGraph.focusNodeId === next.dependencyGraph.focusNodeId &&
      prev.dependencyGraph.nodes.length === next.dependencyGraph.nodes.length &&
      prev.viewMode === next.viewMode &&
      prev.selectedFileId === next.selectedFileId &&
      prev.layoutDirection === next.layoutDirection &&
      prev.isLayoutTransitioning === next.isLayoutTransitioning
    )
  }
)
