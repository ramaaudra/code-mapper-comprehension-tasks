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
  MapTrifold,
  Warning
} from '@phosphor-icons/react'
import {
  Background,
  BackgroundVariant,
  ConnectionLineType,
  Handle,
  MarkerType,
  MiniMap,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  useStore
} from '@xyflow/react'
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

import { getRelativePath } from '@/shared/lib/utils'
import '@xyflow/react/dist/style.css'
import { perfMonitor } from '@/shared/lib/utils/perfMonitor'

import { useAdaptiveQuality } from '../hooks/useAdaptiveQuality'
import { useModuleGraph } from '../hooks/useModuleGraph'
import {
  createModuleRelationMap,
  layoutFocusedModuleNodes
} from '../utils/moduleFocusGraph'
import { AggregatedEdge } from './AggregatedEdge'
import { ModuleNodeComponent } from './ModuleNode'
import { type ViewMode, ViewModeToggle } from './ViewModeToggle'
import { ZoomControls } from './ZoomControls'

import type { ModuleGraphEdge, ModuleGraphNode } from '../hooks/useModuleGraph'
import type { FolderArchitectureMetrics } from '@/features/architecture/types/architecture'
import type { Edge, EdgeTypes, Node, NodeProps, NodeTypes } from '@xyflow/react'

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
  nodes: ModuleGraphNode[],
  edges: ModuleGraphEdge[],
  layoutDirection: 'LR' | 'TB',
  focusedModuleId?: string | null
): ModuleGraphNode[] {
  if (nodes.length === 0) {
    return nodes
  }

  if (focusedModuleId) {
    return layoutFocusedModuleNodes(
      nodes,
      edges,
      focusedModuleId,
      layoutDirection
    )
  }

  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))
  dagreGraph.setGraph({
    rankdir: layoutDirection,
    ...moduleLayoutDefaults.overview
  })

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
    <div className='absolute left-4 top-4 z-20 rounded-md bg-black/70 px-3 py-1 font-mono text-sm text-white shadow-lg'>
      {percentage}%<div className='mt-1 text-xs opacity-75'>{label}</div>
    </div>
  )
}

function DependencyNodeComponent(props: NodeProps<DependencyFlowNode>) {
  const data = (props.data ?? {}) as DependencyNodeData
  const direction = (data.direction ??
    'placeholder') as DependencyNodeData['direction']

  const backgroundTone: Record<DependencyNodeData['direction'], string> = {
    selected:
      'border-[hsl(var(--primary))] bg-[hsl(var(--card))] ring-2 ring-[hsl(var(--primary))]/20 shadow-lg shadow-[hsl(var(--primary))]/10',
    incoming: 'border-[hsl(var(--border))] bg-[hsl(var(--card))]',
    outgoing: 'border-[hsl(var(--border))] bg-[hsl(var(--card))]',
    placeholder: 'border-[hsl(var(--border))] bg-[hsl(var(--card))]'
  }

  const chipTone: Record<DependencyNodeData['direction'], string> = {
    selected:
      'border-[hsl(var(--primary))]/25 bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]',
    incoming:
      'border-[hsl(var(--border))] bg-[hsl(var(--muted))]/70 text-[hsl(var(--muted-foreground))]',
    outgoing:
      'border-[hsl(var(--border))] bg-[hsl(var(--muted))]/70 text-[hsl(var(--muted-foreground))]',
    placeholder:
      'border-[hsl(var(--border))] bg-[hsl(var(--muted))]/70 text-[hsl(var(--muted-foreground))]'
  }

  const chipLabel: Record<DependencyNodeData['direction'], string> = {
    selected: 'Focus',
    incoming: 'Dependent',
    outgoing: 'Dependency',
    placeholder: 'Info'
  }

  const iconTone: Record<DependencyNodeData['direction'], string> = {
    selected: 'bg-[hsl(var(--primary))]/12 text-[hsl(var(--primary))]',
    incoming: 'bg-[hsl(var(--muted))]/70 text-[hsl(var(--muted-foreground))]',
    outgoing: 'bg-[hsl(var(--muted))]/70 text-[hsl(var(--muted-foreground))]',
    placeholder: 'bg-[hsl(var(--muted))]/70 text-[hsl(var(--muted-foreground))]'
  }

  const FileIcon = getFileIcon(data.label)

  return (
    <button
      type='button'
      className={clsx(
        'relative flex min-w-[240px] max-w-[300px] flex-col gap-3 rounded-xl border px-4 py-3.5 text-left shadow-sm transition-all duration-200',
        backgroundTone[direction],
        !data.isHovered &&
          direction !== 'selected' &&
          'hover:border-[hsl(var(--primary))] hover:shadow-md',
        data.isHovered &&
          '!border-[hsl(var(--primary))] shadow-md shadow-[hsl(var(--primary))]/10',
        'focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2'
      )}
      aria-label={`View details for ${data.label}`}
    >
      <div className='flex items-center justify-between gap-3'>
        <div className='flex items-center gap-2'>
          <div
            className={clsx(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
              iconTone[direction]
            )}
          >
            <FileIcon size={18} className='shrink-0' />
          </div>
          <div className='min-w-0'>
            <div className='break-words text-sm font-semibold text-[hsl(var(--foreground))]'>
              {data.label}
            </div>
            <div
              className='truncate text-xs text-[hsl(var(--muted-foreground))]'
              title={data.fullPath}
            >
              {getRelativePath(data.fullPath)}
            </div>
          </div>
        </div>
        <div
          className={clsx(
            'rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide',
            chipTone[direction]
          )}
        >
          {chipLabel[direction]}
        </div>
      </div>

      {data.subtitle && (
        <div className='rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/45 px-3 py-2'>
          <div className='text-[11px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--primary))]'>
            {chipLabel[direction]}
          </div>
          <p className='mt-1 text-xs leading-relaxed text-[hsl(var(--muted-foreground))]'>
            {data.subtitle}
          </p>
        </div>
      )}

      {/* Risk Badges */}
      {data.badges && data.badges.length > 0 && (
        <div className='mt-1 flex flex-wrap gap-1'>
          {data.badges.map((badge, idx) => {
            const badgeStyles: Record<typeof badge.tone, string> = {
              danger:
                'border-[hsl(var(--destructive))]/25 bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive-foreground))]',
              warning:
                'border-[hsl(var(--border))] bg-[hsl(var(--muted))]/75 text-[hsl(var(--foreground))]',
              success:
                'border-[hsl(var(--border))] bg-[hsl(var(--muted))]/75 text-[hsl(var(--foreground))]',
              info: 'border-[hsl(var(--border))] bg-[hsl(var(--muted))]/75 text-[hsl(var(--muted-foreground))]'
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
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
                  'border transition-all duration-200',
                  badgeStyles[badge.tone]
                )}
                title={badge.label}
              >
                <BadgeIcon size={12} weight='fill' />
                <span className='uppercase tracking-wide'>{badge.label}</span>
              </div>
            )
          })}
        </div>
      )}

      <Handle
        type='target'
        position={Position.Left}
        style={{ opacity: 0, width: 12, height: 12, pointerEvents: 'none' }}
      />
      <Handle
        type='target'
        position={Position.Top}
        style={{ opacity: 0, width: 12, height: 12, pointerEvents: 'none' }}
      />
      <Handle
        type='source'
        position={Position.Right}
        style={{ opacity: 0, width: 12, height: 12, pointerEvents: 'none' }}
      />
      <Handle
        type='source'
        position={Position.Bottom}
        style={{ opacity: 0, width: 12, height: 12, pointerEvents: 'none' }}
      />
    </button>
  )
}

const dependencyNode = memo(DependencyNodeComponent)

const nodeTypes: NodeTypes = {
  dependency: dependencyNode as unknown as ComponentType<NodeProps>,
  module: ModuleNodeComponent as unknown as ComponentType<NodeProps>
}

const edgeTypes: EdgeTypes = {
  aggregated: AggregatedEdge
}

const moduleEdgeMarker = {
  type: MarkerType.ArrowClosed,
  color: 'hsl(var(--primary))'
} as const

function withModuleEdgePresentation(
  edge: ModuleGraphEdge,
  options: { isFocusEdge: boolean; showLabel: boolean }
): ModuleGraphEdge {
  const edgeData = edge.data ?? {
    source: edge.source,
    target: edge.target,
    weight: 1
  }

  return {
    ...edge,
    data: {
      source: edgeData.source,
      target: edgeData.target,
      weight: edgeData.weight,
      isFocusEdge: options.isFocusEdge,
      showLabel: options.showLabel
    },
    markerEnd: moduleEdgeMarker
  }
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
      return moduleEdges.map((edge) =>
        withModuleEdgePresentation(edge, {
          isFocusEdge: false,
          showLabel: false
        })
      )
    }

    return moduleEdges
      .filter(
        (edge) =>
          edge.source === focusedModuleId || edge.target === focusedModuleId
      )
      .map((edge) =>
        withModuleEdgePresentation(edge, {
          isFocusEdge: true,
          showLabel: true
        })
      )
  }, [moduleEdges, focusedModuleId])

  const moduleRelationMap = useMemo(() => {
    if (!focusedModuleId) {
      return new Map()
    }

    return createModuleRelationMap(focusedModuleId, filteredModuleEdges)
  }, [filteredModuleEdges, focusedModuleId])

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
        focusedModuleId
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
        isHighlighted: node.id === highlightedModule,
        isFocusContext: Boolean(focusedModuleId),
        relationToFocus: moduleRelationMap.get(node.id) ?? 'overview'
      }
    }))
  }, [
    activeNodes,
    focusedModuleId,
    highlightedModule,
    moduleRelationMap,
    selectedModule,
    viewMode
  ])

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
      <div className='flex h-full items-center justify-center'>
        <div
          className='h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent'
          aria-label='Loading…'
        />
      </div>
    )
  }

  return (
    <div className='graph-container relative h-full w-full'>
      <div className='pointer-events-none absolute inset-x-3 top-3 z-[100] sm:inset-x-4 sm:top-4'>
        <div className='grid w-full grid-cols-[1fr_auto_1fr] items-start gap-2 sm:gap-3'>
          <div />

          <div className='pointer-events-auto justify-self-center'>
            <ViewModeToggle mode={viewMode} onChange={handleViewModeChange} />
          </div>

          <div className='pointer-events-auto justify-self-end'>
            {viewMode === 'module' && focusedModuleId ? (
              <button
                onClick={handleShowAllModules}
                className='flex items-center gap-1.5 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-2.5 py-1.5 text-xs font-medium text-[hsl(var(--foreground))] shadow-sm transition-colors hover:bg-[hsl(var(--muted))] sm:px-3'
              >
                <MapTrifold size={14} />
                <span className='hidden sm:inline'>Global Map</span>
                <span className='sm:hidden'>Map</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Side Panel dipindah ke App.tsx - dirender di luar komponen ini */}

      {/* Loading state untuk module view */}
      {viewMode === 'module' && isModuleLoading && (
        <div className='absolute inset-0 z-10 flex items-center justify-center bg-[hsl(var(--background))]/80'>
          <div className='h-12 w-12 animate-spin rounded-full border-4 border-[hsl(var(--primary))] border-t-transparent' />
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
        className='bg-[hsl(var(--canvas-background))]'
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={50}
          size={5}
          color='hsl(var(--muted-foreground) / 0.2)'
        />
        {showMiniMap && (
          <MiniMap
            pannable
            zoomable
            className='border border-[hsl(var(--border))] !bg-[hsl(var(--canvas-background))]'
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
      <div className='flex h-full flex-col items-center justify-center gap-3 text-center text-neutral-500 dark:text-neutral-400'>
        <h2 className='text-lg font-semibold text-[hsl(var(--foreground))]'>
          No dependencies for this file
        </h2>
        <p className='max-w-md text-sm'>
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
