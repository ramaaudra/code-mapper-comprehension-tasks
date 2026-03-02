// REUSE types dari existing
import type { Edge, Node } from '@xyflow/react'
import { Suspense, lazy, useMemo, useState } from 'react'

import { ArchitecturePage } from '@/features/architecture/components/ArchitecturePage'
import { DashboardSkeleton } from '@/features/dashboard'
// REUSE existing components - tidak bikin baru!
import { ProjectDashboard } from '@/features/dashboard/components/ProjectDashboard'
import { FileTreeSkeleton } from '@/features/file-analysis'
import { DependencyGraph } from '@/features/graph/components/DependencyGraph'
import type {
  DependencyEdgeData,
  DependencyNodeData
} from '@/features/graph/components/DependencyGraph'
import { Button } from '@/shared/components/ui/button'
import { PanelLeftClose, PanelLeftOpen } from '@/shared/components/ui/icons'
import { SimpleTooltip } from '@/shared/components/ui/simple-tooltip'
import {
  ToggleGroup,
  ToggleGroupItem
} from '@/shared/components/ui/toggle-group'
import { useDataContext } from '@/shared/context/DataContext'

// Lazy load FileTreeView untuk reduce bundle size
const FileTreeView = lazy(() =>
  import('@/features/file-analysis').then((m) => ({
    default: m.FileTreeView
  }))
)

type ViewMode = 'overview' | 'graph' | 'architecture'

export function ReportShell() {
  const [viewMode, setViewMode] = useState<ViewMode>('overview')
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null)
  const [isTreeCollapsed, setIsTreeCollapsed] = useState(false)
  const { analysisData } = useDataContext()

  const handleFileSelect = (fileId: string | null) => {
    setSelectedFileId(fileId)
    setSelectedNodeId(fileId)
    if (fileId) {
      setViewMode('graph')
    }
  }

  const handleShowOverview = () => setViewMode('overview')
  const handleShowGraph = () => setViewMode('graph')
  const handleShowArchitecture = () => setViewMode('architecture')
  const toggleTreeView = () => setIsTreeCollapsed(!isTreeCollapsed)

  // Convert analysis data to graph format
  const graphElements = useMemo(() => {
    if (!analysisData) {
      return { nodes: [], edges: [], focusNodeId: null }
    }

    const nodes: Node<DependencyNodeData>[] = analysisData.nodes.map((n) => ({
      id: n.id,
      type: 'dependency',
      position: { x: 0, y: 0 },
      data: {
        label: n.label || n.id.split('/').pop() || n.id,
        fullPath: n.id,
        direction:
          n.id === selectedNodeId
            ? ('selected' as const)
            : ('incoming' as const)
      }
    }))

    const edges: Edge<DependencyEdgeData>[] = analysisData.edges.map(
      (e, index) => ({
        id: `${e.source}-${e.target}-${index}`,
        source: e.source,
        target: e.target,
        type: 'simplebezier',
        data: { strength: 1, direction: 'outgoing' as const }
      })
    )

    return {
      nodes,
      edges,
      focusNodeId: selectedNodeId
    }
  }, [analysisData, selectedNodeId])

  const fileCount = analysisData
    ? Object.keys(analysisData.dependencyMap).length
    : 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header - mirip TopBar di full app */}
      <header className="h-14 bg-background border-b border-border px-4 flex items-center justify-between">
        {/* Left: Toggle Sidebar + Brand */}
        <div className="flex items-center gap-3">
          <SimpleTooltip
            content={isTreeCollapsed ? 'Show sidebar' : 'Hide sidebar'}
            side="bottom"
            asChild
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTreeView}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              {isTreeCollapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </Button>
          </SimpleTooltip>

          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold text-foreground">
              Code Mapper
            </h1>
            {analysisData && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                {fileCount} files
              </span>
            )}
          </div>
        </div>

        {/* Center: Mode Switch (Overview | Graph | Architecture) */}
        {analysisData && (
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(value: string) => {
                if (value === 'overview') {
handleShowOverview()
} else if (value === 'graph') {
handleShowGraph()
} else if (value === 'architecture') {
handleShowArchitecture()
}
              }}
              size="sm"
            >
              <ToggleGroupItem value="overview" size="sm">
                Overview
              </ToggleGroupItem>
              <ToggleGroupItem value="graph" size="sm">
                Graph
              </ToggleGroupItem>
              <ToggleGroupItem value="architecture" size="sm">
                Architecture
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        )}

        {/* Right: Report timestamp */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            Generated: {new Date().toLocaleDateString()}
          </span>
        </div>
      </header>

      <div className="flex h-[calc(100vh-56px)] overflow-hidden w-full">
        {/* Sidebar dengan File Tree */}
        {!isTreeCollapsed && analysisData?.fileTree && (
          <div className="w-80 border-r border-border overflow-hidden">
            <Suspense fallback={<FileTreeSkeleton />}>
              <FileTreeView
                data={analysisData.fileTree}
                onFileSelect={handleFileSelect}
                onSimulateDelete={() => {}} // Disable simulation di report
              />
            </Suspense>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {analysisData ? (
            viewMode === 'graph' ? (
              <div className="h-full bg-background">
                <DependencyGraph
                  nodes={graphElements.nodes}
                  edges={graphElements.edges}
                  focusNodeId={graphElements.focusNodeId}
                  hoveredFile={null}
                  layoutDirection="LR"
                  onLayoutDirectionChange={() => {}}
                  onNodeClick={handleFileSelect}
                  isLayoutTransitioning={false}
                />
              </div>
            ) : viewMode === 'architecture' ? (
              <Suspense fallback={<DashboardSkeleton />}>
                <ArchitecturePage />
              </Suspense>
            ) : (
              <Suspense fallback={<DashboardSkeleton />}>
                <ProjectDashboard
                  analysisData={analysisData}
                  dependencyGraph={graphElements}
                  hoveredFile={null}
                  layoutDirection="LR"
                  viewMode="overview"
                  selectedFileId={selectedFileId}
                  onNavigateToFile={handleFileSelect}
                  onShowArchitecture={handleShowArchitecture}
                  isLayoutTransitioning={false}
                />
              </Suspense>
            )
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  No analysis data
                </h2>
                <p className="text-muted-foreground">Report data not found</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
