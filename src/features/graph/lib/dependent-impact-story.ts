import {
  formatReviewSignalBandRange,
  getImpactScopeThresholdCatalog,
  getThresholdBandById,
  resolveImpactScope
} from '@/shared/lib/metric-thresholds'

import type { ReviewThresholdCalibration } from '@/shared/lib/metric-thresholds'

export interface DependentImpactStory {
  title: string
  description: string
  footer: string
  tone: 'default' | 'warning' | 'danger'
  borderClass: string
  bgClass: string
  textClass: string
}

const moduleImpactScopeSignal = getImpactScopeThresholdCatalog('module')

export function describeDependentImpact(
  ca: number,
  thresholdCalibration?: ReviewThresholdCalibration
): DependentImpactStory {
  const impactScope = resolveImpactScope(ca, 'module', thresholdCalibration)
  const description =
    getThresholdBandById(moduleImpactScopeSignal.bands, impactScope)
      ?.description ??
    'Incoming cross-module dependency edges are limited, so review scope should stay relatively localized.'

  switch (impactScope) {
    case 'Broad':
      return {
        title: 'Broad Impact',
        description,
        footer: `Impact Scope band: ${formatReviewSignalBandRange('impactScope', 'Broad', 'module', thresholdCalibration)}.`,
        tone: 'danger',
        borderClass: 'border-status-critical-border',
        bgClass: 'bg-status-critical-surface',
        textClass: 'text-status-critical-foreground'
      }
    case 'Moderate':
      return {
        title: 'Moderate Impact',
        description,
        footer: `Impact Scope band: ${formatReviewSignalBandRange('impactScope', 'Moderate', 'module', thresholdCalibration)}.`,
        tone: 'warning',
        borderClass: 'border-status-warning-border',
        bgClass: 'bg-status-warning-surface',
        textClass: 'text-status-warning-foreground'
      }
    default:
      return {
        title: 'Local Impact',
        description,
        footer: `Impact Scope band: ${formatReviewSignalBandRange('impactScope', 'Local', 'module', thresholdCalibration)}.`,
        tone: 'default',
        borderClass: 'border-status-success-border',
        bgClass: 'bg-status-success-surface',
        textClass: 'text-status-success-foreground'
      }
  }
}
