import type { CycleGraphEdge, CycleTriageItem } from '../types/cycle-triage'

export interface CycleGraphNodeModel {
  filePath: string
  x: number
  y: number
  isCycleNode: boolean
}

export interface CycleGraphEdgeModel extends CycleGraphEdge {
  path: string
  labelX: number
  labelY: number
}

export interface CycleGraphRouteLabel {
  source: string
  target: string
  label: string
}

export interface CycleGraphModel {
  width: number
  height: number
  nodes: CycleGraphNodeModel[]
  cycleEdges: CycleGraphEdgeModel[]
  nearbyEdges: CycleGraphEdgeModel[]
  cycleRouteLabels: CycleGraphRouteLabel[]
  importsIntoLoop: CycleGraphRouteLabel[]
  importsFromLoop: CycleGraphRouteLabel[]
  recommendedRouteLabel?: string
  visibleNearbyCount: number
  hiddenNearbyCount: number
}

const GRAPH_WIDTH = 640
const GRAPH_HEIGHT = 360
const CENTER_X = GRAPH_WIDTH / 2
const CENTER_Y = GRAPH_HEIGHT / 2
export const CYCLE_GRAPH_NODE_WIDTH = 140
export const CYCLE_GRAPH_NODE_HEIGHT = 40
const MAX_TWO_NODE_NEARBY_FILES = 4
const MAX_MULTI_NODE_NEARBY_FILES = 6
const MULTI_NODE_EDGE_GAP = 10

function getBasename(filePath: string): string {
  const segments = filePath.replace(/\\/g, '/').split('/')
  return segments[segments.length - 1] || filePath
}

function buildRouteLabel(edge: CycleGraphEdge): CycleGraphRouteLabel {
  return {
    source: edge.source,
    target: edge.target,
    label: `${getBasename(edge.source)} -> ${getBasename(edge.target)}`
  }
}

function createRingPositions(
  files: string[],
  radius: number,
  offsetAngle = -Math.PI / 2
): CycleGraphNodeModel[] {
  const count = Math.max(files.length, 1)

  return files.map((filePath, index) => {
    const angle = offsetAngle + (index / count) * Math.PI * 2
    return {
      filePath,
      x: CENTER_X + radius * Math.cos(angle),
      y: CENTER_Y + radius * Math.sin(angle),
      isCycleNode: radius < 170
    }
  })
}

function buildTwoNodeCycleNodes(files: string[]): CycleGraphNodeModel[] {
  return [
    {
      filePath: files[0] ?? '',
      x: CENTER_X - 176,
      y: CENTER_Y,
      isCycleNode: true
    },
    {
      filePath: files[1] ?? '',
      x: CENTER_X + 176,
      y: CENTER_Y,
      isCycleNode: true
    }
  ]
}

function getNodeBoundaryDistance(unitX: number, unitY: number) {
  const horizontalDistance =
    Math.abs(unitX) > Number.EPSILON
      ? CYCLE_GRAPH_NODE_WIDTH / 2 / Math.abs(unitX)
      : Number.POSITIVE_INFINITY
  const verticalDistance =
    Math.abs(unitY) > Number.EPSILON
      ? CYCLE_GRAPH_NODE_HEIGHT / 2 / Math.abs(unitY)
      : Number.POSITIVE_INFINITY

  return Math.min(horizontalDistance, verticalDistance)
}

function projectPointFromNodeCenter(params: {
  node: CycleGraphNodeModel
  unitX: number
  unitY: number
  gap?: number
}) {
  const { node, unitX, unitY, gap = 0 } = params
  const distance = getNodeBoundaryDistance(unitX, unitY) + gap

  return {
    x: node.x + unitX * distance,
    y: node.y + unitY * distance
  }
}

function rankNearbyFiles(item: CycleTriageItem): string[] {
  const cycleFiles = new Set(item.files)
  const connectionCounts = new Map<string, number>()

  item.neighborEdges.forEach((edge) => {
    const externalFile = cycleFiles.has(edge.source) ? edge.target : edge.source
    connectionCounts.set(
      externalFile,
      (connectionCounts.get(externalFile) ?? 0) + 1
    )
  })

  return [...item.nearbyFiles].sort((fileA, fileB) => {
    const countDifference =
      (connectionCounts.get(fileB) ?? 0) - (connectionCounts.get(fileA) ?? 0)

    if (countDifference !== 0) {
      return countDifference
    }

    return fileA.localeCompare(fileB)
  })
}

function resolveVisibleNearbyFiles(item: CycleTriageItem): string[] {
  const rankedFiles = rankNearbyFiles(item)
  const limit =
    item.files.length === 2
      ? MAX_TWO_NODE_NEARBY_FILES
      : MAX_MULTI_NODE_NEARBY_FILES

  return rankedFiles.slice(0, limit)
}

function buildNodeMap(item: CycleTriageItem): Map<string, CycleGraphNodeModel> {
  const cycleNodes =
    item.files.length === 2
      ? buildTwoNodeCycleNodes(item.files)
      : createRingPositions(item.files, 118)
  const nodeMap = new Map(cycleNodes.map((node) => [node.filePath, node]))

  return nodeMap
}

function buildVisibleNearbyRouteGroups(params: {
  item: CycleTriageItem
  visibleNearbyFiles: string[]
}): {
  importsIntoLoop: CycleGraphRouteLabel[]
  importsFromLoop: CycleGraphRouteLabel[]
} {
  const { item, visibleNearbyFiles } = params
  const visibleNearbySet = new Set(visibleNearbyFiles)
  const importsIntoLoop = item.neighborEdges
    .filter(
      (edge) =>
        visibleNearbySet.has(edge.source) && item.files.includes(edge.target)
    )
    .map(buildRouteLabel)
    .sort((routeA, routeB) => routeA.label.localeCompare(routeB.label))
  const importsFromLoop = item.neighborEdges
    .filter(
      (edge) =>
        item.files.includes(edge.source) && visibleNearbySet.has(edge.target)
    )
    .map(buildRouteLabel)
    .sort((routeA, routeB) => routeA.label.localeCompare(routeB.label))

  return {
    importsIntoLoop,
    importsFromLoop
  }
}

function buildCurvedEdge(
  edge: CycleGraphEdge,
  source: CycleGraphNodeModel,
  target: CycleGraphNodeModel
): CycleGraphEdgeModel {
  const horizontalDirection = source.x < target.x ? 1 : -1
  const isTopRoute = horizontalDirection === 1
  const startX =
    horizontalDirection === 1
      ? source.x + CYCLE_GRAPH_NODE_WIDTH / 2
      : source.x - CYCLE_GRAPH_NODE_WIDTH / 2
  const endX =
    horizontalDirection === 1
      ? target.x - CYCLE_GRAPH_NODE_WIDTH / 2
      : target.x + CYCLE_GRAPH_NODE_WIDTH / 2
  const y = source.y + (isTopRoute ? -10 : 10)

  return {
    ...edge,
    path: `M ${startX} ${y} A 144 112 0 0 1 ${endX} ${y}`,
    labelX: CENTER_X,
    labelY: CENTER_Y + (isTopRoute ? -122 : 122)
  }
}

function buildLineEdge(
  edge: CycleGraphEdge,
  source: CycleGraphNodeModel,
  target: CycleGraphNodeModel
): CycleGraphEdgeModel {
  const dx = target.x - source.x
  const dy = target.y - source.y
  const length = Math.hypot(dx, dy)

  if (length <= Number.EPSILON) {
    return {
      ...edge,
      path: `M ${source.x} ${source.y} L ${target.x} ${target.y}`,
      labelX: source.x,
      labelY: source.y
    }
  }

  const unitX = dx / length
  const unitY = dy / length
  const start = projectPointFromNodeCenter({
    node: source,
    unitX,
    unitY,
    gap: MULTI_NODE_EDGE_GAP / 2
  })
  const end = projectPointFromNodeCenter({
    node: target,
    unitX: -unitX,
    unitY: -unitY,
    gap: MULTI_NODE_EDGE_GAP
  })
  const midX = (start.x + end.x) / 2
  const midY = (start.y + end.y) / 2

  return {
    ...edge,
    path: `M ${start.x} ${start.y} L ${end.x} ${end.y}`,
    labelX: midX,
    labelY: midY
  }
}

export function buildCycleGraphModel(params: {
  item: CycleTriageItem
  showNearbyDependents: boolean
}): CycleGraphModel {
  const { item, showNearbyDependents } = params
  const visibleNearbyFiles = showNearbyDependents
    ? resolveVisibleNearbyFiles(item)
    : []
  const nodeMap = buildNodeMap(item)
  const cycleEdges = item.cycleEdges
    .map((edge) => {
      const source = nodeMap.get(edge.source)
      const target = nodeMap.get(edge.target)

      if (!source || !target) {
        return null
      }

      return item.files.length === 2
        ? buildCurvedEdge(edge, source, target)
        : buildLineEdge(edge, source, target)
    })
    .filter((edge): edge is CycleGraphEdgeModel => edge != null)
  const nearbyEdges: CycleGraphEdgeModel[] = []
  const cycleRouteLabels = item.cycleEdges.map(buildRouteLabel)
  const { importsIntoLoop, importsFromLoop } = buildVisibleNearbyRouteGroups({
    item,
    visibleNearbyFiles
  })
  const recommendedRouteLabel = item.suggestedInvestigation.candidateEdge
    ? buildRouteLabel(item.suggestedInvestigation.candidateEdge).label
    : undefined

  return {
    width: GRAPH_WIDTH,
    height: GRAPH_HEIGHT,
    nodes: [...nodeMap.values()],
    cycleEdges,
    nearbyEdges,
    cycleRouteLabels,
    importsIntoLoop,
    importsFromLoop,
    recommendedRouteLabel,
    visibleNearbyCount: visibleNearbyFiles.length,
    hiddenNearbyCount: Math.max(
      item.nearbyFiles.length - visibleNearbyFiles.length,
      0
    )
  }
}
