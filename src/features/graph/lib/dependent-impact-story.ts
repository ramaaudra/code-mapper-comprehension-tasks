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
        borderClass: 'border-red-500/40',
        bgClass: 'bg-red-500/5',
        textClass: 'text-red-500'
      }
    case 'Moderate':
      return {
        title: 'Moderate Impact',
        description,
        footer: `Impact Scope band: ${formatReviewSignalBandRange('impactScope', 'Moderate', 'module', thresholdCalibration)}.`,
        tone: 'warning',
        borderClass: 'border-orange-500/40',
        bgClass: 'bg-orange-500/5',
        textClass: 'text-orange-500'
      }
    default:
      return {
        title: 'Local Impact',
        description,
        footer: `Impact Scope band: ${formatReviewSignalBandRange('impactScope', 'Local', 'module', thresholdCalibration)}.`,
        tone: 'default',
        borderClass: 'border-slate-500/40',
        bgClass: 'bg-slate-500/5',
        textClass: 'text-slate-500'
      }
  }
}
