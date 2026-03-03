import { Suspense, lazy, useCallback, useState } from 'react'

import { ArchitecturePage } from '@/features/architecture/components/ArchitecturePage'
import { DashboardSkeleton } from '@/features/dashboard'
import { ProjectDashboard } from '@/features/dashboard/components/ProjectDashboard'
import {
  FileTreeSkeleton,
  useFileAnalysisContext
} from '@/features/file-analysis'
import { DependencyGraph, useGraphGeneration } from '@/features/graph'
import { SimulationDialog } from '@/features/simulation'
import { useSimulation } from '@/features/simulation/hooks/useSimulation'
import { Button } from '@/shared/components/ui/button'
import { AlertTriangle } from '@/shared/components/ui/icons'
import { PanelLeftClose, PanelLeftOpen } from '@/shared/components/ui/icons'
import { SimpleTooltip } from '@/shared/components/ui/simple-tooltip'
import {
  ToggleGroup,
  ToggleGroupItem
} from '@/shared/components/ui/toggle-group'
import { useDataContext } from '@/shared/context/DataContext'
import { matchesFile } from '@/shared/lib/utils'

// Lazy load heavy components
const FileTreeView = lazy(() =>
  import('@/features/file-analysis').then((m) => ({
    default: m.FileTreeView
  }))
)

const NodeDetailPanel = lazy(() =>
  import('@/features/node-detail').then((m) => ({
    default: m.NodeDetailPanel
  }))
)

const SetupGuidePage = lazy(() =>
  import('@/features/setup-guide').then((m) => ({
    default: m.SetupGuidePage
  }))
)

type ViewMode = 'overview' | 'graph' | 'architecture' | 'setup-guide'

interface AnalysisNode {
  id: string
  label?: string
  [key: string]: unknown
}

export function ReportShell() {
  const [viewMode, setViewMode] = useState<ViewMode>('overview')
  const [isTreeCollapsed, setIsTreeCollapsed] = useState(false)
  const [selectedNode, setSelectedNode] = useState<AnalysisNode | null>(null)
  const [layoutDirection, setLayoutDirection] = useState<'TB' | 'LR'>('LR')

  const { analysisData } = useDataContext()
  const {
    selectedFileId,
    setSelectedFileId,
    filesInCycle,
    orphanFilesSet,
    riskProfileMap,
    brokenFilesSet,
    newOrphansSet,
    setIsSimulating,
    setSimulationResult
  } = useFileAnalysisContext()

  // Graph generation hook
  const { graphElements, generateGraphForFile, clearGraph } =
    useGraphGeneration({
      analysisData,
      filesInCycle,
      orphanFilesSet,
      riskProfileMap,
      brokenFilesSet,
      newOrphansSet
    })

  // Simulation hook (disabled for report - just for state management)
  const { result: simulationResult, reset: closeSimulation } = useSimulation()

  const handleFileSelect = useCallback(
    (fileId: string | null) => {
      if (!fileId || !analysisData) {
        setSelectedFileId(null)
        setSelectedNode(null)
        setViewMode('overview')
        clearGraph()
        return
      }

      // Switch to graph view when file is selected
      setViewMode('graph')

      const resolvedFileId = generateGraphForFile(fileId) || fileId
      setSelectedFileId(resolvedFileId)

      const nodeData =
        analysisData.nodes?.find((n: AnalysisNode) =>
          matchesFile(n.id, resolvedFileId)
        ) ||
        analysisData.nodes?.find((n: AnalysisNode) => matchesFile(n.id, fileId))

      setSelectedNode(nodeData || null)
    },
    [analysisData, generateGraphForFile, clearGraph, setSelectedFileId]
  )

  const handleShowOverview = useCallback(() => {
    setViewMode('overview')
    setSelectedFileId(null)
    setSelectedNode(null)
    clearGraph()
  }, [setSelectedFileId, clearGraph])

  const handleShowGraph = useCallback(() => {
    setViewMode('graph')
  }, [])

  const handleShowArchitecture = useCallback(() => {
    setViewMode('architecture')
  }, [])

  const handleShowSetupGuide = useCallback(() => {
    setViewMode('setup-guide')
  }, [])

  const toggleTreeView = () => setIsTreeCollapsed(!isTreeCollapsed)

  // Handle simulation (disabled in report - just show alert)
  const handleSimulateDelete = useCallback(
    (fileId: string) => {
      setIsSimulating(true)
      // In report, we can't actually simulate since it's static
      // Just show a placeholder result
      const mockResult = {
        brokenFiles: [],
        newOrphans: [],
        fileToRemove: fileId
      }
      setSimulationResult(mockResult)
      setIsSimulating(false)
    },
    [setIsSimulating, setSimulationResult]
  )

  const fileCount = analysisData
    ? Object.keys(analysisData.dependencyMap).length
    : 0

  const hasUnresolvedImports =
    (analysisData?.warnings?.unresolvedImports?.length ?? 0) > 0

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

        {/* Center: Mode Switch */}
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
                } else if (value === 'setup-guide') {
                  handleShowSetupGuide()
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
              <ToggleGroupItem value="setup-guide" size="sm" className="gap-1">
                Setup
                {hasUnresolvedImports && (
                  <AlertTriangle className="h-3 w-3 text-yellow-500" />
                )}
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
                onSimulateDelete={handleSimulateDelete}
              />
            </Suspense>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {analysisData ? (
            viewMode === 'graph' ? (
              <div className="flex h-full bg-background">
                <div className="flex-1">
                  <DependencyGraph
                    nodes={graphElements.nodes}
                    edges={graphElements.edges}
                    focusNodeId={graphElements.focusNodeId}
                    hoveredFile={null}
                    layoutDirection={layoutDirection}
                    onLayoutDirectionChange={setLayoutDirection}
                    onNodeClick={handleFileSelect}
                    isLayoutTransitioning={false}
                  />
                </div>
                {selectedNode && (
                  <div className="w-96 border-l border-border">
                    <Suspense fallback={<div>Loading...</div>}>
                      <NodeDetailPanel
                        node={selectedNode}
                        data={analysisData}
                        onClose={() => handleFileSelect(null)}
                      />
                    </Suspense>
                  </div>
                )}
              </div>
            ) : viewMode === 'architecture' ? (
              <Suspense fallback={<DashboardSkeleton />}>
                <ArchitecturePage />
              </Suspense>
            ) : viewMode === 'setup-guide' ? (
              <Suspense fallback={<DashboardSkeleton />}>
                <SetupGuidePage
                  warnings={analysisData.warnings}
                  onBack={handleShowOverview}
                />
              </Suspense>
            ) : (
              <Suspense fallback={<DashboardSkeleton />}>
                <ProjectDashboard
                  analysisData={analysisData}
                  dependencyGraph={graphElements}
                  hoveredFile={null}
                  layoutDirection={layoutDirection}
                  onLayoutDirectionChange={setLayoutDirection}
                  viewMode={viewMode}
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

      {/* Simulation Dialog */}
      <SimulationDialog result={simulationResult} onClose={closeSimulation} />
    </div>
  )
}
