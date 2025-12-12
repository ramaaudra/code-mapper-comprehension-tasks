import type { Edge, Node } from '@xyflow/react'

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
  // Simplified mode for large graph optimization
  isSimplified?: boolean
}

export interface DependencyEdgeData extends Record<string, unknown> {
  strength: number
  direction: 'incoming' | 'outgoing'
}

export type DependencyFlowNode = Node<DependencyNodeData>
export type DependencyFlowEdge = Edge<DependencyEdgeData>

export type LayoutDirection = 'TB' | 'LR'

export interface DependencyGraphData {
  nodes: DependencyFlowNode[]
  edges: DependencyFlowEdge[]
  focusNodeId: string | null
}
