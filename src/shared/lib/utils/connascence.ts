import type { ConnascenceSignal } from '@/shared/types/analysis'

function dedupeConnascenceSignals(
  signals: ConnascenceSignal[]
): ConnascenceSignal[] {
  const deduped = new Map<string, ConnascenceSignal>()

  for (const signal of signals) {
    if (!deduped.has(signal.signalKey)) {
      deduped.set(signal.signalKey, signal)
    }
  }

  return [...deduped.values()]
}

export function filterVisibleConnascenceSignals(
  signals: ConnascenceSignal[]
): ConnascenceSignal[] {
  return dedupeConnascenceSignals(
    signals.filter((signal) => signal.confidence !== 'low')
  )
}

export function hasActionableConnascenceGuidance(
  signal: ConnascenceSignal
): boolean {
  return (
    signal.whyItMatters.trim().length > 0 &&
    signal.recommendedAction.trim().length > 0
  )
}

export function getConnascenceHeadline(signal: ConnascenceSignal): string {
  switch (signal.kind) {
    case 'fragile-positional-api':
      return `${signal.symbolName} depends on argument order`
    case 'shared-type-contract':
      return `${signal.typeName} is a shared type contract`
  }
}

export function getConnascenceScopeLabel(signal: ConnascenceSignal): string {
  return signal.moduleBoundaryCount > 1 ? 'Cross-module' : 'Mostly local'
}

export function getConnascenceReviewTargetsLabel(
  signal: ConnascenceSignal
): string {
  const count = signal.targetFiles.length

  if (signal.kind === 'fragile-positional-api') {
    return `${count} caller ${count === 1 ? 'file' : 'files'}`
  }

  return `${count} consumer ${count === 1 ? 'file' : 'files'}`
}

export function getConnascenceImpactSummary(signal: ConnascenceSignal): string {
  const count = signal.targetFiles.length

  if (signal.kind === 'fragile-positional-api') {
    return `Changing the parameter order here may require updates in ${count} caller ${count === 1 ? 'file' : 'files'}.`
  }

  return `Changing this shared type may require updates in ${count} consumer ${count === 1 ? 'file' : 'files'}.`
}

interface GetFileConnascenceSignalsInput {
  filePath: string
  architectureSignals?: ConnascenceSignal[] | null
  analysisFileSignals?: Record<string, ConnascenceSignal[] | undefined> | null
}

export function getFileConnascenceSignals({
  filePath,
  architectureSignals,
  analysisFileSignals
}: GetFileConnascenceSignalsInput): ConnascenceSignal[] {
  if (architectureSignals && architectureSignals.length > 0) {
    return filterVisibleConnascenceSignals(architectureSignals)
  }

  return filterVisibleConnascenceSignals(analysisFileSignals?.[filePath] ?? [])
}

export function getModuleConnascenceSignals(
  signals: ConnascenceSignal[] | null | undefined
): ConnascenceSignal[] {
  return filterVisibleConnascenceSignals(signals ?? [])
}
