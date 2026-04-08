import {
  createAliasedPathSet,
  createPathAliasLookup
} from '@/shared/lib/analysis-paths'
import { buildFileReviewStoryMap, normalizePath } from '@/shared/lib/utils'

import type { PathAliasLookup } from '@/shared/lib/analysis-paths'
import type { FileReviewStory } from '@/shared/lib/utils/file-review-story'
import type {
  AnalysisData,
  AnalysisNode,
  DependencyInfo
} from '@/shared/types/analysis'
import type { FileRiskProfile } from '@/shared/types/risk'

export interface ReverseDependencyEntry {
  source: string
  dependency: DependencyInfo
}

export interface PreparedAnalysisSnapshot {
  pathAliasLookup: PathAliasLookup
  filesInCycle: Set<string>
  orphanFilesSet: Set<string>
  riskProfileMap: Map<string, FileRiskProfile>
  fileReviewStoryMap: Map<string, FileReviewStory>
  nodeLookup: Map<string, AnalysisNode>
  reverseDependencyMap: Map<string, ReverseDependencyEntry[]>
}

function createNodeLookup(
  nodes: AnalysisNode[],
  pathAliasLookup: PathAliasLookup
): Map<string, AnalysisNode> {
  const lookup = new Map<string, AnalysisNode>()

  const setNode = (key: string, node: AnalysisNode) => {
    const normalizedKey = normalizePath(key)
    if (!normalizedKey) {
      return
    }
    lookup.set(normalizedKey, node)
  }

  nodes.forEach((node) => {
    if (!node?.id) {
      return
    }

    const normalizedId = normalizePath(node.id)
    setNode(normalizedId, node)

    const aliases = pathAliasLookup.get(normalizedId)
    aliases?.forEach((alias) => {
      setNode(alias, node)
    })
  })

  return lookup
}

function createRiskProfileMap(
  analysisData: AnalysisData,
  pathAliasLookup: PathAliasLookup
): Map<string, FileRiskProfile> {
  const map = new Map<string, FileRiskProfile>()

  analysisData.riskAnalysis?.forEach((profile) => {
    const normalizedFile = normalizePath(profile.file)
    map.set(normalizedFile, profile)

    pathAliasLookup.get(normalizedFile)?.forEach((alias) => {
      map.set(alias, profile)
    })
  })

  return map
}

function createReverseDependencyMap(
  dependencyMap: AnalysisData['dependencyMap'],
  pathAliasLookup: PathAliasLookup
): Map<string, ReverseDependencyEntry[]> {
  const reverseMap = new Map<string, ReverseDependencyEntry[]>()

  const appendEntry = (target: string, entry: ReverseDependencyEntry) => {
    const normalizedTarget = normalizePath(target)
    const currentEntries = reverseMap.get(normalizedTarget) ?? []
    currentEntries.push(entry)
    reverseMap.set(normalizedTarget, currentEntries)
  }

  Object.entries(dependencyMap).forEach(([source, dependencies]) => {
    const normalizedSource = normalizePath(source)

    dependencies.forEach((dependency) => {
      const normalizedTarget = normalizePath(dependency.target)
      const entry: ReverseDependencyEntry = {
        source: normalizedSource,
        dependency: {
          ...dependency,
          target: normalizedTarget
        }
      }

      appendEntry(normalizedTarget, entry)

      pathAliasLookup.get(normalizedTarget)?.forEach((alias) => {
        appendEntry(alias, entry)
      })
    })
  })

  return reverseMap
}

export function prepareAnalysisSnapshot(
  analysisData: AnalysisData | null | undefined
): PreparedAnalysisSnapshot {
  if (!analysisData) {
    return {
      pathAliasLookup: new Map(),
      filesInCycle: new Set(),
      orphanFilesSet: new Set(),
      riskProfileMap: new Map(),
      fileReviewStoryMap: new Map(),
      nodeLookup: new Map(),
      reverseDependencyMap: new Map()
    }
  }

  const pathAliasLookup = createPathAliasLookup(analysisData.nodes)
  const filesInCycle = createAliasedPathSet(
    analysisData.issues.circularDependencies.flatMap((dependency) =>
      dependency.files.map((file) => normalizePath(file))
    ),
    pathAliasLookup
  )
  const orphanFilesSet = createAliasedPathSet(
    analysisData.issues.orphans.map((file) => normalizePath(file)),
    pathAliasLookup
  )

  return {
    pathAliasLookup,
    filesInCycle,
    orphanFilesSet,
    riskProfileMap: createRiskProfileMap(analysisData, pathAliasLookup),
    fileReviewStoryMap: buildFileReviewStoryMap(analysisData),
    nodeLookup: createNodeLookup(analysisData.nodes, pathAliasLookup),
    reverseDependencyMap: createReverseDependencyMap(
      analysisData.dependencyMap,
      pathAliasLookup
    )
  }
}
