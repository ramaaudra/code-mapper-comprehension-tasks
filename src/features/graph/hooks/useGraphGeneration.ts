import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  prepareAnalysisSnapshot,
  type ReverseDependencyEntry
} from '@/shared/lib/analysis-preparation'
import { LRUCache } from '@/shared/lib/utils/lruCache'
import { perfMonitor } from '@/shared/lib/utils/perfMonitor'

import {
  buildFileGraphModel,
  createFileGraphCacheKey,
  resolveGraphFileId,
  type FileGraphModel
} from '../lib/file-graph-model'
import { createGraphStatusSignature } from '../lib/graph-state'

import type { DependencyGraphData } from '../types/graph'
import type { FileReviewStory } from '@/shared/lib/utils/file-review-story'
import type { AnalysisData } from '@/shared/types/analysis'

export interface UseGraphGenerationOptions {
  analysisData: AnalysisData | null
  filesInCycle: Set<string>
  orphanFilesSet: Set<string>
  brokenFilesSet: Set<string>
  newOrphansSet: Set<string>
  fileReviewStoryMap: Map<string, FileReviewStory>
  reverseDependencyMap: Map<string, ReverseDependencyEntry[]>
  dataUpdatedAt?: number | null
}

interface GraphBuildContext {
  analysisData: AnalysisData
  filesInCycle: Set<string>
  orphanFilesSet: Set<string>
  brokenFilesSet: Set<string>
  newOrphansSet: Set<string>
  fileReviewStoryMap: Map<string, FileReviewStory>
  reverseDependencyMap: Map<string, ReverseDependencyEntry[]>
  graphStatusSignature: string
  canUseSharedCache: boolean
}

interface GraphModelLookupResult {
  model: FileGraphModel
  fromCache: boolean
}

const BATCH_THRESHOLD = 100

function createEmptyGraphElements(): DependencyGraphData {
  return {
    nodes: [],
    edges: [],
    focusNodeId: null
  }
}

function toGraphElements(model: FileGraphModel): DependencyGraphData {
  return {
    nodes: model.nodes,
    edges: model.edges,
    focusNodeId: model.focusNodeId
  }
}

export function useGraphGeneration({
  analysisData,
  filesInCycle,
  orphanFilesSet,
  brokenFilesSet,
  newOrphansSet,
  fileReviewStoryMap,
  reverseDependencyMap,
  dataUpdatedAt
}: UseGraphGenerationOptions) {
  const [graphElements, setGraphElements] = useState<DependencyGraphData>(
    createEmptyGraphElements
  )
  const graphCache = useRef(new LRUCache<string, FileGraphModel>(50))
  const focusedGraphNodeIdRef = useRef<string | null>(null)
  const renderVersionRef = useRef(0)

  const graphStatusSignature = useMemo(
    () =>
      createGraphStatusSignature({
        filesInCycle,
        orphanFilesSet,
        brokenFilesSet,
        newOrphansSet
      }),
    [filesInCycle, orphanFilesSet, brokenFilesSet, newOrphansSet]
  )

  const clearRenderedGraph = useCallback(() => {
    renderVersionRef.current += 1
    setGraphElements(createEmptyGraphElements())
  }, [])

  const resolveBuildContext = useCallback(
    (sourceData?: AnalysisData | null): GraphBuildContext | null => {
      const currentData = sourceData ?? analysisData
      if (!currentData) {
        return null
      }

      if (!sourceData || sourceData === analysisData) {
        return {
          analysisData: currentData,
          filesInCycle,
          orphanFilesSet,
          brokenFilesSet,
          newOrphansSet,
          fileReviewStoryMap,
          reverseDependencyMap,
          graphStatusSignature,
          canUseSharedCache: true
        }
      }

      const preparedSnapshot = prepareAnalysisSnapshot(sourceData)

      return {
        analysisData: sourceData,
        filesInCycle: preparedSnapshot.filesInCycle,
        orphanFilesSet: preparedSnapshot.orphanFilesSet,
        brokenFilesSet,
        newOrphansSet,
        fileReviewStoryMap: preparedSnapshot.fileReviewStoryMap,
        reverseDependencyMap: preparedSnapshot.reverseDependencyMap,
        graphStatusSignature: createGraphStatusSignature({
          filesInCycle: preparedSnapshot.filesInCycle,
          orphanFilesSet: preparedSnapshot.orphanFilesSet,
          brokenFilesSet,
          newOrphansSet
        }),
        canUseSharedCache: false
      }
    },
    [
      analysisData,
      brokenFilesSet,
      fileReviewStoryMap,
      filesInCycle,
      graphStatusSignature,
      newOrphansSet,
      orphanFilesSet,
      reverseDependencyMap
    ]
  )

  const getGraphModel = useCallback(
    (
      fileId: string,
      sourceData?: AnalysisData | null
    ): GraphModelLookupResult | null => {
      const buildContext = resolveBuildContext(sourceData)
      if (!buildContext) {
        return null
      }

      const resolvedFileId = resolveGraphFileId(
        buildContext.analysisData.dependencyMap,
        fileId
      )
      const cacheKey = createFileGraphCacheKey(
        resolvedFileId,
        buildContext.graphStatusSignature
      )

      if (buildContext.canUseSharedCache) {
        const cached = graphCache.current.get(cacheKey)
        if (cached) {
          return {
            model: cached,
            fromCache: true
          }
        }
      }

      const model = buildFileGraphModel({
        analysisData: buildContext.analysisData,
        fileId: resolvedFileId,
        filesInCycle: buildContext.filesInCycle,
        orphanFilesSet: buildContext.orphanFilesSet,
        brokenFilesSet: buildContext.brokenFilesSet,
        newOrphansSet: buildContext.newOrphansSet,
        fileReviewStoryMap: buildContext.fileReviewStoryMap,
        reverseDependencyMap: buildContext.reverseDependencyMap
      })

      if (!model) {
        return null
      }

      if (buildContext.canUseSharedCache) {
        graphCache.current.set(cacheKey, model)
      }

      return {
        model,
        fromCache: false
      }
    },
    [resolveBuildContext]
  )

  const renderGraphModel = useCallback(
    (model: FileGraphModel, shouldRenderProgressively: boolean) => {
      focusedGraphNodeIdRef.current = model.resolvedFileId
      renderVersionRef.current += 1
      const renderVersion = renderVersionRef.current
      const nextGraphElements = toGraphElements(model)

      if (
        !shouldRenderProgressively ||
        model.totalNodeCount < BATCH_THRESHOLD
      ) {
        setGraphElements(nextGraphElements)
        return
      }

      const focusNode =
        model.nodes.find((node) => node.id === model.focusNodeId) ?? null

      setGraphElements({
        nodes: focusNode ? [focusNode] : [],
        edges: [],
        focusNodeId: model.focusNodeId
      })

      const scheduleFrame =
        typeof globalThis.requestAnimationFrame === 'function'
          ? globalThis.requestAnimationFrame.bind(globalThis)
          : (callback: FrameRequestCallback) => {
              callback(0)
              return 0
            }

      scheduleFrame(() => {
        if (renderVersionRef.current !== renderVersion) {
          return
        }

        setGraphElements({
          nodes: model.nodes.slice(0, Math.ceil(model.nodes.length / 2)),
          edges: [],
          focusNodeId: model.focusNodeId
        })

        scheduleFrame(() => {
          if (renderVersionRef.current !== renderVersion) {
            return
          }

          setGraphElements(nextGraphElements)
        })
      })
    },
    []
  )

  const generateGraphForFile = useCallback(
    (
      fileId: string | null,
      sourceData?: AnalysisData | null
    ): string | null => {
      const endMeasure = perfMonitor.startMeasure('graph-generation')

      try {
        if (!fileId) {
          focusedGraphNodeIdRef.current = null
          clearRenderedGraph()
          return null
        }

        const result = getGraphModel(fileId, sourceData)
        if (!result) {
          focusedGraphNodeIdRef.current = null
          clearRenderedGraph()
          return null
        }

        renderGraphModel(result.model, !result.fromCache)
        return result.model.resolvedFileId
      } finally {
        endMeasure()
      }
    },
    [clearRenderedGraph, getGraphModel, renderGraphModel]
  )

  const prepareGraphForFile = useCallback(
    (
      fileId: string | null,
      sourceData?: AnalysisData | null
    ): string | null => {
      if (!fileId) {
        return null
      }

      const result = getGraphModel(fileId, sourceData)
      return result?.model.resolvedFileId ?? null
    },
    [getGraphModel]
  )

  const clearGraph = useCallback(() => {
    focusedGraphNodeIdRef.current = null
    graphCache.current.clear()
    clearRenderedGraph()
  }, [clearRenderedGraph])

  useEffect(() => {
    graphCache.current.clear()
    renderVersionRef.current += 1

    if (!analysisData) {
      focusedGraphNodeIdRef.current = null
      setGraphElements(createEmptyGraphElements())
    }
  }, [analysisData, dataUpdatedAt])

  useEffect(() => {
    if (!analysisData || !focusedGraphNodeIdRef.current) {
      return
    }

    generateGraphForFile(focusedGraphNodeIdRef.current)
  }, [analysisData, dataUpdatedAt, graphStatusSignature, generateGraphForFile])

  return {
    graphElements,
    generateGraphForFile,
    prepareGraphForFile,
    clearGraph
  }
}
