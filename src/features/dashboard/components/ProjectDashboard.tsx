import type { Edge, Node } from '@xyflow/react'
import { memo, useMemo } from 'react'

import { useArchitectureFolders } from '@/features/architecture'
import {
  type DependencyEdgeData,
  DependencyGraph,
  type DependencyNodeData
} from '@/features/graph'
import { FileText, Network, TrendingUp } from '@/shared/components/ui/icons'
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
  viewMode: 'overview' | 'architecture'
  selectedFileId: string | null
  onNavigateToFile: (fileId: string) => void
  onShowArchitecture?: () => void
  isLayoutTransitioning?: boolean
}

export const ProjectDashboard = memo(
  function ProjectDashboard({
    analysisData,
    dependencyGraph,
    hoveredFile,
    layoutDirection,
    viewMode,
    selectedFileId,
    onNavigateToFile,
    onShowArchitecture,
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

    // Calculate high risk modules using scientific formula: RiskScore = Ca × I
    // Based on Robert C. Martin's dependency metrics: Risk = Impact × Probability
    // Impact = Afferent Coupling (Ca/Dependents), Probability = Instability (I)
    const highRiskModules = useMemo(() => {
      if (!architectureData?.folders) {
        return []
      }

      return architectureData.folders
        .filter((f) => f.instability > 0.5 && f.ca > 0)
        .map((f) => ({
          path: f.folderPath,
          instability: f.instability,
          fanIn: f.ca,
          riskScore: f.ca * f.instability
        }))
        .sort((a, b) => b.riskScore - a.riskScore)
        .slice(0, 5)
    }, [architectureData])

    // Calculate coupling distribution
    const couplingDistribution = useMemo(() => {
      if (!analysisData?.dependencyMap) {
        return {
          avgDependencies: 0,
          distribution: [],
          mostCoupledFile: undefined
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

      return {
        avgDependencies: avgDeps,
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
      const highRiskCount = highRiskModules.filter(
        (m) => m.riskScore >= 25
      ).length
      if (highRiskCount > 0) {
        criticalInsights.push({
          type: 'warning' as const,
          message: `${highRiskCount} unstable module${highRiskCount > 1 ? 's' : ''} with many dependents detected`
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
                <div key={label} className="rounded-lg bg-muted/20 p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-medium">
                      {label}
                    </span>
                    <span className="text-muted-foreground">{icon}</span>
                  </div>
                  <div className="mt-3 text-5xl font-semibold tabular-nums text-foreground tracking-tight">
                    {value}
                  </div>
                </div>
              ))}
            </div>

            {/* Health Score - Full Width with Critical Insights */}
            <ArchitectureHealthScore
              breakdown={healthBreakdown}
              totalFiles={snapshot.totalFiles}
              criticalInsights={criticalInsights}
            />

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Left Column */}
              <div className="space-y-6">
                <HighRiskModules
                  modules={highRiskModules}
                  onViewArchitecture={onShowArchitecture}
                />
                <CouplingDistribution {...couplingDistribution} />
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <ActionableInsights
                  cycleCount={healthBreakdown.cycleCount}
                  orphanCount={healthBreakdown.orphanCount}
                  unstableModules={highRiskModules}
                  heavilyCoupledFiles={
                    couplingDistribution.mostCoupledFile
                      ? [couplingDistribution.mostCoupledFile]
                      : []
                  }
                />
                <IssuesPanel
                  data={analysisData}
                  onNavigateToFile={onNavigateToFile}
                />
              </div>
            </div>
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
