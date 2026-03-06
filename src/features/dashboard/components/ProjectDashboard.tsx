import type { Edge, Node } from '@xyflow/react'
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
import { RISK_THRESHOLDS } from '@/shared/lib/utils/risk'
import type { AnalysisData } from '@/shared/types/analysis'

import { ActionableInsights } from './ActionableInsights'
import { ArchitectureHealthScore } from './ArchitectureHealthScore'
import { CouplingDistribution } from './CouplingDistribution'
import { HighRiskModules } from './HighRiskModules'
import { IssuesPanel } from './IssuesPanel'

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
          riskScore: f.ca * f.instability,
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

      const total = depCounts.length
      const loose = depCounts.filter((d) => d.count <= 2).length
      const medium = depCounts.filter((d) => d.count > 2 && d.count <= 6).length
      const tight = depCounts.filter((d) => d.count > 6 && d.count <= 10).length
      const heavy = depCounts.filter((d) => d.count > 10).length

      const avgDeps =
        depCounts.reduce((sum, d) => sum + d.count, 0) / Math.max(total, 1)
      const mostCoupled = depCounts.sort((a, b) => b.count - a.count)[0]

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
            range: '0-2',
            count: loose,
            percentage: (loose / total) * 100,
            color: 'bg-green-500'
          },
          {
            label: 'Medium',
            range: '3-6',
            count: medium,
            percentage: (medium / total) * 100,
            color: 'bg-yellow-500'
          },
          {
            label: 'Tight',
            range: '7-10',
            count: tight,
            percentage: (tight / total) * 100,
            color: 'bg-orange-500'
          },
          {
            label: 'Heavy',
            range: '10+',
            count: heavy,
            percentage: (heavy / total) * 100,
            color: 'bg-red-500'
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
          0
      }

      const overviewCards = [
        {
          label: 'Total Files',
          value: snapshot.totalFiles.toLocaleString(),
          icon: <FileText className="h-4 w-4" />
        },
        {
          label: 'Dependencies',
          value: snapshot.totalDependencies.toLocaleString(),
          icon: <Network className="h-4 w-4" />
        },
        {
          label: 'Avg. Dependencies / File',
          value:
            typeof snapshot.averageDependenciesPerFile === 'number'
              ? `${snapshot.averageDependenciesPerFile}`
              : snapshot.averageDependenciesPerFile,
          icon: <TrendingUp className="h-4 w-4" />
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
      // High risk = Risk Score >= 25 (scientific threshold from Ca × I formula)
      const highRiskCount = criticalRisks.length + warningRisks.length
      if (highRiskCount > 0) {
        criticalInsights.push({
          type: 'warning' as const,
          message: `${highRiskCount} module${highRiskCount > 1 ? 's' : ''} with elevated risk detected`
        })
      }
      if (criticalInsights.length === 0) {
        criticalInsights.push({
          type: 'success' as const,
          message: 'Architecture is in excellent shape'
        })
      }

      return (
        <div className="h-full overflow-y-auto overflow-x-hidden bg-background w-full">
          <div className="max-w-full mx-auto px-6 md:px-8 lg:px-12 py-6 pb-12 space-y-8">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-foreground">
                Project Overview
              </h1>
              <p className="text-sm text-muted-foreground">
                Dependency analysis summary and repair priorities for your
                project.
              </p>
            </div>

            {/* Top Metrics - Minimalist Developer Style */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {overviewCards.map(({ label, value, icon }) => (
                <MetricCard
                  key={label}
                  label={label}
                  value={value}
                  icon={icon}
                  variant="minimal"
                />
              ))}
            </div>

            {/* Health Score - Full Width with Critical Insights */}
            <ArchitectureHealthScore
              breakdown={healthBreakdown}
              riskMetrics={{
                criticalCount: criticalRisks.length,
                warningCount: warningRisks.length,
                godObjectCount: couplingDistribution.godObjects.length
              }}
              criticalInsights={criticalInsights}
            />

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Left Column */}
              <div className="space-y-6">
                <HighRiskModules
                  modules={allRiskProfiles.slice(0, 5)}
                  onViewModule={onShowModuleGraph}
                  onViewArchitecture={onShowArchitecture}
                />
                <CouplingDistribution {...couplingDistribution} />
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <ActionableInsights
                  cycleCount={healthBreakdown.cycleCount}
                  orphanCount={healthBreakdown.orphanCount}
                  criticalRisks={criticalRisks}
                  warningRisks={warningRisks}
                  godObjects={couplingDistribution.godObjects}
                />
                <IssuesPanel
                  data={analysisData}
                  onNavigateToFile={onNavigateToFile}
                />
              </div>
            </div>

            {/* Instability Teaser Card */}
            {onShowArchitecture && (
              <button
                onClick={onShowArchitecture}
                className="w-full group relative overflow-hidden rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 transition-all duration-300 hover:border-blue-500/40 hover:shadow-lg dark:from-blue-950/30 dark:to-cyan-950/20"
              >
                <div className="absolute inset-0 bg-blue-400/5 dark:bg-blue-400/10" />
                <div className="relative p-4 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 dark:from-blue-500/30 dark:to-cyan-500/30 group-hover:scale-110 transition-transform duration-300">
                    <Lightbulb className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <h3 className="text-base font-semibold text-foreground mb-0.5">
                      New to Instability Metrics?
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Learn why{' '}
                      <span className="text-blue-600 dark:text-blue-400 font-medium">
                        Unstable
                      </span>{' '}
                      doesn't mean broken — and why high instability is often a
                      good thing for UI code.
                    </p>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-2">
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      Read Guide
                    </span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 dark:bg-blue-500/20 group-hover:bg-blue-500/20 dark:group-hover:bg-blue-500/30 transition-colors">
                      <CaretRight className="h-4 w-4 text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform" />
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
      <div className="h-full bg-background">
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
