import { MarkerType } from '@xyflow/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  getFileEvolutionMetrics,
  getBasename,
  getValueFromMap,
  hasMatchInSet,
  matchesFile,
  normalizePath
} from '@/shared/lib/utils'
import { LRUCache } from '@/shared/lib/utils/lruCache'
import { perfMonitor } from '@/shared/lib/utils/perfMonitor'
import { getRiskLevel } from '@/shared/lib/utils/risk'

import { graphCopy } from '../content/graphCopy'

import type { DependencyEdgeData, DependencyNodeData } from '../types/graph'
import type { AnalysisData, DependencyInfo } from '@/shared/types/analysis'
import type { FileRiskProfile } from '@/shared/types/risk'
import type { Edge, Node } from '@xyflow/react'

interface BadgeInfo {
  label: string
  tone: 'info' | 'warning' | 'danger' | 'success'
}

function getGraphRiskBadgeLabel(
  level: ReturnType<typeof getRiskLevel>
): string {
  switch (level) {
    case 'critical':
      return graphCopy.node.risk.critical
    case 'high':
      return graphCopy.node.risk.high
    case 'medium':
      return graphCopy.node.risk.medium
    default:
      return graphCopy.node.risk.low
  }
}

function formatUsedByCount(count: number): string {
  return graphCopy.node.relation.usedByCount(count)
}

interface GraphElements {
  nodes: Node<DependencyNodeData>[]
  edges: Edge<DependencyEdgeData>[]
  focusNodeId: string | null
}

export interface UseGraphGenerationOptions {
  analysisData: AnalysisData | null
  filesInCycle: Set<string>
  orphanFilesSet: Set<string>
  riskProfileMap: Map<string, FileRiskProfile>
  brokenFilesSet: Set<string>
  newOrphansSet: Set<string>
  dataUpdatedAt?: number | null
}

const BATCH_THRESHOLD = 100 // Nodes - use batching if more than this (increased for SWC speed)
// Global badge cache - shared across all component instances
const badgeCache = new Map<string, BadgeInfo[]>()

function getSimplifiedEdgeStyle(isLargeGraph: boolean) {
  if (isLargeGraph) {
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
  return null
}

function renderGraphSync(
  nodesMap: Map<string, Node<DependencyNodeData>>,
  edges: Edge<DependencyEdgeData>[],
  focusNodeId: string
): Node<DependencyNodeData>[] {
  const graphNodes = [...nodesMap.values()].sort((a, b) => {
    const order: Record<DependencyNodeData['direction'], number> = {
      selected: 0,
      incoming: 1,
      outgoing: 2,
      placeholder: 3
    }
    return order[a.data.direction] - order[b.data.direction]
  })

  const connectedNodeIds = new Set<string>()
  connectedNodeIds.add(focusNodeId)
  edges.forEach((edge) => {
    connectedNodeIds.add(edge.source)
    connectedNodeIds.add(edge.target)
  })

  return graphNodes.filter((node) => connectedNodeIds.has(node.id))
}

export function useGraphGeneration({
  analysisData,
  filesInCycle,
  orphanFilesSet,
  riskProfileMap,
  brokenFilesSet,
  newOrphansSet,
  dataUpdatedAt
}: UseGraphGenerationOptions) {
  const [graphElements, setGraphElements] = useState<GraphElements>({
    nodes: [],
    edges: [],
    focusNodeId: null
  })

  const graphCache = useRef(new LRUCache<string, GraphElements>(50)) // Keep 50 graphs max

  const edgeStyles = useMemo(
    () => ({
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
    }),
    []
  )

  const markerEnds = useMemo(
    () => ({
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
    }),
    []
  )

  const labelBgStyle = useMemo(
    () => ({
      fill: 'hsl(var(--card))',
      fillOpacity: 0.95,
      stroke: 'hsl(var(--border))',
      strokeWidth: 1,
      rx: 4,
      ry: 4
    }),
    []
  )

  const labelStyle = useMemo(
    () => ({
      fontWeight: 700,
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 11,
      fill: 'hsl(var(--foreground))',
      paintOrder: 'stroke fill' as const,
      stroke: 'transparent',
      strokeWidth: 0,
      strokeLinejoin: 'round' as const
    }),
    []
  )

  const generateGraphForFile = useCallback(
    (
      fileId: string | null,
      sourceData?: AnalysisData | null
    ): string | null => {
      const endMeasure = perfMonitor.startMeasure('graph-generation')

      try {
        const currentData = sourceData ?? analysisData
        if (!fileId || !currentData) {
          setGraphElements({ nodes: [], edges: [], focusNodeId: null })
          return null
        }

        const getEvolution = (targetPath: string) =>
          getFileEvolutionMetrics(
            targetPath,
            currentData.evolutionaryMetrics.files
          )

        // Check cache first
        const cached = graphCache.current.get(fileId)
        if (cached) {
          console.info('Graph loaded from cache:', fileId)
          setGraphElements(cached)
          return cached.focusNodeId
        }

        const dependencyMap = currentData.dependencyMap || {}
        const candidates = Object.keys(dependencyMap)
        const matchedEntry = candidates.find((candidate) =>
          matchesFile(candidate, fileId)
        )
        const actualFileId = matchedEntry ?? fileId
        const normalizedActual = normalizePath(actualFileId)

        const outgoing = dependencyMap[actualFileId] ?? []
        const incomingEntries = Object.entries(dependencyMap).filter(
          ([, deps]) =>
            (deps as DependencyInfo[]).some((dep) =>
              matchesFile(dep.target, normalizedActual)
            )
        )

        const nodesMap = new Map<string, Node<DependencyNodeData>>()
        const edges: Edge<DependencyEdgeData>[] = []

        // Pre-calculate large graph mode for simplified node styling
        const isLargeGraphMode = outgoing.length + incomingEntries.length > 100

        const ensureNode = (
          rawPath: string,
          direction: DependencyNodeData['direction'],
          subtitle?: string
        ): string => {
          const normalizedPath = normalizePath(rawPath)
          const evolution = getEvolution(normalizedPath)
          const existing = nodesMap.get(normalizedPath)
          if (existing) {
            return normalizedPath
          }

          // Check cache first
          let badges = badgeCache.get(normalizedPath)

          if (!badges) {
            // Compute only if not cached
            badges = []

            if (hasMatchInSet(filesInCycle, normalizedPath)) {
              badges.push({ label: 'Cycle', tone: 'danger' })
            }

            if (hasMatchInSet(orphanFilesSet, normalizedPath)) {
              badges.push({ label: 'Orphan', tone: 'warning' })
            }

            if (hasMatchInSet(brokenFilesSet, normalizedPath)) {
              badges.push({ label: 'Sim Result: Broken', tone: 'danger' })
            }

            if (hasMatchInSet(newOrphansSet, normalizedPath)) {
              badges.push({ label: 'Sim Result: Orphan', tone: 'info' })
            }

            const riskProfile = getValueFromMap(riskProfileMap, normalizedPath)
            if (riskProfile) {
              // Calculate risk level from score for unified styling
              const level = getRiskLevel(riskProfile.score)
              const tone: BadgeInfo['tone'] =
                level === 'critical'
                  ? 'danger'
                  : level === 'high'
                    ? 'warning'
                    : level === 'medium'
                      ? 'info'
                      : 'success'
              badges.push({
                label: getGraphRiskBadgeLabel(level),
                tone
              })
            }

            // Cache for future
            badgeCache.set(normalizedPath, badges)
          }

          const node: Node<DependencyNodeData> = {
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
          }
          nodesMap.set(normalizedPath, node)
          return normalizedPath
        }

        // Count incoming edges for focus node
        const incomingCount = incomingEntries.length

        const focusNodeId = ensureNode(
          normalizedActual,
          'selected',
          incomingCount > 0
            ? formatUsedByCount(incomingCount)
            : graphCopy.node.relation.focusFile
        )

        // Get simplified style for large graphs
        const simplifiedStyle = getSimplifiedEdgeStyle(isLargeGraphMode)

        outgoing.forEach((dep) => {
          const targetNodeId = ensureNode(
            dep.target,
            'outgoing',
            graphCopy.node.relation.importedByFocusFile
          )

          if (!nodesMap.has(focusNodeId) || !nodesMap.has(targetNodeId)) {
            console.warn(
              `Skipping invalid edge: ${focusNodeId} -> ${targetNodeId}`
            )
            return
          }

          const styleKey =
            dep.strength >= 3 ? 'strong' : dep.strength >= 2 ? 'medium' : 'weak'
          const effectiveStyle =
            simplifiedStyle?.styles[styleKey] ?? edgeStyles[styleKey]
          const showLabel = simplifiedStyle
            ? simplifiedStyle.showLabels
            : dep.strength > 1
          const shouldAnimate = simplifiedStyle
            ? simplifiedStyle.animated
            : false

          edges.push({
            id: `out-${focusNodeId}->${targetNodeId}`,
            source: focusNodeId,
            target: targetNodeId,
            data: { strength: dep.strength, direction: 'outgoing' },
            style: effectiveStyle,
            animated: shouldAnimate,
            markerEnd: markerEnds[styleKey],
            ...(showLabel && {
              label: dep.strength > 1 ? `${dep.strength} refs` : '1 ref',
              labelBgPadding: [10, 6],
              labelBgBorderRadius: 6,
              labelBgStyle,
              labelStyle
            })
          })
        })

        // Render ALL incoming edges (no hub mode filtering)
        incomingEntries.forEach(([importer, deps]) => {
          const importerNodeId = ensureNode(
            importer,
            'incoming',
            graphCopy.node.relation.importsFocusFile
          )

          if (!nodesMap.has(importerNodeId) || !nodesMap.has(focusNodeId)) {
            console.warn(
              `Skipping invalid edge: ${importerNodeId} -> ${focusNodeId}`
            )
            return
          }

          const connection = (deps as DependencyInfo[]).find((dep) =>
            matchesFile(dep.target, normalizedActual)
          )
          const strength = connection?.strength ?? 1
          const styleKey =
            strength >= 3 ? 'strong' : strength >= 2 ? 'medium' : 'weak'
          const effectiveStyle =
            simplifiedStyle?.styles[styleKey] ?? edgeStyles[styleKey]
          const showLabel = simplifiedStyle
            ? simplifiedStyle.showLabels
            : strength > 1
          const shouldAnimate = simplifiedStyle
            ? simplifiedStyle.animated
            : false

          edges.push({
            id: `in-${importerNodeId}->${focusNodeId}`,
            source: importerNodeId,
            target: focusNodeId,
            data: { strength, direction: 'incoming' },
            style: effectiveStyle,
            animated: shouldAnimate,
            markerEnd: markerEnds[styleKey],
            ...(showLabel && {
              label: strength > 1 ? `${strength} refs` : '1 ref',
              labelBgPadding: [10, 6],
              labelBgBorderRadius: 6,
              labelBgStyle,
              labelStyle
            })
          })
        })

        const totalNodeCount = nodesMap.size

        let filteredNodes: Node<DependencyNodeData>[] = []

        // Synchronous render for filtering logic (needed for both paths)
        filteredNodes = renderGraphSync(nodesMap, edges, focusNodeId)

        // No limiting - render all nodes
        const nodesToRender = filteredNodes

        if (totalNodeCount < BATCH_THRESHOLD) {
          console.info(
            `Graph generated: ${nodesToRender.length} nodes, ${edges.length} edges`
          )

          setGraphElements({
            nodes: nodesToRender,
            edges,
            focusNodeId: normalizedActual
          })

          // Cache the generated graph
          graphCache.current.set(normalizedActual, {
            nodes: nodesToRender,
            edges,
            focusNodeId: normalizedActual
          })

          console.info(
            `Graph generated and cached: ${nodesToRender.length} nodes, ${edges.length} edges`
          )
        } else {
          // Large graph: progressive rendering
          console.info(
            `Large graph detected (${totalNodeCount} nodes), rendering progressively...`
          )

          // Batch 1: Focus node only (instant feedback)
          const focusNode = nodesMap.get(focusNodeId)
          if (focusNode) {
            setGraphElements({
              nodes: [focusNode],
              edges: [],
              focusNodeId: normalizedActual
            })
          }

          // Batch 2: Add connected nodes (subset)
          requestAnimationFrame(() => {
            // Use nodesToRender instead of raw filteredNodes

            setGraphElements({
              nodes: nodesToRender.slice(
                0,
                Math.ceil(nodesToRender.length / 2)
              ),
              edges: [],
              focusNodeId: normalizedActual
            })

            // Batch 3: Complete with edges
            requestAnimationFrame(() => {
              setGraphElements({
                nodes: nodesToRender,
                edges,
                focusNodeId: normalizedActual
              })

              console.info(
                `Graph fully rendered: ${nodesToRender.length} nodes, ${edges.length} edges`
              )
            })
          })
        }

        return normalizedActual
      } finally {
        endMeasure()
      }
    },
    [
      analysisData,
      edgeStyles,
      filesInCycle,
      orphanFilesSet,
      brokenFilesSet,
      newOrphansSet,
      riskProfileMap,
      markerEnds,
      labelBgStyle,
      labelStyle
    ]
  )

  const clearGraph = useCallback(() => {
    setGraphElements({ nodes: [], edges: [], focusNodeId: null })
    graphCache.current.clear()
  }, [])

  useEffect(() => {
    // Clear cache when analysis data changes
    badgeCache.clear()
    graphCache.current.clear()
  }, [analysisData, dataUpdatedAt])

  return {
    graphElements,
    generateGraphForFile,
    clearGraph
  }
}
