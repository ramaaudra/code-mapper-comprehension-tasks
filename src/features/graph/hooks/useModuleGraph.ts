import { useMemo } from 'react'

import { useArchitectureFolders } from '@/features/architecture/hooks/useArchitectureMetrics'
import { RISK_THRESHOLDS, calculateRiskScore } from '@/shared/lib/utils/risk'

import type { ModuleEdgeData, ModuleNodeData } from '../utils/moduleAggregation'
import type { Edge, Node } from '@xyflow/react'

export interface ModuleGraphNode extends Node<ModuleNodeData> {
  type: 'module'
}

export interface ModuleGraphEdge extends Edge<ModuleEdgeData> {
  type: 'aggregated'
}

export function useModuleGraph() {
  const { data, isLoading, error } = useArchitectureFolders()

  const { nodes, edges } = useMemo(() => {
    if (!data?.folders) {
      return { nodes: [], edges: [] }
    }

    // Transform folder metrics into graph nodes
    const graphNodes: ModuleGraphNode[] = data.folders.map((folder, index) => {
      const riskScore = calculateRiskScore(folder.ca, folder.instability)

      return {
        id: folder.folderPath,
        type: 'module',
        position: { x: 0, y: index * 150 }, // Initial position, will be layouted
        data: {
          id: folder.folderPath,
          folderPath: folder.folderPath,
          fileCount: folder.fileCount,
          totalIncoming: folder.ca,
          totalOutgoing: folder.ce,
          incomingModules: Object.keys(folder.couplingFrom || {}),
          outgoingModules: Object.keys(folder.couplingTo || {}),
          riskScore,
          instability: folder.instability,
          isZoneOfPain: riskScore >= RISK_THRESHOLDS.CRITICAL
        }
      }
    })

    // Create aggregated edges
    const graphEdges: ModuleGraphEdge[] = []
    const addedEdges = new Set<string>()

    for (const folder of data.folders) {
      for (const [targetModule, count] of Object.entries(
        folder.couplingTo || {}
      )) {
        const edgeId = `${folder.folderPath}->${targetModule}`
        if (!addedEdges.has(edgeId)) {
          addedEdges.add(edgeId)
          graphEdges.push({
            id: edgeId,
            source: folder.folderPath,
            target: targetModule,
            type: 'aggregated',
            data: {
              source: folder.folderPath,
              target: targetModule,
              weight: count
            }
          })
        }
      }
    }

    return { nodes: graphNodes, edges: graphEdges }
  }, [data])

  return {
    nodes,
    edges,
    isLoading,
    error,
    folders: data?.folders || []
  }
}
