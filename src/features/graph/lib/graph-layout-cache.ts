import { normalizePath } from '@/shared/lib/utils'

import type { ModuleGraphEdge, ModuleGraphNode } from '../hooks/useModuleGraph'
import type {
  DependencyFlowEdge,
  DependencyFlowNode,
  LayoutDirection
} from '../types/graph'

interface FileLayoutCacheKeyInput {
  nodes: DependencyFlowNode[]
  edges: DependencyFlowEdge[]
  layoutDirection: LayoutDirection
  focusNodeId: string | null
}

interface ModuleLayoutCacheKeyInput {
  nodes: ModuleGraphNode[]
  edges: ModuleGraphEdge[]
  layoutDirection: LayoutDirection
  focusedModuleId: string | null
}

function createEdgeSignature(
  edges: Array<{
    source: string
    target: string
  }>
): string {
  return edges
    .map(
      (edge) => `${normalizePath(edge.source)}->${normalizePath(edge.target)}`
    )
    .sort()
    .join('|')
}

export function createFileLayoutCacheKey({
  nodes,
  edges,
  layoutDirection,
  focusNodeId
}: FileLayoutCacheKeyInput): string {
  const nodeSignature = nodes
    .map((node) => {
      const subtitle =
        typeof node.data.subtitle === 'string' ? node.data.subtitle : ''
      const hotspotStatus =
        typeof node.data.hotspotStatus === 'string'
          ? node.data.hotspotStatus
          : ''
      const badgeCount = node.data.badges?.length ?? 0

      return [
        normalizePath(node.id),
        normalizePath(node.data.fullPath),
        subtitle,
        hotspotStatus,
        String(badgeCount)
      ].join(':')
    })
    .sort()
    .join('|')

  return [
    'file',
    layoutDirection,
    focusNodeId ? normalizePath(focusNodeId) : 'none',
    nodeSignature,
    createEdgeSignature(edges)
  ].join('::')
}

export function createModuleLayoutCacheKey({
  nodes,
  edges,
  layoutDirection,
  focusedModuleId
}: ModuleLayoutCacheKeyInput): string {
  const nodeSignature = nodes
    .map((node) => normalizePath(node.id))
    .sort()
    .join('|')

  return [
    'module',
    layoutDirection,
    focusedModuleId ? normalizePath(focusedModuleId) : 'overview',
    nodeSignature,
    createEdgeSignature(edges)
  ].join('::')
}
