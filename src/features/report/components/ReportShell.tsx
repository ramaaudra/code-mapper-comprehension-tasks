import { DotsThreeVertical } from '@phosphor-icons/react'
import { Suspense, lazy, useCallback, useMemo, useRef, useState } from 'react'

import { ArchitecturePage } from '@/features/architecture/components/ArchitecturePage'
import type { FolderArchitectureMetrics } from '@/features/architecture/types/architecture'
import { DashboardSkeleton } from '@/features/dashboard'
import { ProjectDashboard } from '@/features/dashboard/components/ProjectDashboard'
import {
  FileTreeSkeleton,
  type FileTreeViewRef,
  useFileAnalysisContext
} from '@/features/file-analysis'
import { DependencyGraph, useGraphGeneration } from '@/features/graph'
import { ModuleSidePanel } from '@/features/graph/components/ModuleSidePanel'
import { SimulationDialog } from '@/features/simulation'
import { useSimulation } from '@/features/simulation/hooks/useSimulation'
import { Button } from '@/shared/components/ui/button'
import {
  AlertTriangle,
  PanelLeftClose,
  PanelLeftOpen
} from '@/shared/components/ui/icons'
import { SimpleTooltip } from '@/shared/components/ui/simple-tooltip'
import {
  ToggleGroup,
  ToggleGroupItem
} from '@/shared/components/ui/toggle-group'
import { useDataContext } from '@/shared/context/DataContext'
import { useKeyboardShortcut } from '@/shared/hooks/useKeyboardShortcut'
import { useResizablePanel } from '@/shared/hooks/useResizablePanel'
import { matchesFile } from '@/shared/lib/utils'

function getModulePathFromNodeLabel(label?: string): string | null {
  if (!label) {
    return null
  }

  const normalizedLabel = label.replace(/\\/g, '/')
  const lastSlashIndex = normalizedLabel.lastIndexOf('/')

  if (lastSlashIndex === -1) {
    return '(root)'
  }

  return normalizedLabel.slice(0, lastSlashIndex)
}

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

interface ResizeGripProps {
  resizeHandleProps: ReturnType<typeof useResizablePanel>['resizeHandleProps']
}

function ResizeGrip({ resizeHandleProps }: ResizeGripProps) {
  return (
    <div
      {...resizeHandleProps}
      className="absolute left-0 top-0 bottom-0 w-4 cursor-col-resize z-50 -ml-2 flex items-center justify-center group"
      title="Drag to resize"
    >
      <div className="flex flex-col items-center justify-center py-2 rounded bg-border/50 group-hover:bg-primary/20 transition-colors">
        <DotsThreeVertical
          className="h-4 w-4 text-muted-foreground group-hover:text-primary"
          weight="bold"
        />
      </div>
      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-primary/0 group-hover:bg-primary/50 active:bg-primary transition-colors" />
    </div>
  )
}

export function ReportShell() {
  const [viewMode, setViewMode] = useState<ViewMode>('overview')
  const [isTreeCollapsed, setIsTreeCollapsed] = useState(false)
  const [selectedNode, setSelectedNode] = useState<AnalysisNode | null>(null)
  const [layoutDirection, setLayoutDirection] = useState<'TB' | 'LR'>('LR')
  const [graphViewMode, setGraphViewMode] = useState<'file' | 'module'>('file')
  const [focusedModulePath, setFocusedModulePath] = useState<string | null>(
    null
  )
  const [highlightedModule, setHighlightedModule] = useState<string | null>(
    null
  )
  const [selectedModuleForPanel, setSelectedModuleForPanel] = useState<
    string | null
  >(null)
  const [selectedModuleData, setSelectedModuleData] = useState<
    FolderArchitectureMetrics | undefined
  >(undefined)

  const fileTreeRef = useRef<FileTreeViewRef>(null)

  useKeyboardShortcut({ key: 'f', meta: true, preventDefault: true }, () => {
    fileTreeRef.current?.focusSearch()
  })

  const { panelWidth, panelRef, resizeHandleProps } = useResizablePanel()
  const {
    panelWidth: modulePanelWidth,
    panelRef: modulePanelRef,
    resizeHandleProps: moduleResizeHandleProps
  } = useResizablePanel()

  const { analysisData, generatedAt } = useDataContext()
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

  const { graphElements, generateGraphForFile, clearGraph } =
    useGraphGeneration({
      analysisData,
      filesInCycle,
      orphanFilesSet,
      riskProfileMap,
      brokenFilesSet,
      newOrphansSet
    })

  const { result: simulationResult, reset: closeSimulation } = useSimulation()

  const displayGeneratedAt = useMemo(() => {
    if (generatedAt) {
      return generatedAt
    }
    return new Date().toLocaleDateString()
  }, [generatedAt])

  const handleFileSelect = useCallback(
    (fileId: string | null) => {
      if (!fileId || !analysisData) {
        setSelectedFileId(null)
        setSelectedNode(null)
        setSelectedModuleForPanel(null)
        setSelectedModuleData(undefined)
        setViewMode('overview')
        clearGraph()
        return
      }

      setViewMode('graph')
      setGraphViewMode('file')
      setFocusedModulePath(null)
      setSelectedModuleForPanel(null)
      setSelectedModuleData(undefined)

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
    setGraphViewMode('file')
    setHighlightedModule(null)
  }, [])

  const handleShowArchitecture = useCallback(() => {
    setViewMode('architecture')
  }, [])

  const handleShowSetupGuide = useCallback(() => {
    setViewMode('setup-guide')
  }, [])

  const handleShowModuleGraph = useCallback((modulePath: string) => {
    setViewMode('graph')
    setGraphViewMode('module')
    setFocusedModulePath(modulePath)
    setHighlightedModule(modulePath)
    setTimeout(() => {
      setHighlightedModule(null)
    }, 5000)
  }, [])

  const activeModuleFromSelectedNode = getModulePathFromNodeLabel(
    selectedNode?.label
  )

  const handleModuleSelect = useCallback(
    (modulePath: string | null, moduleData?: FolderArchitectureMetrics) => {
      setSelectedModuleForPanel(modulePath)
      setSelectedModuleData(moduleData)
      setFocusedModulePath(modulePath)
    },
    [setFocusedModulePath]
  )

  const handleModulePanelClose = useCallback(() => {
    setSelectedModuleForPanel(null)
    setSelectedModuleData(undefined)
    setFocusedModulePath(null)
  }, [setFocusedModulePath])

  const handleModuleViewFile = useCallback(
    (filePath: string) => {
      setSelectedModuleForPanel(null)
      setSelectedModuleData(undefined)
      const dependencyMap = analysisData?.dependencyMap ?? {}
      const allFiles = Object.keys(dependencyMap)
      const matchedFile =
        allFiles.find((candidate) => matchesFile(candidate, filePath)) ||
        filePath
      handleFileSelect(matchedFile)
      if (fileTreeRef.current) {
        try {
          fileTreeRef.current.select(matchedFile, { focus: true })
        } catch (error) {
          console.warn('Failed to focus file in tree:', error)
        }
      }
    },
    [analysisData, handleFileSelect]
  )

  const handleGraphViewModeChange = useCallback(
    (mode: 'file' | 'module') => {
      setGraphViewMode(mode)

      if (mode === 'file') {
        setFocusedModulePath(null)
        setSelectedModuleForPanel(null)
        setSelectedModuleData(undefined)
        return
      }

      setFocusedModulePath(activeModuleFromSelectedNode)

      if (!activeModuleFromSelectedNode) {
        setSelectedModuleForPanel(null)
        setSelectedModuleData(undefined)
      }
    },
    [activeModuleFromSelectedNode]
  )

  function toggleTreeView() {
    setIsTreeCollapsed(!isTreeCollapsed)
  }

  const handleSimulateDelete = useCallback(
    (fileId: string) => {
      setIsSimulating(true)
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

  const handleNavigate = useCallback(
    (value: string) => {
      switch (value) {
        case 'overview':
          handleShowOverview()
          break
        case 'graph':
          handleShowGraph()
          break
        case 'architecture':
          handleShowArchitecture()
          break
        case 'setup-guide':
          handleShowSetupGuide()
          break
      }
    },
    [
      handleShowOverview,
      handleShowGraph,
      handleShowArchitecture,
      handleShowSetupGuide
    ]
  )

  const fileCount = analysisData
    ? Object.keys(analysisData.dependencyMap).length
    : 0

  const hasUnresolvedImports =
    (analysisData?.warnings?.unresolvedImports?.length ?? 0) > 0

  const showNodeDetailPanel =
    analysisData &&
    selectedNode &&
    (viewMode === 'overview' ||
      (viewMode === 'graph' && graphViewMode !== 'module'))

  const showModuleSidePanel =
    analysisData &&
    selectedModuleForPanel &&
    graphViewMode === 'module' &&
    viewMode === 'graph'

  function renderMainContent() {
    if (!analysisData) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              No analysis data
            </h2>
            <p className="text-muted-foreground">Report data not found</p>
          </div>
        </div>
      )
    }

    if (viewMode === 'graph') {
      return (
        <div className="h-full bg-background">
          <DependencyGraph
            nodes={graphElements.nodes}
            edges={graphElements.edges}
            focusNodeId={graphElements.focusNodeId}
            hoveredFile={null}
            layoutDirection={layoutDirection}
            onLayoutDirectionChange={setLayoutDirection}
            onNodeClick={handleFileSelect}
            isLayoutTransitioning={false}
            initialViewMode={graphViewMode}
            highlightedModule={highlightedModule}
            initialFocusedModuleId={focusedModulePath}
            onViewModeChange={handleGraphViewModeChange}
            onModuleSelect={handleModuleSelect}
          />
        </div>
      )
    }

    if (viewMode === 'architecture') {
      return (
        <Suspense fallback={<DashboardSkeleton />}>
          <ArchitecturePage />
        </Suspense>
      )
    }

    if (viewMode === 'setup-guide') {
      return (
        <Suspense fallback={<DashboardSkeleton />}>
          <SetupGuidePage
            warnings={analysisData.warnings}
            onBack={handleShowOverview}
          />
        </Suspense>
      )
    }

    return (
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
          onShowModuleGraph={handleShowModuleGraph}
          isLayoutTransitioning={false}
        />
      </Suspense>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="h-14 bg-background border-b border-border px-4 flex items-center justify-between">
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

        {analysisData && (
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={handleNavigate}
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

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            Generated: {displayGeneratedAt}
          </span>
        </div>
      </header>

      <div className="flex h-[calc(100vh-56px)] overflow-hidden w-full">
        {!isTreeCollapsed && analysisData?.fileTree && (
          <div className="w-80 border-r border-border overflow-hidden">
            <Suspense fallback={<FileTreeSkeleton />}>
              <FileTreeView
                ref={fileTreeRef}
                data={analysisData.fileTree}
                onFileSelect={handleFileSelect}
                onSimulateDelete={handleSimulateDelete}
              />
            </Suspense>
          </div>
        )}

        <div className="flex-1 overflow-hidden">{renderMainContent()}</div>

        {showNodeDetailPanel && (
          <div
            ref={panelRef}
            className="relative border-l border-border overflow-hidden flex-shrink-0"
            style={{ width: `${panelWidth}px` }}
          >
            <ResizeGrip resizeHandleProps={resizeHandleProps} />
            <Suspense
              fallback={
                <div className="h-full flex items-center justify-center bg-background">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
                </div>
              }
            >
              <NodeDetailPanel
                node={selectedNode}
                data={analysisData}
                onClose={() => handleFileSelect(null)}
              />
            </Suspense>
          </div>
        )}

        {showModuleSidePanel && (
          <div
            ref={modulePanelRef}
            className="relative border-l border-border overflow-hidden flex-shrink-0"
            style={{ width: `${modulePanelWidth}px` }}
          >
            <ResizeGrip resizeHandleProps={moduleResizeHandleProps} />
            <ModuleSidePanel
              modulePath={selectedModuleForPanel}
              moduleData={selectedModuleData}
              onClose={handleModulePanelClose}
              onViewFile={handleModuleViewFile}
            />
          </div>
        )}
      </div>

      <SimulationDialog result={simulationResult} onClose={closeSimulation} />
    </div>
  )
}
