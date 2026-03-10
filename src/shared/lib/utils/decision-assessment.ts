export type DecisionStatusTone =
  | 'default'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger'

export type DecisionTitle =
  | 'Possibly Unused File'
  | 'Critical Hotspot'
  | 'Active but Local'
  | 'Shared Foundation'
  | 'Likely Local Change'

export type ReviewPriority =
  | 'Critical Hotspot'
  | 'High Review Priority'
  | 'Normal Review Priority'
  | 'Low Review Priority'

export type ImpactScope = 'Broad' | 'Moderate' | 'Local'
export type ChangePressure = 'High' | 'Moderate' | 'Low'
export type ExternalReliance = 'High' | 'Moderate' | 'Low'
export type StructuralPosition =
  | 'Foundation-like'
  | 'Balanced'
  | 'Outward-Dependent'

export interface DecisionAssessment {
  title: DecisionTitle
  summary: string
  whyItMatters: string
  actions: string[]
  reviewPriority: ReviewPriority
  impactScope: ImpactScope | 'Local'
  changePressure: ChangePressure
  externalReliance: ExternalReliance
  structuralPosition: StructuralPosition
  tone: DecisionStatusTone
}

export interface ImpactScopeThresholds {
  broad: number
  moderate: number
}

export interface DecisionAssessmentInput {
  kind: 'file' | 'module'
  hasCycle: boolean
  ca: number
  ce: number
  instability: number
  relativeChurn30d: number
  impactScopeThresholds: ImpactScopeThresholds
  isOrphan?: boolean
}

function getImpactScope(
  ca: number,
  thresholds: ImpactScopeThresholds
): ImpactScope {
  if (ca >= thresholds.broad) {
    return 'Broad'
  }

  if (ca >= thresholds.moderate) {
    return 'Moderate'
  }

  return 'Local'
}

function getChangePressure(relativeChurn: number): ChangePressure {
  if (relativeChurn >= 0.3) {
    return 'High'
  }

  if (relativeChurn >= 0.1) {
    return 'Moderate'
  }

  return 'Low'
}

function getExternalReliance(ce: number): ExternalReliance {
  if (ce >= 10) {
    return 'High'
  }

  if (ce >= 4) {
    return 'Moderate'
  }

  return 'Low'
}

function getStructuralPosition(instability: number): StructuralPosition {
  if (instability >= 0.7) {
    return 'Outward-Dependent'
  }

  if (instability >= 0.4) {
    return 'Balanced'
  }

  return 'Foundation-like'
}

function getDecisionTitle(
  impactScope: ImpactScope,
  changePressure: ChangePressure
): Exclude<DecisionTitle, 'Possibly Unused File'> {
  const hasBroadImpact = impactScope === 'Broad'
  const hasHighChangePressure = changePressure === 'High'

  if (hasBroadImpact && hasHighChangePressure) {
    return 'Critical Hotspot'
  }

  if (hasHighChangePressure) {
    return 'Active but Local'
  }

  if (hasBroadImpact) {
    return 'Shared Foundation'
  }

  return 'Likely Local Change'
}

function createActiveButLocalCopy(params: {
  subject: 'file' | 'module'
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
    ]
  }
}

function createSharedFoundationCopy(params: {
  subject: 'file' | 'module'
  changePressure: ChangePressure
}) {
  const { subject, changePressure } = params

  if (changePressure === 'Moderate') {
    return {
      summary: `This ${subject} is shared across the codebase and still sees some recent change activity.`,
      whyItMatters:
        'It is not the hottest area in the repository, but many other parts still rely on it, so verification scope can widen quickly.',
      actions: [
        'Proceed carefully with clear intent.',
        'Review downstream dependents before merging.',
        'Prefer incremental changes over broad rewrites.'
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
    ]
  }
}

function createLikelyLocalChangeCopy(params: {
  subject: 'file' | 'module'
  impactScope: ImpactScope
  changePressure: ChangePressure
}) {
  const { subject, impactScope, changePressure } = params

  if (impactScope === 'Moderate' && changePressure === 'Moderate') {
    return {
      summary: `This ${subject} sits in a manageable middle ground: it is more contained than a shared foundation, but it still deserves normal coordination.`,
      whyItMatters:
        'Both recent change activity and downstream impact are moderate, so this area is usually workable without being trivial.',
      actions: [
        'Use normal review and testing discipline.',
        'Check the nearest dependents before merging.',
        'Keep the change scoped to one intent.'
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
    ]
  }
}

function getDecisionTone(
  title: DecisionTitle,
  hasCycle: boolean
): DecisionStatusTone {
  if (hasCycle || title === 'Critical Hotspot') {
    return 'danger'
  }

  if (title === 'Active but Local') {
    return 'warning'
  }

  if (title === 'Shared Foundation') {
    return 'info'
  }

  return 'success'
}

function getReviewPriority(params: {
  title: DecisionTitle
  hasCycle: boolean
  impactScope: ImpactScope
  changePressure: ChangePressure
  isOrphan: boolean
}): ReviewPriority {
  const { title, hasCycle, impactScope, changePressure, isOrphan } = params

  if (isOrphan) {
    return 'Low Review Priority'
  }

  if (hasCycle || title === 'Critical Hotspot') {
    return 'Critical Hotspot'
  }

  if (title === 'Active but Local' || title === 'Shared Foundation') {
    return 'High Review Priority'
  }

  if (impactScope === 'Moderate' || changePressure === 'Moderate') {
    return 'Normal Review Priority'
  }

  return 'Low Review Priority'
}

export function createDecisionAssessment(
  input: DecisionAssessmentInput
): DecisionAssessment {
  const {
    kind,
    hasCycle,
    ca,
    ce,
    instability,
    relativeChurn30d,
    impactScopeThresholds,
    isOrphan = false
  } = input

  const subject = kind === 'file' ? 'file' : 'module'
  const impactScope = getImpactScope(ca, impactScopeThresholds)
  const changePressure = getChangePressure(relativeChurn30d)
  const externalReliance = getExternalReliance(ce)
  const structuralPosition = getStructuralPosition(instability)

  if (isOrphan) {
    return {
      title: 'Possibly Unused File',
      summary: 'This file appears isolated in the current analysis.',
      whyItMatters:
        'No dependents were detected in the current graph, so change impact is usually more contained than in shared files.',
      actions: [
        'Verify whether this file is still used through dynamic imports, tests, or scripts.',
        'If it is truly unused, consider cleanup or consolidation.'
      ],
      reviewPriority: 'Low Review Priority',
      impactScope: 'Local',
      changePressure,
      externalReliance,
      structuralPosition,
      tone: 'success'
    }
  }

  const title = hasCycle
    ? 'Critical Hotspot'
    : getDecisionTitle(impactScope, changePressure)
  const reviewPriority = getReviewPriority({
    title,
    hasCycle,
    impactScope,
    changePressure,
    isOrphan
  })
  const tone = getDecisionTone(title, hasCycle)

  if (hasCycle) {
    return {
      title,
      summary: `This ${subject} sits in a circular dependency and needs careful review.`,
      whyItMatters:
        'Circular dependencies increase maintenance and verification cost, and changes can behave unexpectedly across the same dependency chain.',
      actions: [
        'Keep the change small and focused.',
        'Review the full dependency cycle before merging.',
        'Prefer breaking the cycle over adding new responsibilities here.'
      ],
      reviewPriority,
      impactScope,
      changePressure,
      externalReliance,
      structuralPosition,
      tone
    }
  }

  if (title === 'Critical Hotspot') {
    return {
      title,
      summary: `This ${subject} changes frequently and affects many other parts of the system.`,
      whyItMatters:
        'Recent change pressure combines with broad downstream impact, so review and verification scope can spread quickly.',
      actions: [
        'Keep the change small and focused.',
        'Review dependents before merging.',
        'Run broader regression checks.'
      ],
      reviewPriority,
      impactScope,
      changePressure,
      externalReliance,
      structuralPosition,
      tone
    }
  }

  if (title === 'Active but Local') {
    const copy = createActiveButLocalCopy({ subject, impactScope })

    return {
      title,
      summary: copy.summary,
      whyItMatters: copy.whyItMatters,
      actions: copy.actions,
      reviewPriority,
      impactScope,
      changePressure,
      externalReliance,
      structuralPosition,
      tone
    }
  }

  if (title === 'Shared Foundation') {
    const copy = createSharedFoundationCopy({ subject, changePressure })

    return {
      title,
      summary: copy.summary,
      whyItMatters: copy.whyItMatters,
      actions: copy.actions,
      reviewPriority,
      impactScope,
      changePressure,
      externalReliance,
      structuralPosition,
      tone
    }
  }

  const copy = createLikelyLocalChangeCopy({
    subject,
    impactScope,
    changePressure
  })

  return {
    title,
    summary: copy.summary,
    whyItMatters: copy.whyItMatters,
    actions: copy.actions,
    reviewPriority,
    impactScope,
    changePressure,
    externalReliance,
    structuralPosition,
    tone
  }
}
