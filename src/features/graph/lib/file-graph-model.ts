import { MarkerType } from '@xyflow/react'

import { reachabilityCopy } from '@/shared/content/reachabilityCopy'
import {
  getFileEvolutionMetrics,
  getBasename,
  hasMatchInSet,
  isEvolutionaryMetricsAvailable,
  matchesFile,
  normalizePath
} from '@/shared/lib/utils'

import { graphCopy } from '../content/graphCopy'

import type {
  DependencyFlowEdge,
  DependencyFlowNode,
  DependencyNodeData
} from '../types/graph'
import type { ReverseDependencyEntry } from '@/shared/lib/analysis-preparation'
import type { FileReviewStory } from '@/shared/lib/utils/file-review-story'
import type { AnalysisData } from '@/shared/types/analysis'

interface BadgeInfo {
  label: string
  tone: 'info' | 'warning' | 'danger' | 'success'
}

interface SimplifiedEdgeStyle {
  styles: Record<
    'strong' | 'medium' | 'weak',
    {
      strokeWidth: number
      stroke: string
      strokeOpacity: number
    }
  >
  showLabels: boolean
  animated: boolean
}

export interface BuildFileGraphModelInput {
  analysisData: AnalysisData
  fileId: string
  filesInCycle: Set<string>
  orphanFilesSet: Set<string>
  brokenFilesSet: Set<string>
  newOrphansSet: Set<string>
  fileReviewStoryMap: Map<string, FileReviewStory>
  reverseDependencyMap: Map<string, ReverseDependencyEntry[]>
}

export interface FileGraphModel {
  nodes: DependencyFlowNode[]
  edges: DependencyFlowEdge[]
  focusNodeId: string
  resolvedFileId: string
  totalNodeCount: number
}

function formatUsedByCount(count: number): string {
  return graphCopy.node.relation.usedByCount(count)
}

function getSimplifiedEdgeStyle(
  isLargeGraph: boolean
): SimplifiedEdgeStyle | null {
  if (!isLargeGraph) {
    return null
  }

  return {
    styles: {
      strong: {
        strokeWidth: 2.2,
        stroke: 'hsl(var(--primary))',
        strokeOpacity: 0.4
      },
      medium: {
        strokeWidth: 1.7,
        stroke: 'hsl(var(--primary))',
        strokeOpacity: 0.32
      },
      weak: {
        strokeWidth: 1.2,
        stroke: 'hsl(var(--primary))',
        strokeOpacity: 0.24
      }
    },
    showLabels: false,
    animated: false
  }
}

function renderConnectedGraph(
  nodesMap: Map<string, DependencyFlowNode>,
  edges: DependencyFlowEdge[],
  focusNodeId: string
): DependencyFlowNode[] {
  const graphNodes = [...nodesMap.values()].sort((a, b) => {
    const order: Record<DependencyNodeData['direction'], number> = {
      selected: 0,
      incoming: 1,
      outgoing: 2,
      placeholder: 3
    }

    return order[a.data.direction] - order[b.data.direction]
  })

  const connectedNodeIds = new Set<string>([focusNodeId])
  edges.forEach((edge) => {
    connectedNodeIds.add(edge.source)
    connectedNodeIds.add(edge.target)
  })

  return graphNodes.filter((node) => connectedNodeIds.has(node.id))
}

function resolveEdgeStyleKey(strength: number): 'strong' | 'medium' | 'weak' {
  if (strength >= 3) {
    return 'strong'
  }

  if (strength >= 2) {
    return 'medium'
  }

  return 'weak'
}

const edgeStyles = {
  strong: {
    strokeWidth: 2.5,
    stroke: 'hsl(var(--primary))',
    strokeOpacity: 0.52
  },
  medium: {
    strokeWidth: 1.9,
    stroke: 'hsl(var(--primary))',
    strokeOpacity: 0.4
  },
  weak: {
    strokeWidth: 1.4,
    stroke: 'hsl(var(--primary))',
    strokeOpacity: 0.28
  }
} as const

const markerEnds = {
  strong: {
    type: MarkerType.ArrowClosed,
    color: 'hsl(var(--primary))',
    width: 16,
    height: 16
  },
  medium: {
    type: MarkerType.ArrowClosed,
    color: 'hsl(var(--primary))',
    width: 15,
    height: 15
  },
  weak: {
    type: MarkerType.ArrowClosed,
    color: 'hsl(var(--primary))',
    width: 14,
    height: 14
  }
} as const

const labelBgStyle = {
  fill: 'hsl(var(--card))',
  fillOpacity: 0.95,
  stroke: 'hsl(var(--border))',
  strokeWidth: 1,
  rx: 4,
  ry: 4
} as const

const labelStyle = {
  fontWeight: 700,
  fontFamily: 'Atkinson Hyperlegible Mono, monospace',
  fontSize: 11,
  fill: 'hsl(var(--foreground))',
  paintOrder: 'stroke fill' as const,
  stroke: 'transparent',
  strokeWidth: 0,
  strokeLinejoin: 'round' as const
} as const

export function resolveGraphFileId(
  dependencyMap: AnalysisData['dependencyMap'],
  fileId: string
): string {
  const candidates = Object.keys(dependencyMap)
  return (
    candidates.find((candidate) => matchesFile(candidate, fileId)) ?? fileId
  )
}

export function createFileGraphCacheKey(
  resolvedFileId: string,
  graphStatusSignature: string
): string {
  return `${normalizePath(resolvedFileId)}::${graphStatusSignature}`
}

export function buildFileGraphModel(
  input: BuildFileGraphModelInput | null
): FileGraphModel | null {
  if (!input?.analysisData || !input.fileId) {
    return null
  }

  const {
    analysisData,
    fileId,
    filesInCycle,
    orphanFilesSet,
    brokenFilesSet,
    newOrphansSet,
    fileReviewStoryMap,
    reverseDependencyMap
  } = input

  const resolvedFileId = resolveGraphFileId(analysisData.dependencyMap, fileId)
  const normalizedActual = normalizePath(resolvedFileId)
  const outgoing = analysisData.dependencyMap[resolvedFileId] ?? []
  const incomingEntries = reverseDependencyMap.get(normalizedActual) ?? []
  const changeHistoryAvailable = isEvolutionaryMetricsAvailable(
    analysisData.evolutionaryMetrics.summary
  )
  const nodesMap = new Map<string, DependencyFlowNode>()
  const edges: DependencyFlowEdge[] = []
  const badgeCache = new Map<string, BadgeInfo[]>()
  const isLargeGraphMode = outgoing.length + incomingEntries.length > 100
  const simplifiedStyle = getSimplifiedEdgeStyle(isLargeGraphMode)

  const getEvolution = (targetPath: string) =>
    getFileEvolutionMetrics(targetPath, analysisData.evolutionaryMetrics.files)

  const ensureNode = (
    rawPath: string,
    direction: DependencyNodeData['direction'],
    subtitle?: string
  ): string => {
    const normalizedPath = normalizePath(rawPath)
    const existing = nodesMap.get(normalizedPath)
    if (existing) {
      return normalizedPath
    }

    const evolution = changeHistoryAvailable
      ? getEvolution(normalizedPath)
      : null
    let badges = badgeCache.get(normalizedPath)

    if (!badges) {
      badges = []

      if (hasMatchInSet(filesInCycle, normalizedPath)) {
        badges.push({ label: 'Cycle', tone: 'danger' })
      }

      if (hasMatchInSet(orphanFilesSet, normalizedPath)) {
        badges.push({
          label: reachabilityCopy.badgeCompact,
          tone: 'warning'
        })
      }

      if (hasMatchInSet(brokenFilesSet, normalizedPath)) {
        badges.push({ label: 'Sim Result: Broken', tone: 'danger' })
      }

      if (hasMatchInSet(newOrphansSet, normalizedPath)) {
        badges.push({
          label: reachabilityCopy.simulationBadge,
          tone: 'info'
        })
      }

      const reviewStory =
        fileReviewStoryMap.get(normalizedPath) ??
        fileReviewStoryMap.get(rawPath)
      if (reviewStory?.showGraphBadge && reviewStory.graphBadgeLabel) {
        badges.push({
          label: reviewStory.graphBadgeLabel,
          tone: reviewStory.badgeTone
        })
      }

      badgeCache.set(normalizedPath, badges)
    }

    nodesMap.set(normalizedPath, {
      id: normalizedPath,
      type: 'dependency',
      position: { x: 0, y: 0 },
      data: {
        ...(evolution
          ? {
              hotspotStatus: evolution.hotspotStatus,
              hotspotScore: evolution.hotspotScore,
              relativeChurn30d: evolution.churn30d.relativeChurn
            }
          : {}),
        label: getBasename(normalizedPath),
        fullPath: normalizedPath,
        direction,
        subtitle,
        badges,
        isSimplified: isLargeGraphMode
      }
    })

    return normalizedPath
  }

  const incomingCount = incomingEntries.length
  const focusNodeId = ensureNode(
    normalizedActual,
    'selected',
    incomingCount > 0
      ? formatUsedByCount(incomingCount)
      : graphCopy.node.relation.focusFile
  )

  outgoing.forEach((dependency) => {
    const targetNodeId = ensureNode(
      dependency.target,
      'outgoing',
      graphCopy.node.relation.importedByFocusFile
    )

    const styleKey = resolveEdgeStyleKey(dependency.strength)
    const effectiveStyle =
      simplifiedStyle?.styles[styleKey] ?? edgeStyles[styleKey]
    const showLabel = simplifiedStyle
      ? simplifiedStyle.showLabels
      : dependency.strength > 1
    const shouldAnimate = simplifiedStyle ? simplifiedStyle.animated : false

    edges.push({
      id: `out-${focusNodeId}->${targetNodeId}`,
      source: focusNodeId,
      target: targetNodeId,
      data: { strength: dependency.strength, direction: 'outgoing' },
      style: effectiveStyle,
      animated: shouldAnimate,
      markerEnd: markerEnds[styleKey],
      ...(showLabel
        ? {
            label:
              dependency.strength > 1 ? `${dependency.strength} refs` : '1 ref',
            labelBgPadding: [10, 6],
            labelBgBorderRadius: 6,
            labelBgStyle,
            labelStyle
          }
        : {})
    })
  })

  incomingEntries.forEach(({ source, dependency }) => {
    const importerNodeId = ensureNode(
      source,
      'incoming',
      graphCopy.node.relation.importsFocusFile
    )
    const styleKey = resolveEdgeStyleKey(dependency.strength ?? 1)
    const effectiveStyle =
      simplifiedStyle?.styles[styleKey] ?? edgeStyles[styleKey]
    const showLabel = simplifiedStyle
      ? simplifiedStyle.showLabels
      : dependency.strength > 1
    const shouldAnimate = simplifiedStyle ? simplifiedStyle.animated : false

    edges.push({
      id: `in-${importerNodeId}->${focusNodeId}`,
      source: importerNodeId,
      target: focusNodeId,
      data: { strength: dependency.strength, direction: 'incoming' },
      style: effectiveStyle,
      animated: shouldAnimate,
      markerEnd: markerEnds[styleKey],
      ...(showLabel
        ? {
            label:
              dependency.strength > 1 ? `${dependency.strength} refs` : '1 ref',
            labelBgPadding: [10, 6],
            labelBgBorderRadius: 6,
            labelBgStyle,
            labelStyle
          }
        : {})
    })
  })

  return {
    nodes: renderConnectedGraph(nodesMap, edges, focusNodeId),
    edges,
    focusNodeId: normalizedActual,
    resolvedFileId: normalizedActual,
    totalNodeCount: nodesMap.size
  }
}
