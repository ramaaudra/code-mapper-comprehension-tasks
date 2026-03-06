import dagre from '@dagrejs/dagre'
import {
  CheckCircle,
  File,
  FileJs,
  FileJsx,
  FileTs,
  FileTsx,
  Info,
  Lightning,
  Warning
} from '@phosphor-icons/react'
import {
  Background,
  BackgroundVariant,
  ConnectionLineType,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  useStore
} from '@xyflow/react'
import type { Edge, Node, NodeProps, NodeTypes } from '@xyflow/react'
import clsx from 'clsx'
import {
  type ComponentType,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'

import '@xyflow/react/dist/style.css'

import type { FolderArchitectureMetrics } from '@/features/architecture/types/architecture'
import { getRelativePath } from '@/shared/lib/utils'
import { perfMonitor } from '@/shared/lib/utils/perfMonitor'

import { useAdaptiveQuality } from '../hooks/useAdaptiveQuality'
import { useModuleGraph } from '../hooks/useModuleGraph'
import { AggregatedEdge } from './AggregatedEdge'
import { ModuleNodeComponent } from './ModuleNode'
import { type ViewMode, ViewModeToggle } from './ViewModeToggle'
import { ZoomControls } from './ZoomControls'

export interface DependencyNodeData extends Record<string, unknown> {
  label: string
  fullPath: string
  direction: 'selected' | 'incoming' | 'outgoing' | 'placeholder'
  subtitle?: string
  badges?: Array<{
    label: string
    tone: 'info' | 'warning' | 'danger' | 'success'
  }>
  isHovered?: boolean
  isSimplified?: boolean
}

export interface DependencyEdgeData extends Record<string, unknown> {
  strength: number
  direction: 'incoming' | 'outgoing'
}

type DependencyFlowNode = Node<DependencyNodeData>
type DependencyFlowEdge = Edge<DependencyEdgeData>

export interface DependencyGraphProps {
  nodes: DependencyFlowNode[]
  edges: DependencyFlowEdge[]
  focusNodeId: string | null
  hoveredFile?: string | null
  layoutDirection: 'LR' | 'TB'
  onLayoutDirectionChange?: (direction: 'LR' | 'TB') => void
  onNodeClick?: (fileId: string) => void
  isLayoutTransitioning?: boolean
  // New props for module view
  initialViewMode?: ViewMode
  highlightedModule?: string | null
  initialFocusedModuleId?: string | null
  onViewModeChange?: (mode: ViewMode) => void
  onModuleSelect?: (
    modulePath: string | null,
    moduleData?: FolderArchitectureMetrics
  ) => void
}

const dagreDefaults = {
  ranksep: 200,
  nodesep: 140,
  edgesep: 80,
  marginx: 60,
  marginy: 60
}

function normalizePath(value: string): string {
  return value.replace(/\\/g, '/')
}

function getBasename(filePath: string): string {
  const normalized = normalizePath(filePath)
  const segments = normalized.split('/')
  return segments[segments.length - 1]
}

function getFileIcon(fileName: string) {
  const extension = fileName.split('.').pop()?.toLowerCase()
  switch (extension) {
    case 'ts':
      return FileTs
    case 'tsx':
      return FileTsx
    case 'js':
      return FileJs
    case 'jsx':
      return FileJsx
    default:
      return File
  }
}

function layoutNodes(
  nodes: DependencyFlowNode[],
  edges: DependencyFlowEdge[],
  layoutDirection: 'LR' | 'TB',
  focusNodeId?: string | null
) {
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))
  dagreGraph.setGraph({
    rankdir: layoutDirection,
    ...dagreDefaults
  })

  const normalizedFocus = focusNodeId
    ? normalizePath(focusNodeId).toLowerCase()
    : null

  nodes.forEach((node) => {
    const width = typeof node.width === 'number' ? node.width : 260
    const height = typeof node.height === 'number' ? node.height : 120
    dagreGraph.setNode(node.id, { width, height })
  })

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  dagre.layout(dagreGraph)

  return nodes.map((node) => {
    const { x, y } = dagreGraph.node(node.id) as { x: number; y: number }
    const normalizedNodePath = normalizePath(node.data.fullPath).toLowerCase()
    const isFocused = normalizedFocus
      ? normalizedFocus === normalizedNodePath
      : false

    return {
      ...node,
      position: { x, y },
      sourcePosition:
        layoutDirection === 'LR' ? Position.Right : Position.Bottom,
      targetPosition: layoutDirection === 'LR' ? Position.Left : Position.Top,
      selected: isFocused
    }
  })
}

const moduleLayoutDefaults = {
  overview: {
    ranksep: 180,
    nodesep: 100,
    edgesep: 60,
    marginx: 80,
    marginy: 80
  },
  focused: { ranksep: 120, nodesep: 80, edgesep: 40, marginx: 60, marginy: 60 }
}

function layoutModuleNodes(
  nodes: Node[],
  edges: Edge[],
  layoutDirection: 'LR' | 'TB',
  isFocused: boolean
): Node[] {
  if (nodes.length === 0) {
    return nodes
  }

  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))
  const config = isFocused
    ? moduleLayoutDefaults.focused
    : moduleLayoutDefaults.overview
  dagreGraph.setGraph({ rankdir: layoutDirection, ...config })

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 300, height: 140 })
  })

  edges.forEach((edge) => {
    if (dagreGraph.hasNode(edge.source) && dagreGraph.hasNode(edge.target)) {
      dagreGraph.setEdge(edge.source, edge.target)
    }
  })

  dagre.layout(dagreGraph)

  return nodes.map((node) => {
    const nodeWithPos = dagreGraph.node(node.id) as
      | { x: number; y: number }
      | undefined
    if (!nodeWithPos) {
      return node
    }
    return {
      ...node,
      position: { x: nodeWithPos.x, y: nodeWithPos.y },
      sourcePosition:
        layoutDirection === 'LR' ? Position.Right : Position.Bottom,
      targetPosition: layoutDirection === 'LR' ? Position.Left : Position.Top
    }
  })
}

function ZoomIndicator() {
  const zoom = useStore((state) => state.transform[2])
  const [visible, setVisible] = useState(false)
  const previousZoom = useRef<number>(zoom)

  useEffect(() => {
    if (previousZoom.current !== zoom) {
      previousZoom.current = zoom
      setVisible(true)
      const timeout = setTimeout(() => setVisible(false), 1200)
      return () => clearTimeout(timeout)
    }
    return undefined
  }, [zoom])

  if (!visible) {
    return null
  }

  const percentage = Math.round(zoom * 100)
  let label: string
  if (percentage < 75) {
    label = 'Wide view'
  } else if (percentage > 175) {
    label = 'Close view'
  } else {
    label = 'Normal'
  }

  return (
    <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-md text-sm font-mono z-20 shadow-lg">
      {percentage}%<div className="text-xs opacity-75 mt-1">{label}</div>
    </div>
  )
}

function DependencyNodeComponent(props: NodeProps<DependencyFlowNode>) {
  const data = (props.data ?? {}) as DependencyNodeData
  const direction = (data.direction ??
    'placeholder') as DependencyNodeData['direction']

  const backgroundTone: Record<DependencyNodeData['direction'], string> = {
    selected:
      'bg-[hsl(var(--node-selected-bg))] border-[hsl(var(--node-selected-border))] ring-2 ring-[hsl(var(--node-selected-ring))]',
    incoming:
      'bg-[hsl(var(--node-incoming-bg))] border-[hsl(var(--node-incoming-border))] hover:border-[hsl(var(--node-incoming-hover))]',
    outgoing:
      'bg-[hsl(var(--node-outgoing-bg))] border-[hsl(var(--node-outgoing-border))] hover:border-[hsl(var(--node-outgoing-hover))]',
    placeholder:
      'bg-[hsl(var(--node-placeholder-bg))] border-[hsl(var(--node-placeholder-border))] hover:border-[hsl(var(--node-placeholder-hover))]'
  }

  const chipTone: Record<DependencyNodeData['direction'], string> = {
    selected:
      'bg-[hsl(var(--chip-selected-bg))] text-[hsl(var(--chip-selected-fg))]',
    incoming:
      'bg-[hsl(var(--chip-incoming-bg))] text-[hsl(var(--chip-incoming-fg))]',
    outgoing:
      'bg-[hsl(var(--chip-outgoing-bg))] text-[hsl(var(--chip-outgoing-fg))]',
    placeholder:
      'bg-[hsl(var(--chip-placeholder-bg))] text-[hsl(var(--chip-placeholder-fg))]'
  }

  const chipLabel: Record<DependencyNodeData['direction'], string> = {
    selected: 'Focus',
    incoming: 'In',
    outgoing: 'Out',
    placeholder: 'Info'
  }

  const FileIcon = getFileIcon(data.label)

  return (
    <div
      className={clsx(
        'relative rounded-lg border px-4 py-3 transition-all duration-200',
        'text-left min-w-[220px] max-w-[280px] flex flex-col gap-2',
        backgroundTone[direction],
        data.isHovered && '!border-[hsl(var(--node-hover-border))] shadow-md',
        'focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2'
      )}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${data.label}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileIcon size={16} className="shrink-0 text-muted-foreground" />
          <div>
            <div className="text-sm font-semibold text-[hsl(var(--foreground))] break-words">
              {data.label}
            </div>
            {data.subtitle && (
              <div className="text-[11px] uppercase tracking-wide font-medium text-neutral-500 dark:text-neutral-400">
                {data.subtitle}
              </div>
            )}
          </div>
        </div>
        <div
          className={clsx(
            'text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wide',
            chipTone[direction]
          )}
        >
          {chipLabel[direction]}
        </div>
      </div>

      <div className="text-xs text-muted-foreground leading-relaxed">
        <div className="truncate" title={data.fullPath}>
          {getRelativePath(data.fullPath)}
        </div>
      </div>

      {/* Risk Badges */}
      {data.badges && data.badges.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {data.badges.map((badge, idx) => {
            const badgeStyles: Record<typeof badge.tone, string> = {
              danger:
                'bg-[hsl(var(--risk-danger))] text-white border-[hsl(var(--risk-danger))]',
              warning:
                'bg-[hsl(var(--risk-warning))] text-white border-[hsl(var(--risk-warning))]',
              success:
                'bg-[hsl(var(--risk-success))] text-white border-[hsl(var(--risk-success))]',
              info: 'bg-neutral-500 text-white border-neutral-500'
            }

            const BadgeIcon = {
              danger: Warning,
              warning: Lightning,
              success: CheckCircle,
              info: Info
            }[badge.tone]

            return (
              <div
                key={`${badge.label}-${idx}`}
                className={clsx(
                  'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium',
                  'border transition-all duration-200',
                  badgeStyles[badge.tone]
                )}
                title={badge.label}
              >
                <BadgeIcon size={12} weight="fill" />
                <span className="uppercase tracking-wide">{badge.label}</span>
              </div>
            )
          })}
        </div>
      )}

      <Handle
        type="target"
        position={Position.Left}
        style={{ opacity: 0, width: 12, height: 12, pointerEvents: 'none' }}
      />
      <Handle
        type="target"
        position={Position.Top}
        style={{ opacity: 0, width: 12, height: 12, pointerEvents: 'none' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ opacity: 0, width: 12, height: 12, pointerEvents: 'none' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ opacity: 0, width: 12, height: 12, pointerEvents: 'none' }}
      />
    </div>
  )
}

const dependencyNode = memo(DependencyNodeComponent)

const nodeTypes: NodeTypes = {
  dependency: dependencyNode as unknown as ComponentType<NodeProps>,
  module: ModuleNodeComponent as unknown as ComponentType<NodeProps>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const edgeTypes: any = {
  aggregated: AggregatedEdge
}

function DependencyGraphInner({
  nodes: fileNodes,
  edges: fileEdges,
  focusNodeId,
  hoveredFile,
  layoutDirection,
  onLayoutDirectionChange,
  onNodeClick,
  isLayoutTransitioning = false,
  initialViewMode = 'file',
  highlightedModule,
  initialFocusedModuleId = null,
  onViewModeChange,
  onModuleSelect
}: DependencyGraphProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode)
  const [selectedModule, setSelectedModule] = useState<string | null>(null)
  // isSidePanelOpen digunakan sebagai internal tracking state
  const [, setIsSidePanelOpen] = useState(false)
  const [focusedModuleId, setFocusedModuleId] = useState<string | null>(null)

  const {
    nodes: moduleNodes,
    edges: moduleEdges,
    isLoading: isModuleLoading,
    folders
  } = useModuleGraph()

  // Sync internal viewMode ketika parent me-reset (misal: user klik file dari file tree)
  useEffect(() => {
    setViewMode(initialViewMode)
    if (initialViewMode !== 'module') {
      setFocusedModuleId(null)
      setSelectedModule(null)
      setIsSidePanelOpen(false)
    }
  }, [initialViewMode])

  // Sync initialFocusedModuleId prop to internal state
  useEffect(() => {
    if (initialViewMode !== 'module') {
      return
    }

    setFocusedModuleId(initialFocusedModuleId)
    setSelectedModule(initialFocusedModuleId)
    setIsSidePanelOpen(Boolean(initialFocusedModuleId))

    if (!initialFocusedModuleId) {
      onModuleSelect?.(null)
      return
    }

    setViewMode('module')
    const moduleData = folders.find(
      (f) => f.folderPath === initialFocusedModuleId
    )
    onModuleSelect?.(initialFocusedModuleId, moduleData)
  }, [initialFocusedModuleId, initialViewMode, folders, onModuleSelect])

  // selectedModuleData tidak lagi dirender di sini (dipindah ke App.tsx)
  // isSidePanelOpen tetap ada untuk internal state tracking

  // Filter module nodes/edges based on focus (for cleaner visualization)
  const filteredModuleNodes = useMemo(() => {
    if (!focusedModuleId) {
      return moduleNodes
    }

    // Get directly connected modules (1 level depth)
    const connectedModuleIds = new Set<string>([focusedModuleId])

    moduleEdges.forEach((edge) => {
      if (edge.source === focusedModuleId) {
        connectedModuleIds.add(edge.target)
      } else if (edge.target === focusedModuleId) {
        connectedModuleIds.add(edge.source)
      }
    })

    return moduleNodes.filter((node) => connectedModuleIds.has(node.id))
  }, [moduleNodes, moduleEdges, focusedModuleId])

  const filteredModuleEdges = useMemo(() => {
    if (!focusedModuleId) {
      return moduleEdges
    }

    const visibleNodeIds = new Set(filteredModuleNodes.map((n) => n.id))

    // Only show edges between visible nodes
    return moduleEdges.filter(
      (edge) =>
        visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
    )
  }, [moduleEdges, filteredModuleNodes, focusedModuleId])

  // Apply dagre layout to module nodes for proper positioning
  const layoutedModuleNodes = useMemo(() => {
    if (viewMode !== 'module' || isModuleLoading) {
      return filteredModuleNodes
    }
    const endMeasure = perfMonitor.startMeasure('module-layout')
    try {
      return layoutModuleNodes(
        filteredModuleNodes,
        filteredModuleEdges,
        layoutDirection,
        !!focusedModuleId
      )
    } finally {
      endMeasure()
    }
  }, [
    filteredModuleNodes,
    filteredModuleEdges,
    layoutDirection,
    focusedModuleId,
    viewMode,
    isModuleLoading
  ])

  // Use appropriate nodes/edges based on view mode
  const activeNodes = viewMode === 'file' ? fileNodes : layoutedModuleNodes

  // Update nodes with selection/highlight state
  const nodesWithState = useMemo(() => {
    if (viewMode !== 'module') {
      return activeNodes
    }

    return activeNodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        isSelected: node.id === selectedModule,
        isHighlighted: node.id === highlightedModule
      }
    }))
  }, [activeNodes, selectedModule, highlightedModule, viewMode])

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode)
    setIsSidePanelOpen(false)
    setSelectedModule(null)
    setFocusedModuleId(null)

    if (mode !== 'module') {
      onModuleSelect?.(null)
      onViewModeChange?.(mode)
      return
    }

    onViewModeChange?.(mode)
  }

  const handleModuleClick = useCallback(
    (_: unknown, node: Node) => {
      const moduleData = folders.find((f) => f.folderPath === node.id)
      setSelectedModule(node.id)
      setFocusedModuleId(node.id)
      setIsSidePanelOpen(true)
      onModuleSelect?.(node.id, moduleData)
    },
    [folders, onModuleSelect]
  )

  const handleShowAllModules = useCallback(() => {
    setSelectedModule(null)
    setFocusedModuleId(null)
    setIsSidePanelOpen(false)
    onModuleSelect?.(null)
    onViewModeChange?.('module')
  }, [onModuleSelect, onViewModeChange])

  const quality = useAdaptiveQuality(fileNodes.length)
  const [showMiniMap, setShowMiniMap] = useState(false)

  const layoutedNodes = useMemo(() => {
    if (isLayoutTransitioning || viewMode === 'module') {
      return [] // Empty during transition or in module view
    }

    const endMeasure = perfMonitor.startMeasure('graph-layout')

    try {
      return layoutNodes(fileNodes, fileEdges, layoutDirection, focusNodeId)
    } finally {
      endMeasure()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    fileNodes,
    fileEdges,
    layoutDirection,
    focusNodeId,
    isLayoutTransitioning,
    viewMode
  ])

  const nodesWithHover = useMemo(
    () =>
      layoutedNodes.map((node) => {
        const normalizedNodePath = normalizePath(
          node.data.fullPath
        ).toLowerCase()
        const normalizedHover = hoveredFile
          ? normalizePath(hoveredFile).toLowerCase()
          : null
        const normalizedHoverBasename = normalizedHover
          ? getBasename(normalizedHover).toLowerCase()
          : null
        const normalizedNodeBasename = getBasename(
          node.data.fullPath
        ).toLowerCase()

        const isHovered = Boolean(
          normalizedHover &&
          (normalizedHover === normalizedNodePath ||
            normalizedHoverBasename === normalizedNodeBasename)
        )

        return {
          ...node,
          data: {
            ...node.data,
            isHovered
          }
        }
      }),
    [layoutedNodes, hoveredFile]
  )

  const reactFlow = useReactFlow()

  // Apply animation quality to edges (only for file view)
  const qualityAdjustedEdges = useMemo(
    () =>
      fileEdges.map((edge) => ({
        ...edge,
        animated: quality.enableAnimations && edge.animated
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fileEdges, quality.enableAnimations]
  )

  const fitViewToGraph = useCallback(() => {
    if (layoutedNodes.length === 0) {
      return
    }
    reactFlow.fitView({
      padding: 0.2,
      duration: 400
    })
  }, [layoutedNodes, reactFlow])

  useEffect(() => {
    fitViewToGraph()
  }, [fitViewToGraph])

  const fitViewToModuleGraph = useCallback(() => {
    if (viewMode !== 'module') {
      return
    }
    setTimeout(() => {
      reactFlow.fitView({ padding: 0.25, duration: 400 })
    }, 50)
  }, [viewMode, reactFlow])

  useEffect(() => {
    if (viewMode === 'module' && !isModuleLoading) {
      fitViewToModuleGraph()
    }
  }, [layoutedModuleNodes, viewMode, isModuleLoading, fitViewToModuleGraph])

  // Keyboard shortcuts for zoom controls
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return
      }
      switch (event.key) {
        case '+':
        case '=':
          reactFlow.zoomIn({ duration: 150 })
          event.preventDefault()
          break
        case '-':
          reactFlow.zoomOut({ duration: 150 })
          event.preventDefault()
          break
        case '0':
          reactFlow.setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 150 })
          event.preventDefault()
          break
        case 'f':
        case 'F':
          reactFlow.fitView({ padding: 0.2, duration: 200 })
          event.preventDefault()
          break
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [reactFlow])

  const handleNodeClick = useCallback(
    (_: unknown, node: DependencyFlowNode) => {
      const targetFile = node.data?.fullPath ?? node.id
      onNodeClick?.(targetFile)
    },
    [onNodeClick]
  )

  // Show skeleton during transition (only for file view)
  if (
    viewMode === 'file' &&
    (isLayoutTransitioning || layoutedNodes.length === 0)
  ) {
    return (
      <div className="h-full flex items-center justify-center">
        <div
          className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"
          aria-label="Loading…"
        />
      </div>
    )
  }

  return (
    <div className="relative w-full h-full graph-container">
      {/* View Mode Toggle */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[100]">
        <ViewModeToggle mode={viewMode} onChange={handleViewModeChange} />
      </div>

      {/* Focus Mode Indicator & Reset */}
      {viewMode === 'module' && focusedModuleId && (
        <div className="absolute top-4 right-4 z-[100] flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[hsl(var(--primary))]/10 border border-[hsl(var(--primary))]/30">
            <span className="text-xs font-medium text-[hsl(var(--primary))]">
              ● Focus Mode
            </span>
          </div>
          <button
            onClick={handleShowAllModules}
            className="flex items-center gap-1.5 text-xs bg-[hsl(var(--card))] text-[hsl(var(--foreground))] border border-[hsl(var(--border))] px-3 py-1.5 rounded-md hover:bg-[hsl(var(--muted))] transition-colors font-medium"
          >
            Global Map
          </button>
        </div>
      )}

      {/* Global Map View Label */}
      {viewMode === 'module' && !focusedModuleId && (
        <div className="absolute top-4 right-4 z-[100]">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[hsl(var(--muted))] border border-[hsl(var(--border))]">
            <span className="text-xs text-[hsl(var(--muted-foreground))]">
              Global Map
            </span>
          </div>
        </div>
      )}

      {/* Side Panel dipindah ke App.tsx - dirender di luar komponen ini */}

      {/* Loading state untuk module view */}
      {viewMode === 'module' && isModuleLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[hsl(var(--background))]/80 z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[hsl(var(--primary))] border-t-transparent" />
        </div>
      )}

      <ReactFlow<DependencyFlowNode, DependencyFlowEdge>
        nodes={
          viewMode === 'file'
            ? nodesWithHover
            : (nodesWithState as DependencyFlowNode[])
        }
        edges={
          viewMode === 'file'
            ? qualityAdjustedEdges
            : (filteredModuleEdges as DependencyFlowEdge[])
        }
        onNodeClick={
          viewMode === 'module' ? handleModuleClick : handleNodeClick
        }
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={{
          type: ConnectionLineType.SimpleBezier,
          style: {
            stroke: 'hsl(var(--muted-foreground))',
            strokeWidth: 1.5,
            strokeOpacity: 0.75
          }
        }}
        fitView
        minZoom={0.1}
        maxZoom={2.5}
        nodesDraggable={false}
        nodesFocusable={true}
        elementsSelectable={false}
        nodesConnectable={false}
        edgesFocusable={false}
        onlyRenderVisibleElements={true}
        selectNodesOnDrag={false}
        preventScrolling={false}
        panOnDrag={true}
        panOnScroll={false}
        zoomOnScroll={true}
        selectionOnDrag={false}
        className="bg-[hsl(var(--canvas-background))]"
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={50}
          size={5}
          color="hsl(var(--muted-foreground) / 0.2)"
        />
        {showMiniMap && (
          <MiniMap
            pannable
            zoomable
            className="!bg-[hsl(var(--canvas-background))] border border-[hsl(var(--border))]"
            nodeStrokeColor={(n: DependencyFlowNode) =>
              n.data.direction === 'selected'
                ? 'hsl(var(--foreground))'
                : 'hsl(var(--muted-foreground))'
            }
            nodeColor={(n: DependencyFlowNode) =>
              n.data.direction === 'selected'
                ? 'hsl(var(--card))'
                : 'hsl(var(--muted))'
            }
          />
        )}
      </ReactFlow>

      <ZoomIndicator />

      <ZoomControls
        onZoomIn={() => reactFlow.zoomIn({ duration: 150 })}
        onZoomOut={() => reactFlow.zoomOut({ duration: 150 })}
        onReset={() =>
          reactFlow.setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 200 })
        }
        onFitToScreen={() => reactFlow.fitView({ padding: 0.2, duration: 200 })}
        showMiniMap={showMiniMap}
        onToggleMiniMap={() => setShowMiniMap((prev) => !prev)}
        layoutDirection={layoutDirection}
        onLayoutDirectionChange={onLayoutDirectionChange}
      />
    </div>
  )
}

export function DependencyGraph(props: DependencyGraphProps) {
  // Only show empty state for file view when there are no nodes
  // Module view uses its own data from useModuleGraph hook
  const isEmpty =
    props.initialViewMode !== 'module' &&
    (!props.nodes || props.nodes.length === 0)

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center gap-3 text-neutral-500 dark:text-neutral-400">
        <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">
          No dependencies for this file
        </h2>
        <p className="text-sm max-w-md">
          Select another file from the tree to see more complex import/export
          relationships.
        </p>
      </div>
    )
  }

  return (
    <ReactFlowProvider>
      <DependencyGraphInner {...props} />
    </ReactFlowProvider>
  )
}

export type { Node as DependencyNode, Edge as DependencyEdge }
