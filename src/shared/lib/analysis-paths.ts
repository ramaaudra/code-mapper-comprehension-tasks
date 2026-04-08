import { normalizePath } from '@/shared/lib/utils'

import type { AnalysisNode } from '@/shared/types/analysis'

export type PathAliasLookup = Map<string, Set<string>>

export function createPathAliasLookup(nodes: AnalysisNode[]): PathAliasLookup {
  const lookup: PathAliasLookup = new Map()

  const addAlias = (source: string, alias: string) => {
    const normalizedSource = normalizePath(source)
    const normalizedAlias = normalizePath(alias)

    if (
      !normalizedSource ||
      !normalizedAlias ||
      normalizedSource === normalizedAlias
    ) {
      return
    }

    const aliases = lookup.get(normalizedSource) ?? new Set<string>()
    aliases.add(normalizedAlias)
    lookup.set(normalizedSource, aliases)
  }

  nodes.forEach((node) => {
    if (
      !node?.id ||
      typeof node.label !== 'string' ||
      node.label.length === 0
    ) {
      return
    }

    addAlias(node.id, node.label)
    addAlias(node.label, node.id)
  })

  return lookup
}

export function createAliasedPathSet(
  paths: string[],
  nodesOrLookup: AnalysisNode[] | PathAliasLookup
): Set<string> {
  const lookup = Array.isArray(nodesOrLookup)
    ? createPathAliasLookup(nodesOrLookup)
    : nodesOrLookup

  const aliasedPaths = new Set<string>()

  paths.forEach((path) => {
    const normalizedPath = normalizePath(path)
    aliasedPaths.add(normalizedPath)

    const aliases = lookup.get(normalizedPath)
    aliases?.forEach((alias) => {
      aliasedPaths.add(alias)
    })
  })

  return aliasedPaths
}
