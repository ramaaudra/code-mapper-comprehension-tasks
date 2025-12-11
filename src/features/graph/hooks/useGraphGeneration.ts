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

interface UseGraphGenerationOptions {
  analysisData: AnalysisData | null
  filesInCycle: Set<string>
  highImpactFilesMap: Map<string, number>
  orphanFilesSet: Set<string>
  riskProfileMap: Map<string, FileRiskProfile>
  brokenFilesSet: Set<string>
  newOrphansSet: Set<string>
}

const BATCH_THRESHOLD = 50 // Nodes - use batching if more than this
const MAX_NODES_IN_VIEW = 200 // Limit display for performance
// Global badge cache - shared across all component instances
const badgeCache = new Map<string, BadgeInfo[]>()

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
  highImpactFilesMap,
  orphanFilesSet,
  riskProfileMap,
  brokenFilesSet,
  newOrphansSet
}: UseGraphGenerationOptions) {
  const [graphElements, setGraphElements] = useState<GraphElements>({
    nodes: [],
    edges: [],
    focusNodeId: null
  })

  const graphCache = useRef(new LRUCache<string, GraphElements>(50)) // Keep 50 graphs max

  const edgeStyles = useMemo(
    () => ({
      strong: { strokeWidth: 5, stroke: '#ef4444' },
      medium: { strokeWidth: 3, stroke: '#d97706' },
      weak: { strokeWidth: 1.5, stroke: '#d97706' }
    }),
    []
  )

  const markerEnds = useMemo(
    () => ({
      strong: {
        type: MarkerType.ArrowClosed,
        color: '#ef4444',
        width: 18,
        height: 18
      },
      medium: {
        type: MarkerType.ArrowClosed,
        color: '#d97706',
        width: 18,
        height: 18
      },
      weak: {
        type: MarkerType.ArrowClosed,
        color: '#d97706',
        width: 18,
        height: 18
      }
    }),
    []
  )

  const labelBgStyle = useMemo(
    () => ({
      fill: 'rgba(248, 250, 252, 0.95)',
      stroke: 'rgba(15, 23, 42, 0.4)',
      color: '#0f172a'
    }),
    []
  )

  const labelStyle = useMemo(
    () => ({
      fontWeight: 600,
      letterSpacing: '0.01em'
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

            const highImpact = getValueFromMap(
              highImpactFilesMap,
              normalizedPath
            )
            if (typeof highImpact === 'number') {
              badges.push({
                label: `High Impact ${highImpact}`,
                tone: 'warning'
              })
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
              const tone: BadgeInfo['tone'] =
                riskProfile.category === 'Kritis'
                  ? 'danger'
                  : riskProfile.category === 'Tinggi'
                    ? 'warning'
                    : riskProfile.category === 'Sedang'
                      ? 'info'
                      : 'success'
              badges.push({ label: `Risiko ${riskProfile.category}`, tone })
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
              badges
            }
          }
          nodesMap.set(normalizedPath, node)
          return normalizedPath
        }

        const focusNodeId = ensureNode(
          normalizedActual,
          'selected',
          'Active file'
        )

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
          edges.push({
            id: `out-${focusNodeId}->${targetNodeId}`,
            source: focusNodeId,
            target: targetNodeId,
            data: { strength: dep.strength, direction: 'outgoing' },
            style: edgeStyles[styleKey],
            animated: dep.strength >= 3,
            markerEnd: markerEnds[styleKey],
            label: dep.strength > 1 ? `${dep.strength} refs` : '1 ref',
            labelBgPadding: [6, 2],
            labelBgBorderRadius: 4,
            labelBgStyle,
            labelStyle
          })
        })

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
          edges.push({
            id: `in-${importerNodeId}->${focusNodeId}`,
            source: importerNodeId,
            target: focusNodeId,
            data: { strength, direction: 'incoming' },
            style: edgeStyles[styleKey],
            animated: strength >= 3,
            markerEnd: markerEnds[styleKey],
            label: strength > 1 ? `${strength} refs` : '1 ref',
            labelBgPadding: [6, 2],
            labelBgBorderRadius: 4,
            labelBgStyle,
            labelStyle
          })
        })

        const totalNodeCount = nodesMap.size

        let filteredNodes: Node<DependencyNodeData>[] = []

        // Synchronous render for filtering logic (needed for both paths)
        filteredNodes = renderGraphSync(nodesMap, edges, focusNodeId)

        let nodesToRender = filteredNodes
        let hiddenCount = 0

        if (filteredNodes.length > MAX_NODES_IN_VIEW) {
          // Rank nodes by importance
          const rankedNodes = filteredNodes.map((node, index) => {
            let priority = index

            // Focus node = highest priority
            if (node.id === focusNodeId) {
              priority = -1000
            } else if (
              // Direct connections = high priority
              node.data.direction === 'incoming' ||
              node.data.direction === 'outgoing'
            ) {
              priority = node.data.direction === 'incoming' ? 0 : 100
            } else if (node.data.badges?.some((b) => b.tone === 'danger')) {
              // Has critical badges = medium priority
              priority = 200
            }

            return { node, priority }
          })

          // Sort by priority and take top N
          rankedNodes.sort((a, b) => a.priority - b.priority)
          nodesToRender = rankedNodes
            .slice(0, MAX_NODES_IN_VIEW)
            .map((r) => r.node)
          hiddenCount = filteredNodes.length - nodesToRender.length

          console.warn(
            `Graph limited: showing ${nodesToRender.length} of ${filteredNodes.length} nodes (${hiddenCount} hidden)`
          )
        }

        // Filter edges to only include visible nodes
        const visibleNodeIds = new Set(nodesToRender.map((n) => n.id))
        const visibleEdges = edges.filter(
          (edge) =>
            visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
        )

        if (totalNodeCount < BATCH_THRESHOLD) {
          // filteredNodes = renderGraphSync(nodesMap, edges, focusNodeId) // Moved up

          console.info(
            `Graph generated: ${nodesToRender.length} nodes, ${visibleEdges.length} edges`
          )

          setGraphElements({
            nodes: nodesToRender,
            edges: visibleEdges,
            focusNodeId: normalizedActual
          })

          // Cache the generated graph
          graphCache.current.set(normalizedActual, {
            nodes: nodesToRender,
            edges: visibleEdges,
            focusNodeId: normalizedActual
          })

          console.info(
            `Graph generated and cached: ${nodesToRender.length} nodes, ${visibleEdges.length} edges`
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
                edges: visibleEdges,
                focusNodeId: normalizedActual
              })

              console.info(
                `Graph fully rendered: ${nodesToRender.length} nodes, ${visibleEdges.length} edges`
              )
            })
          })
        }

        if (hiddenCount > 0) {
          console.info(
            `💡 Tip: ${hiddenCount} nodes hidden for performance. Use search or filters to narrow down.`
          )
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
      highImpactFilesMap,
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
  }, [])

  useEffect(() => {
    // Clear cache when analysis data changes
    badgeCache.clear()
    graphCache.current.clear()
  }, [analysisData])

  return {
    graphElements,
    generateGraphForFile,
    clearGraph
  }
}
