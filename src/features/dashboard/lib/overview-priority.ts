import { isActionableHotspotStatus } from '@/shared/lib/metric-thresholds'

import type { HotspotStatus } from '@/shared/types/analysis'
import type { RiskLevel } from '@/shared/types/risk'

export interface OverviewRiskItem {
  path: string
  riskScore: number
  instability: number
  fanIn: number
}

export interface OverviewHotspotItem {
  modulePath: string
  relativeChurn30d: number
  hotspotScore: number
  hotspotPercentile: number
  hotspotStatus: HotspotStatus
}

export type OverviewReviewTarget =
  | {
      kind: 'cycles'
      ctaLabel: string
      value?: undefined
    }
  | {
      kind: 'issues'
      ctaLabel: string
      value?: undefined
    }
  | {
      kind: 'module'
      ctaLabel: string
      value: string
    }
  | {
      kind: 'overview'
      ctaLabel: string
      value?: undefined
    }

export interface OverviewReviewQueueItem {
  id: string
  tone: RiskLevel | 'info'
  title: string
  reason: string
  recommendedAction: string
  evidenceLabel: string
  target: OverviewReviewTarget
}

export interface BuildOverviewReviewQueueInput {
  cycleCount: number
  orphanCount: number
  criticalRisks: OverviewRiskItem[]
  warningRisks: OverviewRiskItem[]
  topHotspot: OverviewHotspotItem | null
}

export function buildOverviewReviewQueue(
  input: BuildOverviewReviewQueueInput
): OverviewReviewQueueItem[] {
  const items: OverviewReviewQueueItem[] = []

  if (input.cycleCount > 0) {
    items.push({
      id: 'cycles',
      tone: 'critical',
      title: 'Break dependency cycles before broader refactors',
      reason:
        'Cycles widen retest scope and make refactors less predictable across the codebase.',
      recommendedAction:
        'Open the cycle triage workspace and break the smallest loop first.',
      evidenceLabel: `${input.cycleCount} active cycle${input.cycleCount === 1 ? '' : 's'}`,
      target: {
        kind: 'cycles',
        ctaLabel: 'Review cycles'
      }
    })
  }

  const topCriticalRisk = input.criticalRisks[0]
  if (topCriticalRisk) {
    items.push({
      id: `critical-risk:${topCriticalRisk.path}`,
      tone: 'critical',
      title: `Review ${topCriticalRisk.path} before editing shared flows`,
      reason:
        'Changes here can spread into many dependent modules, so a local edit may need broader verification.',
      recommendedAction:
        'Inspect nearby consumers before merging and treat the change as shared infrastructure work.',
      evidenceLabel: `Shared by ${topCriticalRisk.fanIn} dependent module${topCriticalRisk.fanIn === 1 ? '' : 's'}`,
      target: {
        kind: 'module',
        value: topCriticalRisk.path,
        ctaLabel: 'Open module'
      }
    })
  }

  if (
    input.topHotspot &&
    isActionableHotspotStatus(input.topHotspot.hotspotStatus)
  ) {
    items.push({
      id: `hotspot:${input.topHotspot.modulePath}`,
      tone:
        input.topHotspot.hotspotStatus === 'critical-hotspot'
          ? 'critical'
          : 'high',
      title: `Review ${input.topHotspot.modulePath} while this module is still changing`,
      reason:
        'Recent churn is still concentrated here, so another edit deserves closer review before the area settles down.',
      recommendedAction:
        'Check recent consumers, changed files, and nearby tests before merging more work into this module.',
      evidenceLabel: `${Math.round(input.topHotspot.relativeChurn30d * 100)}% relative churn in 30 days`,
      target: {
        kind: 'module',
        value: input.topHotspot.modulePath,
        ctaLabel: 'Open module'
      }
    })
  }

  const topWarningRisk = input.warningRisks[0]
  if (topWarningRisk) {
    items.push({
      id: `warning-risk:${topWarningRisk.path}`,
      tone: 'high',
      title: `Plan broader checks before editing ${topWarningRisk.path}`,
      reason:
        'This shared area can still spread change beyond a local edit, even if it is not in the critical band.',
      recommendedAction:
        'Review dependent modules and widen verification before you merge structural edits here.',
      evidenceLabel: `Shared by ${topWarningRisk.fanIn} dependent module${topWarningRisk.fanIn === 1 ? '' : 's'}`,
      target: {
        kind: 'module',
        value: topWarningRisk.path,
        ctaLabel: 'Open module'
      }
    })
  }

  if (input.orphanCount > 0) {
    items.push({
      id: 'cleanup-candidates',
      tone: 'info',
      title: `Validate ${input.orphanCount} cleanup candidate${input.orphanCount === 1 ? '' : 's'} after blocker work`,
      reason:
        'These files may be removable, but they are lower priority than active structural risk.',
      recommendedAction:
        'Check dynamic imports, scripts, and tests before deleting anything.',
      evidenceLabel: `${input.orphanCount} possible unreachable file${input.orphanCount === 1 ? '' : 's'}`,
      target: {
        kind: 'issues',
        ctaLabel: 'Review current issues'
      }
    })
  }

  if (items.length === 0) {
    items.push({
      id: 'healthy-baseline',
      tone: 'info',
      title: 'No urgent review blockers detected',
      reason:
        'Nothing in the current analysis is pushing this repository into a high-risk review posture.',
      recommendedAction:
        'Start with your planned change and keep review focused on nearby consumers and tests.',
      evidenceLabel: 'Normal review posture',
      target: {
        kind: 'overview',
        ctaLabel: 'Stay on overview'
      }
    })
  }

  return items
}

export function getOverviewSectionOrder(): string[] {
  return ['start-here', 'current-issues', 'system-context', 'quick-snapshot']
}
