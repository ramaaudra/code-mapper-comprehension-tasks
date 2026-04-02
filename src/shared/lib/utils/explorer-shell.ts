import { shellCopy } from '../../content/shellCopy.ts'

import type {
  ExplorerContextChip,
  ExplorerViewMode,
  GraphViewMode
} from '../../types/explorer.ts'

type LegacyMetricsGuideMode = 'quick' | 'reference'

export const METRICS_GUIDE_SECTION_IDS = [
  'start-here',
  'how-to-read',
  'decision-matrix',
  'which-screen',
  'caveats-terms'
] as const

export type MetricsGuideSectionId = (typeof METRICS_GUIDE_SECTION_IDS)[number]

interface ParsedMetricsGuideHash {
  section?: MetricsGuideSectionId
}

interface ResolveExplorerContextChipOptions {
  viewMode: ExplorerViewMode
  graphViewMode: GraphViewMode
  currentHash: string
  hasUnresolvedImports: boolean
}

interface ResolveAnalysisShellStateOptions {
  hasAnalysisData: boolean
  isLoading: boolean
}

const metricsGuideSectionSet = new Set<string>(METRICS_GUIDE_SECTION_IDS)

const legacyMetricsGuideSectionMap: Record<string, MetricsGuideSectionId> = {
  'what-you-can-do': 'start-here',
  'key-ideas': 'start-here',
  'visual-primer': 'how-to-read',
  'core-metrics': 'how-to-read',
  'derived-heuristics': 'how-to-read',
  'decision-matrix': 'decision-matrix',
  screens: 'which-screen',
  glossary: 'caveats-terms',
  'important-caveats': 'caveats-terms'
}

function isMetricsGuideSectionId(
  value: string
): value is MetricsGuideSectionId {
  return metricsGuideSectionSet.has(value)
}

function mapLegacyMetricsGuideSection(
  section?: string,
  mode?: LegacyMetricsGuideMode
): MetricsGuideSectionId | undefined {
  if (!section) {
    if (mode === 'quick') {
      return 'start-here'
    }

    if (mode === 'reference') {
      return 'how-to-read'
    }

    return undefined
  }

  if (mode === 'reference' && section === 'how-to-read') {
    return 'which-screen'
  }

  return legacyMetricsGuideSectionMap[section]
}

export function parseMetricsGuideHash(
  hash: string
): ParsedMetricsGuideHash | null {
  if (!hash) {
    return null
  }

  const normalizedHash = hash.toLowerCase()
  const bareHash = normalizedHash.replace(/^#/, '')

  if (isMetricsGuideSectionId(bareHash)) {
    return { section: bareHash }
  }

  if (!normalizedHash.startsWith('#metrics-guide')) {
    return null
  }

  const parts = normalizedHash
    .replace('#metrics-guide', '')
    .split('/')
    .filter(Boolean)

  if (parts.length === 0) {
    return {}
  }

  const [first, second] = parts

  if (first === 'quick' || first === 'reference') {
    const section = mapLegacyMetricsGuideSection(second, first)
    return section ? { section } : {}
  }

  if (isMetricsGuideSectionId(first)) {
    return { section: first }
  }

  const legacySection = mapLegacyMetricsGuideSection(first)
  return legacySection ? { section: legacySection } : {}
}

export function isMetricsGuideHash(hash: string): boolean {
  return parseMetricsGuideHash(hash) !== null
}

export function buildMetricsGuideHash(section?: MetricsGuideSectionId): string {
  return section ? `#metrics-guide/${section}` : '#metrics-guide'
}

export function resolveAnalysisShellState({
  hasAnalysisData,
  isLoading
}: ResolveAnalysisShellStateOptions): 'ready' | 'loading' | 'empty' {
  if (hasAnalysisData) {
    return 'ready'
  }

  if (isLoading) {
    return 'loading'
  }

  return 'empty'
}

export function resolveExplorerContextChip({
  viewMode,
  graphViewMode,
  currentHash: _currentHash,
  hasUnresolvedImports: _hasUnresolvedImports
}: ResolveExplorerContextChipOptions): ExplorerContextChip | null {
  if (viewMode === 'cycle-triage') {
    return {
      label: shellCopy.contextChips.cycles.triage
    }
  }

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
