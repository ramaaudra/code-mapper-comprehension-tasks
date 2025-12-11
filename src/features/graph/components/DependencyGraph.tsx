import dagre from '@dagrejs/dagre'
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

  // Get quality from context or estimate based on data
  // For simplicity, we'll add conditional rendering based on badge count
  const shouldShowAllBadges = (data.badges?.length || 0) < 3

  const backgroundTone: Record<DependencyNodeData['direction'], string> = {
    selected:
      'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-400 dark:border-emerald-500',
    incoming:
      'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-500/60',
    outgoing:
      'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-500/60',
    placeholder:
      'bg-slate-50 dark:bg-slate-800/30 border-slate-300 dark:border-slate-700'
  }

  const chipTone: Record<DependencyNodeData['direction'], string> = {
    selected: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
    incoming: 'bg-blue-500/10 text-blue-600 dark:text-blue-300',
    outgoing: 'bg-amber-500/10 text-amber-600 dark:text-amber-300',
    placeholder: 'bg-slate-500/10 text-slate-600 dark:text-slate-300'
  }

  return (
    <div
      className={clsx(
        'rounded-xl border px-4 py-3 shadow-sm backdrop-blur-sm transition-colors duration-200',
        'text-left min-w-[220px] max-w-[280px] flex flex-col gap-2',
        backgroundTone[direction],
        data.isHovered &&
          'ring-2 ring-emerald-500/70 ring-offset-2 ring-offset-slate-900/0'
      )}
      tabIndex={0}
      role="button"
      aria-label={`Lihat detail untuk ${data.label}`}
      style={{ outline: 'none' }}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 break-words">
            {data.label}
          </div>
          {data.subtitle && (
            <div className="text-[11px] uppercase tracking-wide font-medium text-slate-500 dark:text-slate-400">
              {data.subtitle}
            </div>
          )}
        </div>
        <div
          className={clsx(
            'text-[11px] px-2 py-1 rounded-full font-semibold uppercase tracking-wide',
            chipTone[direction]
          )}
        >
          {direction === 'selected'
            ? 'Focus'
            : direction === 'incoming'
              ? 'Importer'
              : direction === 'outgoing'
                ? 'Dependency'
                : 'Info'}
        </div>
      </div>

      <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
        <div className="truncate" title={data.fullPath}>
          {data.fullPath}
        </div>
      </div>

      {data.badges && data.badges.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {(shouldShowAllBadges ? data.badges : data.badges.slice(0, 2)).map(
            (badge) => (
              <span
                key={`${badge.label}-${badge.tone}`}
                className={clsx(
                  'text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full',
                  badge.tone === 'danger' &&
                    'bg-red-500/10 text-red-600 dark:text-red-300',
                  badge.tone === 'warning' &&
                    'bg-amber-500/10 text-amber-600 dark:text-amber-300',
                  badge.tone === 'success' &&
                    'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
                  badge.tone === 'info' &&
                    'bg-blue-500/10 text-blue-600 dark:text-blue-300'
                )}
              >
                {badge.label}
              </span>
            )
          )}
          {!shouldShowAllBadges && data.badges.length > 2 && (
            <span className="text-[10px] text-slate-500">
              +{data.badges.length - 2}
            </span>
          )}
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
        defaultEdgeOptions={{ type: ConnectionLineType.SimpleBezier }}
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
        className="bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={16}
          size={1}
          className="opacity-40"
        />
        <MiniMap
          pannable
          zoomable
          className="!bg-white/80 dark:!bg-slate-900/70 backdrop-blur-md"
          nodeStrokeColor={(n: DependencyFlowNode) =>
            n.data.direction === 'selected'
              ? '#059669'
              : n.data.direction === 'incoming'
                ? '#2563eb'
                : n.data.direction === 'outgoing'
                  ? '#d97706'
                  : '#64748b'
          }
          nodeColor={(n: DependencyFlowNode) =>
            n.data.direction === 'selected'
              ? '#bbf7d0'
              : n.data.direction === 'incoming'
                ? '#dbeafe'
                : n.data.direction === 'outgoing'
                  ? '#fef3c7'
                  : '#e2e8f0'
          }
        />
      </ReactFlow>

      <ZoomIndicator />

      <ZoomControls
        onZoomIn={() => reactFlow.zoomIn({ duration: 150 })}
        onZoomOut={() => reactFlow.zoomOut({ duration: 150 })}
        onReset={() =>
          reactFlow.setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 200 })
        }
        onFitToScreen={() => reactFlow.fitView({ padding: 0.2, duration: 200 })}
      />
    </div>
  )
}

export function DependencyGraph(props: DependencyGraphProps) {
  if (!props.nodes.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center gap-3 text-slate-500 dark:text-slate-400">
        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-100">
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
