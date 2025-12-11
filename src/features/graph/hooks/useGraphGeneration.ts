import { MarkerType } from '@xyflow/react'
import type { Edge, Node } from '@xyflow/react'
import { useCallback, useState } from 'react'

import {
  getBasename,
  getValueFromMap,
  hasMatchInSet,
  matchesFile,
  normalizePath
} from '@/shared/lib/utils'
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

  const collectBadges = useCallback(
    (fullPath: string): BadgeInfo[] => {
      const badges: BadgeInfo[] = []

      if (hasMatchInSet(filesInCycle, fullPath)) {
        badges.push({ label: 'Cycle', tone: 'danger' })
      }

      const highImpact = getValueFromMap(highImpactFilesMap, fullPath)
      if (typeof highImpact === 'number') {
        badges.push({ label: `High Impact ${highImpact}`, tone: 'warning' })
      }

      if (hasMatchInSet(orphanFilesSet, fullPath)) {
        badges.push({ label: 'Orphan', tone: 'warning' })
      }

      if (hasMatchInSet(brokenFilesSet, fullPath)) {
        badges.push({ label: 'Sim Result: Broken', tone: 'danger' })
      }

      if (hasMatchInSet(newOrphansSet, fullPath)) {
        badges.push({ label: 'Sim Result: Orphan', tone: 'info' })
      }

      const riskProfile = getValueFromMap(riskProfileMap, fullPath)
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

      return badges
    },
    [
      filesInCycle,
      highImpactFilesMap,
      orphanFilesSet,
      brokenFilesSet,
      newOrphansSet,
      riskProfileMap
    ]
  )

  const generateGraphForFile = useCallback(
    (
      fileId: string | null,
      sourceData?: AnalysisData | null
    ): string | null => {
      const currentData = sourceData ?? analysisData
      if (!fileId || !currentData) {
        setGraphElements({ nodes: [], edges: [], focusNodeId: null })
        return null
      }

      const dependencyMap = currentData.dependencyMap || {}
      const candidates = Object.keys(dependencyMap)
      const matchedEntry = candidates.find((candidate) =>
        matchesFile(candidate, fileId)
      )
      const actualFileId = matchedEntry ?? fileId
      const normalizedActual = normalizePath(actualFileId)

      const outgoing = dependencyMap[actualFileId] ?? []
      const incomingEntries = Object.entries(dependencyMap).filter(([, deps]) =>
        (deps as DependencyInfo[]).some((dep) =>
          matchesFile(dep.target, normalizedActual)
        )
      )

      const nodesMap = new Map<string, Node<DependencyNodeData>>()
      const edges: Edge<DependencyEdgeData>[] = []

      const ensureNode = (
        fullPath: string,
        direction: DependencyNodeData['direction'],
        subtitle?: string
      ) => {
        const normalizedFullPath = normalizePath(fullPath)
        const existing = nodesMap.get(normalizedFullPath)
        if (existing) {
          return existing
        }

        const node: Node<DependencyNodeData> = {
          id: normalizedFullPath,
          type: 'dependency',
          position: { x: 0, y: 0 },
          data: {
            label: getBasename(normalizedFullPath),
            fullPath: normalizedFullPath,
            direction,
            subtitle,
            badges: collectBadges(normalizedFullPath)
          }
        }
        nodesMap.set(normalizedFullPath, node)
        return node
      }

      ensureNode(normalizedActual, 'selected', 'Active file')

      outgoing.forEach((dep) => {
        const targetPath = normalizePath(dep.target)
        ensureNode(targetPath, 'outgoing', 'Required module')
        const strokeWidth = Math.min(1 + Math.log2(dep.strength + 1), 5)
        const strokeColor = dep.strength >= 3 ? '#ef4444' : '#d97706'
        edges.push({
          id: `out-${normalizedActual}->${targetPath}`,
          source: normalizedActual,
          target: targetPath,
          data: { strength: dep.strength, direction: 'outgoing' },
          style: { strokeWidth, stroke: strokeColor },
          animated: dep.strength >= 3,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: strokeColor,
            width: 18,
            height: 18
          },
          label: dep.strength > 1 ? `${dep.strength} refs` : '1 ref',
          labelBgPadding: [6, 2],
          labelBgBorderRadius: 4,
          labelBgStyle: {
            fill: 'rgba(248, 250, 252, 0.95)',
            stroke: 'rgba(15, 23, 42, 0.4)',
            color: '#0f172a'
          },
          labelStyle: { fontWeight: 600, letterSpacing: '0.01em' }
        })
      })

      incomingEntries.forEach(([importer, deps]) => {
        const importerPath = normalizePath(importer)
        ensureNode(importerPath, 'incoming', 'Imports this file')
        const connection = (deps as DependencyInfo[]).find((dep) =>
          matchesFile(dep.target, normalizedActual)
        )
        const strength = connection?.strength ?? 1
        const strokeWidth = Math.min(1 + Math.log2(strength + 1), 5)
        const strokeColor = strength >= 3 ? '#ef4444' : '#2563eb'
        edges.push({
          id: `in-${importerPath}->${normalizedActual}`,
          source: importerPath,
          target: normalizedActual,
          data: { strength, direction: 'incoming' },
          style: { strokeWidth, stroke: strokeColor },
          animated: strength >= 3,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: strokeColor,
            width: 18,
            height: 18
          },
          label: strength > 1 ? `${strength} refs` : '1 ref',
          labelBgPadding: [6, 2],
          labelBgBorderRadius: 4,
          labelBgStyle: {
            fill: 'rgba(248, 250, 252, 0.95)',
            stroke: 'rgba(15, 23, 42, 0.4)',
            color: '#0f172a'
          },
          labelStyle: { fontWeight: 600, letterSpacing: '0.01em' }
        })
      })

      const graphNodes = Array.from(nodesMap.values()).sort((a, b) => {
        const order: Record<DependencyNodeData['direction'], number> = {
          selected: 0,
          incoming: 1,
          outgoing: 2,
          placeholder: 3
        }
        return order[a.data.direction] - order[b.data.direction]
      })

      setGraphElements({
        nodes: graphNodes,
        edges,
        focusNodeId: normalizedActual
      })

      return normalizedActual
    },
    [analysisData, collectBadges]
  )

  const clearGraph = useCallback(() => {
    setGraphElements({ nodes: [], edges: [], focusNodeId: null })
  }, [])

  return {
    graphElements,
    generateGraphForFile,
    clearGraph,
    collectBadges
  }
}
