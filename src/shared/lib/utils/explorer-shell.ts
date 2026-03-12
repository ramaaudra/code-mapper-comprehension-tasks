import { shellCopy } from '../../content/shellCopy.ts'

import type {
  ExplorerContextChip,
  ExplorerViewMode,
  GraphViewMode,
  MetricsGuideMode
} from '../../types/explorer.ts'

interface ParsedMetricsGuideHash {
  mode: MetricsGuideMode
  section?: string
}

interface ResolveExplorerContextChipOptions {
  viewMode: ExplorerViewMode
  graphViewMode: GraphViewMode
  currentHash: string
  hasUnresolvedImports: boolean
}

export function parseMetricsGuideHash(
  hash: string
): ParsedMetricsGuideHash | null {
  if (!hash.startsWith('#metrics-guide')) {
    return null
  }

  const parts = hash.replace('#metrics-guide', '').split('/').filter(Boolean)
  const mode: MetricsGuideMode =
    parts[0] === 'reference' ? 'reference' : 'quick'
  const section = parts[1]

  return section ? { mode, section } : { mode }
}

export function buildMetricsGuideHash(
  mode: MetricsGuideMode,
  section?: string
) {
  return section
    ? `#metrics-guide/${mode}/${section}`
    : `#metrics-guide/${mode}`
}

export function resolveExplorerContextChip({
  viewMode,
  graphViewMode,
  currentHash: _currentHash,
  hasUnresolvedImports: _hasUnresolvedImports
}: ResolveExplorerContextChipOptions): ExplorerContextChip | null {
  if (viewMode === 'graph') {
    if (graphViewMode === 'module') {
      return {
        label: shellCopy.contextChips.graph.module
      }
    }

    return null
  }

  return null
}
