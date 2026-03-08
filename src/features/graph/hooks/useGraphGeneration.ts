import { MarkerType } from '@xyflow/react'
import type { Edge, Node } from '@xyflow/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  getBasename,
  getValueFromMap,
  hasMatchInSet,
  matchesFile,
  normalizePath
} from '@/shared/lib/utils'
import { LRUCache } from '@/shared/lib/utils/lruCache'
import { perfMonitor } from '@/shared/lib/utils/perfMonitor'
import { getRiskLabel, getRiskLevel } from '@/shared/lib/utils/risk'
import type { AnalysisData, DependencyInfo } from '@/shared/types/analysis'
import type { FileRiskProfile } from '@/shared/types/risk'

import type { DependencyEdgeData, DependencyNodeData } from '../types/graph'

interface BadgeInfo {
  label: string
  tone: 'info' | 'warning' | 'danger' | 'success'
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
        strong: { strokeWidth: 2, stroke: '#525252', strokeOpacity: 0.7 },
        medium: { strokeWidth: 1.5, stroke: '#737373', strokeOpacity: 0.6 },
        weak: { strokeWidth: 1, stroke: '#a3a3a3', strokeOpacity: 0.5 }
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
  const graphNodes = Array.from(nodesMap.values()).sort((a, b) => {
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
      strong: { strokeWidth: 3, stroke: '#525252', strokeOpacity: 0.9 },
      medium: { strokeWidth: 2, stroke: '#737373', strokeOpacity: 0.75 },
      weak: { strokeWidth: 1.5, stroke: '#a3a3a3', strokeOpacity: 0.6 }
    }),
    []
  )

  const markerEnds = useMemo(
    () => ({
      strong: {
        type: MarkerType.ArrowClosed,
        color: '#525252',
        width: 18,
        height: 18
      },
      medium: {
        type: MarkerType.ArrowClosed,
        color: '#737373',
        width: 16,
        height: 16
      },
      weak: {
        type: MarkerType.ArrowClosed,
        color: '#a3a3a3',
        width: 14,
        height: 14
      }
    }),
    []
  )

  const labelBgStyle = useMemo(
    () => ({
      fill: '#18181b',
      fillOpacity: 0.95,
      rx: 4,
      ry: 4
    }),
    []
  )

  const labelStyle = useMemo(
    () => ({
      fontWeight: 700,
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 12,
      fill: '#ffffffff',
      paintOrder: 'stroke fill' as const,
      stroke: '#000000',
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
                label: `${getRiskLabel(level)} Change Risk`,
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
            ? `Imported by ${incomingCount} files`
            : 'Active file'
        )

        // Get simplified style for large graphs
        const simplifiedStyle = getSimplifiedEdgeStyle(isLargeGraphMode)

        outgoing.forEach((dep) => {
          const targetNodeId = ensureNode(
            dep.target,
            'outgoing',
            'Required module'
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
          const showLabel = simplifiedStyle ? simplifiedStyle.showLabels : true
          const shouldAnimate = simplifiedStyle
            ? simplifiedStyle.animated
            : dep.strength >= 3

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
            'Imports this file'
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
          const showLabel = simplifiedStyle ? simplifiedStyle.showLabels : true
          const shouldAnimate = simplifiedStyle
            ? simplifiedStyle.animated
            : strength >= 3

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
