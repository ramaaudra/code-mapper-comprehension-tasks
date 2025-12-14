import type { Edge, Node } from '@xyflow/react'
import { memo } from 'react'

import {
  type DependencyEdgeData,
  DependencyGraph,
  type DependencyNodeData
} from '@/features/graph'
import { FileText, Network, TrendingUp } from '@/shared/components/ui/icons'
import type { AnalysisData } from '@/shared/types/analysis'

import { IssuesPanel } from './IssuesPanel'
import MetricsPanel from './MetricsPanel'

interface ProjectDashboardProps {
  analysisData: AnalysisData | null
  dependencyGraph: {
    nodes: Node<DependencyNodeData>[]
    edges: Edge<DependencyEdgeData>[]
    focusNodeId: string | null
  }
  hoveredFile: string | null
  layoutDirection: 'LR' | 'TB'
  viewMode: 'overview' | 'file'
  onNavigateToFile: (fileId: string) => void
  isLayoutTransitioning?: boolean
}

export const ProjectDashboard = memo(
  function ProjectDashboard({
    analysisData,
    dependencyGraph,
    hoveredFile,
    layoutDirection,
    viewMode,
    onNavigateToFile,
    isLayoutTransitioning
  }: ProjectDashboardProps) {
    if (viewMode === 'overview') {
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

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {overviewCards.map(({ label, value, icon }) => (
                <div
                  key={label}
                  className="rounded-lg border bg-card p-4"
                >
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{label}</span>
                    {icon}
                  </div>
                  <div className="mt-3 text-2xl font-semibold text-foreground">
                    {value}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-6 min-w-0">
                <MetricsPanel
                  data={analysisData}
                  onSelectFile={onNavigateToFile}
                />
              </div>
              <div className="space-y-6 min-w-0">
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
    if (next.viewMode === 'overview') {
      return (
        prev.analysisData?.metrics?.fileCount ===
        next.analysisData?.metrics?.fileCount &&
        prev.viewMode === next.viewMode
      )
    }

    // File mode: re-render if graph changed
    return (
      prev.dependencyGraph.focusNodeId === next.dependencyGraph.focusNodeId &&
      prev.dependencyGraph.nodes.length === next.dependencyGraph.nodes.length &&
      prev.viewMode === next.viewMode &&
      prev.layoutDirection === next.layoutDirection &&
      prev.isLayoutTransitioning === next.isLayoutTransitioning
    )
  }
)
