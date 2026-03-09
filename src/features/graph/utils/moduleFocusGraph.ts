import { Position } from '@xyflow/react'

import type { ModuleGraphEdge, ModuleGraphNode } from '../hooks/useModuleGraph'
import type { LayoutDirection } from '../types/graph'
import type { ModuleRelationToFocus } from './moduleAggregation'

const MODULE_NODE_WIDTH = 300
const MODULE_NODE_HEIGHT = 140
const HORIZONTAL_LANE_OFFSET = 430
const VERTICAL_LANE_OFFSET = 300
const LANE_GAP = 190

function toTopLeftPosition(centerX: number, centerY: number) {
  return {
    x: centerX - MODULE_NODE_WIDTH / 2,
    y: centerY - MODULE_NODE_HEIGHT / 2
  }
}

function getCenteredOffsets(count: number, gap: number) {
  if (count === 0) {
    return []
  }

  const totalSpan = (count - 1) * gap
  return Array.from(
    { length: count },
    (_, index) => index * gap - totalSpan / 2
  )
}

function mergeRelation(
  current: ModuleRelationToFocus | undefined,
  next: Exclude<ModuleRelationToFocus, 'focus' | 'overview'>
): ModuleRelationToFocus {
  if (!current || current === 'overview') {
    return next
  }

  if (current === next || current === 'focus') {
    return current
  }

  return 'bidirectional'
}

function getConnectionWeight(
  nodeId: string,
  focusNodeId: string,
  edges: ModuleGraphEdge[]
) {
  return edges.reduce((total, edge) => {
    const isDirectConnection =
      (edge.source === focusNodeId && edge.target === nodeId) ||
      (edge.target === focusNodeId && edge.source === nodeId)

    if (!isDirectConnection) {
      return total
    }

    return total + (edge.data?.weight ?? 1)
  }, 0)
}

function sortByConnectionStrength(
  focusNodeId: string,
  edges: ModuleGraphEdge[],
  left: ModuleGraphNode,
  right: ModuleGraphNode
) {
  const weightDelta =
    getConnectionWeight(right.id, focusNodeId, edges) -
    getConnectionWeight(left.id, focusNodeId, edges)

  if (weightDelta !== 0) {
    return weightDelta
  }

  const leftLabel =
    left.data.folderPath.split('/').pop() ?? left.data.folderPath
  const rightLabel =
    right.data.folderPath.split('/').pop() ?? right.data.folderPath

  return leftLabel.localeCompare(rightLabel)
}

export function createModuleRelationMap(
  focusNodeId: string,
  edges: ModuleGraphEdge[]
) {
  const relationMap = new Map<string, ModuleRelationToFocus>()
  relationMap.set(focusNodeId, 'focus')

  edges.forEach((edge) => {
    if (edge.source === focusNodeId) {
      relationMap.set(
        edge.target,
        mergeRelation(relationMap.get(edge.target), 'outgoing')
      )
    }

    if (edge.target === focusNodeId) {
      relationMap.set(
        edge.source,
        mergeRelation(relationMap.get(edge.source), 'incoming')
      )
    }
  })

  return relationMap
}

export function layoutFocusedModuleNodes(
  nodes: ModuleGraphNode[],
  edges: ModuleGraphEdge[],
  focusNodeId: string,
  layoutDirection: LayoutDirection
) {
  const relationMap = createModuleRelationMap(focusNodeId, edges)

  const focusNode = nodes.find((node) => node.id === focusNodeId)
  if (!focusNode) {
    return nodes
  }

  const incomingNodes: ModuleGraphNode[] = []
  const outgoingNodes: ModuleGraphNode[] = []

  nodes.forEach((node) => {
    if (node.id === focusNodeId) {
      return
    }

    const relation = relationMap.get(node.id)
    if (relation === 'incoming') {
      incomingNodes.push(node)
      return
    }

    if (relation === 'outgoing' || relation === 'bidirectional') {
      outgoingNodes.push(node)
    }
  })

  incomingNodes.sort((left, right) =>
    sortByConnectionStrength(focusNodeId, edges, left, right)
  )
  outgoingNodes.sort((left, right) =>
    sortByConnectionStrength(focusNodeId, edges, left, right)
  )

  const positionedNodes = new Map<string, { x: number; y: number }>()
  positionedNodes.set(focusNodeId, toTopLeftPosition(0, 0))

  if (layoutDirection === 'TB') {
    const incomingOffsets = getCenteredOffsets(incomingNodes.length, LANE_GAP)
    const outgoingOffsets = getCenteredOffsets(outgoingNodes.length, LANE_GAP)

    incomingNodes.forEach((node, index) => {
      positionedNodes.set(
        node.id,
        toTopLeftPosition(incomingOffsets[index] ?? 0, -VERTICAL_LANE_OFFSET)
      )
    })

    outgoingNodes.forEach((node, index) => {
      positionedNodes.set(
        node.id,
        toTopLeftPosition(outgoingOffsets[index] ?? 0, VERTICAL_LANE_OFFSET)
      )
    })
  } else {
    const incomingOffsets = getCenteredOffsets(incomingNodes.length, LANE_GAP)
    const outgoingOffsets = getCenteredOffsets(outgoingNodes.length, LANE_GAP)

    incomingNodes.forEach((node, index) => {
      positionedNodes.set(
        node.id,
        toTopLeftPosition(-HORIZONTAL_LANE_OFFSET, incomingOffsets[index] ?? 0)
      )
    })

    outgoingNodes.forEach((node, index) => {
      positionedNodes.set(
        node.id,
        toTopLeftPosition(HORIZONTAL_LANE_OFFSET, outgoingOffsets[index] ?? 0)
      )
    })
  }

  return nodes.map((node) => {
    const position = positionedNodes.get(node.id)

    return {
      ...node,
      position: position ?? node.position,
      sourcePosition:
        layoutDirection === 'LR' ? Position.Right : Position.Bottom,
      targetPosition: layoutDirection === 'LR' ? Position.Left : Position.Top
    }
  })
}
