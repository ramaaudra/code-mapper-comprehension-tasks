import {
  getBasename,
  getRelativePath,
  truncateMiddle
} from '../../../shared/lib/utils'
import {
  getConnascenceHeadline,
  getConnascenceImpactSummary,
  getConnascenceReviewTargetsLabel,
  getConnascenceScopeLabel,
  getModuleConnascenceSignals,
  hasActionableConnascenceGuidance
} from '../../../shared/lib/utils/connascence'

import type { ConnascenceSignal } from '../../../shared/types/analysis'

export interface ModuleConnascenceFileRef {
  filePath: string
  basename: string
  relativePath: string
  displayPath: string
}

export interface ModuleConnascenceItem {
  signalKey: string
  headline: string
  scopeLabel: string
  reviewTargetsLabel: string
  impactSummary: string
  nextStep: string
  declarationFile: ModuleConnascenceFileRef
  relatedFiles: ModuleConnascenceFileRef[]
}

function mapFileRef(filePath: string): ModuleConnascenceFileRef {
  const relativePath = getRelativePath(filePath)

  return {
    filePath,
    basename: getBasename(filePath),
    relativePath,
    displayPath: truncateMiddle(relativePath, 56)
  }
}

export function buildModuleConnascenceItems(
  signals: ConnascenceSignal[]
): ModuleConnascenceItem[] {
  return getModuleConnascenceSignals(signals)
    .filter(hasActionableConnascenceGuidance)
    .map((signal) => ({
      signalKey: signal.signalKey,
      headline: getConnascenceHeadline(signal),
      scopeLabel: getConnascenceScopeLabel(signal),
      reviewTargetsLabel: getConnascenceReviewTargetsLabel(signal),
      impactSummary: getConnascenceImpactSummary(signal),
      nextStep: signal.recommendedAction,
      declarationFile: mapFileRef(signal.declaredIn),
      relatedFiles: signal.targetFiles.map(mapFileRef)
    }))
}
