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
  useEdgesState,
  useNodesState,
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

import { perfMonitor } from '@/shared/lib/utils/perfMonitor'

import { useAdaptiveQuality } from '../hooks/useAdaptiveQuality'
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
  onNodeClick?: (fileId: string) => void
  isLayoutTransitioning?: boolean
}

const dagreDefaults = {
  ranksep: 200,
  nodesep: 140,
  edgesep: 80,
  marginx: 60,
  marginy: 60
}

const normalizePath = (value: string) => value.replace(/\\/g, '/')

const getBasename = (filePath: string) => {
  const normalized = normalizePath(filePath)
  const segments = normalized.split('/')
  return segments[segments.length - 1]
}

// Helper function to get icon based on file extension
const getFileIcon = (fileName: string) => {
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
  const label =
    percentage < 75 ? 'Wide view' : percentage > 175 ? 'Close view' : 'Normal'

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

  return (
    <div
      className={clsx(
        'relative rounded-lg border px-4 py-3 transition-all duration-200',
        'text-left min-w-[220px] max-w-[280px] flex flex-col gap-2',
        backgroundTone[direction],
        data.isHovered && '!border-[hsl(var(--node-hover-border))] shadow-md'
      )}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${data.label}`}
      style={{ outline: 'none' }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {(() => {
            const FileIcon = getFileIcon(data.label)
            return <FileIcon size={16} className="shrink-0 text-muted-foreground" />
          })()}
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
          {direction === 'selected'
            ? 'Focus'
            : direction === 'incoming'
              ? 'In'
              : direction === 'outgoing'
                ? 'Out'
                : 'Info'}
        </div>
      </div>

      <div className="text-xs text-muted-foreground leading-relaxed">
        <div className="truncate" title={data.fullPath}>
          {data.fullPath}
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
  dependency: dependencyNode as unknown as ComponentType<NodeProps>
}

function DependencyGraphInner({
  nodes,
  edges,
  focusNodeId,
  hoveredFile,
  layoutDirection,
  onNodeClick,
  isLayoutTransitioning = false
}: DependencyGraphProps) {
  const quality = useAdaptiveQuality(nodes.length)
  const [showMiniMap, setShowMiniMap] = useState(false)

  const layoutedNodes = useMemo(() => {
    if (isLayoutTransitioning) {
      return [] // Empty during transition
    }

    const endMeasure = perfMonitor.startMeasure('graph-layout')

    try {
      return layoutNodes(nodes, edges, layoutDirection, focusNodeId)
    } finally {
      endMeasure()
    }
  }, [nodes, edges, layoutDirection, focusNodeId, isLayoutTransitioning])

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

  const [flowNodes, setNodes, onNodesChange] =
    useNodesState<DependencyFlowNode>(nodesWithHover)
  const [flowEdges, setEdges, onEdgesChange] =
    useEdgesState<DependencyFlowEdge>(edges)
  const reactFlow = useReactFlow()

  // Apply to edges
  const qualityAdjustedEdges = useMemo(
    () =>
      flowEdges.map((edge) => ({
        ...edge,
        animated: quality.enableAnimations && edge.animated
      })),
    [flowEdges, quality.enableAnimations]
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
    setNodes(nodesWithHover)
  }, [nodesWithHover, setNodes])

  useEffect(() => {
    setEdges(edges)
  }, [edges, setEdges])

  useEffect(() => {
    fitViewToGraph()
  }, [fitViewToGraph])

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

  // Show skeleton during transition
  if (isLayoutTransitioning || layoutedNodes.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="relative w-full h-full graph-container">
      <ReactFlow<DependencyFlowNode, DependencyFlowEdge>
        nodes={flowNodes}
        edges={qualityAdjustedEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={{
          type: ConnectionLineType.SimpleBezier,
          style: { stroke: '#737373', strokeWidth: 1.5, strokeOpacity: 0.75 }
        }}
        fitView
        minZoom={0.1}
        maxZoom={2.5}
        nodesDraggable={false}
        nodesFocusable={false}
        elementsSelectable={false}
        nodesConnectable={false}
        edgesFocusable={false}
        onlyRenderVisibleElements={true}
        selectNodesOnDrag={false}
        preventScrolling={false}
        panOnDrag
        panOnScroll
        selectionOnDrag={false}
        className="bg-[hsl(var(--canvas-background))]"
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
                ? '#e5e5e5'
                : n.data.direction === 'incoming'
                  ? '#a3a3a3'
                  : n.data.direction === 'outgoing'
                    ? '#737373'
                    : '#525252'
            }
            nodeColor={(n: DependencyFlowNode) =>
              n.data.direction === 'selected'
                ? '#fafafa'
                : n.data.direction === 'incoming'
                  ? '#d4d4d4'
                  : n.data.direction === 'outgoing'
                    ? '#a3a3a3'
                    : '#737373'
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
      />
    </div>
  )
}

export function DependencyGraph(props: DependencyGraphProps) {
  if (!props.nodes.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center gap-3 text-neutral-500 dark:text-neutral-400">
        <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">
          Tidak ada dependensi untuk file ini
        </h2>
        <p className="text-sm max-w-md">
          Pilih file lain dari tree untuk melihat hubungan import/export yang
          lebih kompleks.
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
