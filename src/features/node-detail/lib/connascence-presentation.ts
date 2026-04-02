import {
  getBasename,
  getRelativePath,
  truncateMiddle
} from '../../../shared/lib/utils'
import {
  filterVisibleConnascenceSignals,
  getConnascenceHeadline,
  getConnascenceImpactSummary,
  getConnascenceReviewTargetsLabel,
  getConnascenceScopeLabel,
  hasActionableConnascenceGuidance
} from '../../../shared/lib/utils/connascence'

import type { ConnascenceSignal } from '../../../shared/types/analysis'

export interface NodeDetailConnascenceRelatedFile {
  filePath: string
  basename: string
  relativePath: string
  displayPath: string
}

export interface NodeDetailConnascenceItem {
  signalKey: string
  headline: string
  scopeLabel: string
  reviewTargetsLabel: string
  declarationPreview?: string
  impactSummary: string
  nextStep: string
  relatedFiles: NodeDetailConnascenceRelatedFile[]
  primaryActionLabel: string
  secondaryActionLabel: string
}

function mapRelatedFiles(
  filePaths: string[]
): NodeDetailConnascenceRelatedFile[] {
  return filePaths.map((filePath) => {
    const relativePath = getRelativePath(filePath)

    return {
      filePath,
      basename: getBasename(filePath),
      relativePath,
      displayPath: truncateMiddle(relativePath, 56)
    }
  })
}

export function buildNodeDetailConnascenceItems(
  signals: ConnascenceSignal[]
): NodeDetailConnascenceItem[] {
  return filterVisibleConnascenceSignals(signals)
    .filter(hasActionableConnascenceGuidance)
    .map((signal) => ({
      signalKey: signal.signalKey,
      headline: getConnascenceHeadline(signal),
      scopeLabel: getConnascenceScopeLabel(signal),
      reviewTargetsLabel: getConnascenceReviewTargetsLabel(signal),
      declarationPreview: signal.declarationPreview,
      impactSummary: getConnascenceImpactSummary(signal),
      nextStep: signal.recommendedAction,
      relatedFiles: mapRelatedFiles(signal.targetFiles),
      primaryActionLabel: 'Open Used By tab',
      secondaryActionLabel: 'Focus in graph'
    }))
}
