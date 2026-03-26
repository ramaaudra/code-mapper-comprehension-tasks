import { reachabilityCopy } from '@/shared/content/reachabilityCopy'
import {
  getAssessmentMethodItemsFromCatalog,
  getChangePressureBandLabel,
  getExternalRelianceBandLabel,
  getImpactScopeBandLabel,
  getStructuralPositionBandLabel
} from '@/shared/lib/metric-thresholds'

import type {
  ChangePressure,
  ExternalReliance,
  ImpactScope,
  StructuralPosition
} from '@/shared/lib/metric-thresholds'
import type { DecisionTitle } from '@/shared/lib/utils/decision-assessment'

type Subject = 'file' | 'module'
type DependencyUnit = 'file' | 'module'

export const decisionCopy = {
  evidence: {
    labels: {
      impactScope: 'Files Affected if Changed',
      changeActivity: 'How Often This Changes',
      dependencies: 'External Dependencies',
      architectureRole: 'Structural Position'
    },
    assessmentMethodItems: getAssessmentMethodItemsFromCatalog()
  }
} as const

export function formatImpactScopeValueCopy(impactScope: ImpactScope): string {
  return getImpactScopeBandLabel(impactScope)
}

export function formatChangePressureValueCopy(
  changePressure: ChangePressure
): string {
  return getChangePressureBandLabel(changePressure)
}

export function formatExternalRelianceValueCopy(
  externalReliance: ExternalReliance
): string {
  return getExternalRelianceBandLabel(externalReliance)
}

export function formatStructuralPositionValueCopy(
  structuralPosition: StructuralPosition
): string {
  return getStructuralPositionBandLabel(structuralPosition)
}

export function formatImpactScopeHelperCopy(
  ca: number,
  unit: DependencyUnit = 'file'
): string {
  if (unit === 'module') {
    return `${ca} incoming cross-module dependency ${ca === 1 ? 'edge points' : 'edges point'} here`
  }

  return `${ca} ${ca === 1 ? 'file depends' : 'files depend'} on this`
}

export function formatChangePressureHelperCopy(relativeChurn: number): string {
  return `Relative churn (30d): ${(relativeChurn * 100).toFixed(1)}% of current size`
}

export function formatExternalRelianceHelperCopy(
  ce: number,
  unit: DependencyUnit = 'file'
): string {
  if (unit === 'module') {
    return ce === 0
      ? 'Depends on no outgoing cross-module dependencies'
      : `Depends on ${ce} outgoing cross-module dependency ${ce === 1 ? 'edge' : 'edges'}`
  }

  const singular = 'internal file'
  const plural = 'internal files'

  return ce === 0
    ? `Depends on no ${plural}`
    : `Depends on ${ce} ${ce === 1 ? singular : plural}`
}

export function formatStructuralPositionHelperCopy(
  instability: number
): string {
  return `Instability: ${instability.toFixed(2)}`
}

export function getDecisionHeadlineCopy(params: {
  title: DecisionTitle
  impactScope: ImpactScope
  changePressure: ChangePressure
  hasCycle: boolean
  isOrphan: boolean
}): string {
  const { title, impactScope, changePressure, hasCycle, isOrphan } = params

  if (hasCycle && isOrphan) {
    return 'Circular dependency in a possibly unreachable path'
  }

  if (hasCycle) {
    return 'Circular dependency requires extra care'
  }

  if (isOrphan) {
    return 'Possibly unreachable from detected entry points'
  }

  if (title === 'Critical Hotspot') {
    return 'Frequent changes, broad impact'
  }

  if (title === 'Active but Local') {
    return impactScope === 'Moderate'
      ? 'Frequent changes, narrower spread'
      : 'Frequent changes, mostly local impact'
  }

  if (title === 'Shared Foundation') {
    return changePressure === 'Moderate'
      ? 'Widely shared, still active'
      : 'Widely shared, change carefully'
  }

  if (impactScope === 'Moderate' && changePressure === 'Moderate') {
    return 'Moderate activity, limited spread'
  }

  if (impactScope === 'Moderate') {
    return 'Contained area, some coordination needed'
  }

  if (changePressure === 'Moderate') {
    return 'Mostly local, still seeing recent edits'
  }

  return 'Low recent activity, mostly local impact'
}

export function getDecisionBasisSummaryCopy(params: {
  hasCycle: boolean
  isOrphan: boolean
  changeHistoryAvailable?: boolean
}): string {
  const { hasCycle, isOrphan, changeHistoryAvailable = true } = params

  if (hasCycle && isOrphan) {
    if (!changeHistoryAvailable) {
      return 'Based on cycle participation and entry-point reachability in the current analysis. Git history is unavailable for recent change signals.'
    }

    return 'Based on cycle participation, entry-point reachability, and recent change pressure.'
  }

  if (hasCycle) {
    if (!changeHistoryAvailable) {
      return 'Based on cycle participation and downstream impact. Git history is unavailable for recent change signals.'
    }
    return 'Based on cycle participation, downstream impact, and recent change pressure.'
  }

  if (isOrphan) {
    return 'Based on entry-point reachability in the current analysis.'
  }

  if (!changeHistoryAvailable) {
    return 'Based on downstream impact, external reliance, and structural position. Git history is unavailable for recent change signals.'
  }

  return 'Based on repository signals: change pressure, downstream impact, external reliance, and structural position.'
}

export function getOrphanDecisionCopy() {
  return {
    summary: reachabilityCopy.detailDescription,
    whyItMatters: `It may be a cleanup candidate, but ${reachabilityCopy.verificationHint.toLowerCase()} before you treat it as safe to remove.`,
    actions: [
      'Verify whether this path is still used through runtime loading, tests, scripts, or dynamic imports.',
      'If the path is truly unused, consider cleanup or consolidation after confirmation.'
    ],
    topDrivers: [
      `The current entry-point analysis did not reach this path.`,
      'This may be easier to clean up than broadly reused areas.',
      'Verification is still needed before you treat it as safe to remove.'
    ]
  }
}

export function getCycleDecisionCopy(
  subject: Subject,
  options?: {
    isPossiblyUnreachable?: boolean
  }
) {
  if (options?.isPossiblyUnreachable) {
    return {
      summary: `This ${subject} sits in a circular dependency. Entry-point analysis also did not reach this path, but the cycle risk still takes priority.`,
      whyItMatters:
        'Do not treat this as a safe cleanup candidate until the full cycle and any runtime usage are verified.',
      actions: [
        'Review the full dependency cycle before merging.',
        'Verify whether runtime loading, tests, scripts, or dynamic imports still reach this path.',
        'Avoid deleting or refactoring it as isolated work until the cycle is understood.'
      ],
      topDrivers: [
        'This area participates in a circular dependency.',
        'The current entry-point analysis did not reach this path.',
        'Cycle risk still dominates because changes can feed back through the same dependency chain.'
      ]
    }
  }

  return {
    summary: `This ${subject} sits in a circular dependency and needs careful review.`,
    whyItMatters:
      'Circular dependencies increase maintenance and verification cost, and changes can behave unexpectedly across the same dependency chain.',
    actions: [
      'Keep the change small and focused.',
      'Review the full dependency cycle before merging.',
      'Prefer breaking the cycle over adding new responsibilities here.'
    ],
    topDrivers: [
      'This area participates in a circular dependency.',
      'Changes can feed back through the same dependency chain.',
      'Verification cost is higher because behavior can loop unexpectedly.'
    ]
  }
}

export function getCriticalHotspotDecisionCopy(subject: Subject) {
  return {
    summary: `This ${subject} changes frequently and affects many other parts of the system.`,
    whyItMatters:
      'Recent change pressure combines with broad downstream impact, so review and verification scope can spread quickly.',
    actions: [
      'Keep the change small and focused.',
      'Review dependents before merging.',
      'Run broader regression checks.'
    ],
    topDrivers: [
      'Recent change pressure is high.',
      'Many other parts depend on this area.',
      'Verification scope can spread quickly after a change.'
    ]
  }
}

export function getActiveButLocalDecisionCopy(params: {
  subject: Subject
  impactScope: ImpactScope
}) {
  const { subject, impactScope } = params

  if (impactScope === 'Moderate') {
    return {
      summary: `This ${subject} changes frequently and has noticeable downstream impact, but it is not as widely shared as a broad hotspot.`,
      whyItMatters:
        'Recent change pressure is high and some downstream coordination is likely, but verification scope is still narrower than in broad shared areas.',
      actions: [
        'Keep changes focused and easy to review.',
        'Check the closest dependents before merging.',
        'Stabilize repeated edits if this area keeps changing.'
      ],
      topDrivers: [
        'Recent change pressure is high in this area.',
        'Several nearby dependents may still need coordination.',
        'Impact is noticeable, but narrower than a broad shared hotspot.'
      ]
    }
  }

  return {
    summary: `This ${subject} changes frequently, but its downstream impact stays relatively contained.`,
    whyItMatters:
      'The recent edit pattern suggests active refinement, but review scope is still smaller than in broad shared areas.',
    actions: [
      'Keep changes self-contained.',
      'Prefer local refactoring over adding more responsibilities.',
      'Stabilize repeated edits if this area keeps changing.'
    ],
    topDrivers: [
      'Recent change pressure is high in this area.',
      'Downstream impact stays relatively contained.',
      'This pattern often signals active refinement rather than broad shared risk.'
    ]
  }
}

export function getSharedFoundationDecisionCopy(params: {
  subject: Subject
  changePressure: ChangePressure
  changeHistoryAvailable?: boolean
}) {
  const { subject, changePressure, changeHistoryAvailable = true } = params

  if (!changeHistoryAvailable) {
    return {
      summary: `This ${subject} is shared across the codebase, but recent change history is unavailable.`,
      whyItMatters:
        'Many other parts still rely on it, so review scope can widen even without Git-backed activity data.',
      actions: [
        'Proceed carefully with clear intent.',
        'Review downstream dependents before merging.',
        'Prefer incremental changes over broad rewrites.'
      ],
      topDrivers: [
        'Many other parts rely on this area.',
        'Recent change history is unavailable, so this read is based on structural signals.',
        'Verification scope can widen quickly because the area is broadly shared.'
      ]
    }
  }

  if (changePressure === 'Moderate') {
    return {
      summary: `This ${subject} is shared across the codebase and still sees some recent change activity.`,
      whyItMatters:
        'It is not the hottest area in the repository, but many other parts still rely on it, so verification scope can widen quickly.',
      actions: [
        'Proceed carefully with clear intent.',
        'Review downstream dependents before merging.',
        'Prefer incremental changes over broad rewrites.'
      ],
      topDrivers: [
        'Many other parts still rely on this area.',
        'Recent activity is present even if this is not the hottest area.',
        'Verification scope can widen quickly because the area is broadly shared.'
      ]
    }
  }

  return {
    summary: `This ${subject} is stable, but many other parts rely on it.`,
    whyItMatters:
      'Even though it changes less often, mistakes here can increase downstream review needs across the codebase.',
    actions: [
      'Proceed carefully with clear intent.',
      'Review downstream dependents before merging.',
      'Prefer incremental changes over broad rewrites.'
    ],
    topDrivers: [
      'Many other parts rely on this area.',
      'Even a small mistake here can widen downstream review scope.',
      'Its position matters more than its recent churn.'
    ]
  }
}

export function getLikelyLocalDecisionCopy(params: {
  subject: Subject
  impactScope: ImpactScope
  changePressure: ChangePressure
  changeHistoryAvailable?: boolean
}) {
  const {
    subject,
    impactScope,
    changePressure,
    changeHistoryAvailable = true
  } = params

  if (!changeHistoryAvailable) {
    if (impactScope === 'Moderate') {
      return {
        summary: `This ${subject} is more contained than a broad shared area, but some downstream coordination is still likely.`,
        whyItMatters:
          'Recent change history is unavailable, so this read is based on structural impact rather than churn.',
        actions: [
          'Use normal review and testing discipline.',
          'Check the closest dependents before merging.'
        ],
        topDrivers: [
          'Some downstream coordination is still likely here.',
          'Recent change history is unavailable, so this read is structural only.',
          'Impact is narrower than in a broad shared area.'
        ]
      }
    }

    return {
      summary: `This ${subject} appears relatively contained based on the current dependency graph.`,
      whyItMatters:
        'Recent change history is unavailable, so this read is based on structural impact rather than churn.',
      actions: [
        'A focused feature change or local refactor is more feasible here.',
        'Use normal review and testing discipline.'
      ],
      topDrivers: [
        'Downstream impact is relatively contained.',
        'Recent change history is unavailable, so this read is structural only.',
        'A focused change is easier to isolate than in shared hotspots.'
      ]
    }
  }

  if (impactScope === 'Moderate' && changePressure === 'Moderate') {
    return {
      summary: `This ${subject} sits in a manageable middle ground: it is more contained than a shared foundation, but it still deserves normal coordination.`,
      whyItMatters:
        'Both recent change activity and downstream impact are moderate, so this area is usually workable without being trivial.',
      actions: [
        'Use normal review and testing discipline.',
        'Check the nearest dependents before merging.',
        'Keep the change scoped to one intent.'
      ],
      topDrivers: [
        'Recent change activity is moderate rather than quiet.',
        'Downstream impact is also moderate rather than purely local.',
        'This area is manageable, but it still deserves normal coordination.'
      ]
    }
  }

  if (impactScope === 'Moderate') {
    return {
      summary: `This ${subject} is more contained than a broad shared area, but some downstream coordination is still likely.`,
      whyItMatters:
        'Review scope is still narrower than in a shared foundation, but changes are not purely local.',
      actions: [
        'Use normal review and testing discipline.',
        'Check the closest dependents before merging.'
      ],
      topDrivers: [
        'Some downstream coordination is still likely here.',
        'Impact is narrower than in a broad shared area.',
        'This is not purely local work even if it is more contained.'
      ]
    }
  }

  if (changePressure === 'Moderate') {
    return {
      summary: `This ${subject} is still relatively contained, but it has seen some recent change activity.`,
      whyItMatters:
        'Recent edits are present, but downstream impact remains smaller than in broad shared areas.',
      actions: [
        'Keep the change scoped and easy to review.',
        'Use normal review and testing discipline.'
      ],
      topDrivers: [
        'Recent edits are present in this area.',
        'Downstream impact remains smaller than in broad shared areas.',
        'The area is still workable without broad coordination.'
      ]
    }
  }

  return {
    summary: `This ${subject} appears relatively contained and under lower recent change pressure.`,
    whyItMatters:
      'Recent change activity is lower and downstream impact is smaller than in broad-impact or high-pressure areas.',
    actions: [
      'A focused feature change or local refactor is more feasible here.',
      'Use normal review and testing discipline.'
    ],
    topDrivers: [
      'Recent change pressure is lower here.',
      'Downstream impact is relatively contained.',
      'A focused change is easier to isolate than in shared hotspots.'
    ]
  }
}
