import {
  decisionCopy,
  formatChangePressureHelperCopy,
  formatChangePressureValueCopy,
  formatExternalRelianceHelperCopy,
  formatExternalRelianceValueCopy,
  formatImpactScopeHelperCopy,
  formatImpactScopeValueCopy,
  formatStructuralPositionHelperCopy,
  formatStructuralPositionValueCopy,
  getActiveButLocalDecisionCopy,
  getCriticalHotspotDecisionCopy,
  getCycleDecisionCopy,
  getDecisionBasisSummaryCopy,
  getDecisionHeadlineCopy,
  getLikelyLocalDecisionCopy,
  getOrphanDecisionCopy,
  getSharedFoundationDecisionCopy
} from '@/shared/content/decisionCopy'
import {
  resolveChangePressure,
  resolveExternalReliance,
  resolveImpactScope,
  resolveStructuralPosition
} from '@/shared/lib/metric-thresholds'

import type {
  ChangePressure,
  ExternalReliance,
  ImpactScope,
  ReviewThresholdCalibration,
  StructuralPosition,
  ThresholdSubject
} from '@/shared/lib/metric-thresholds'

export type DecisionStatusTone =
  | 'default'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger'

export type DecisionTitle =
  | 'Circular Dependency'
  | 'Possibly Unused File'
  | 'Critical Hotspot'
  | 'Active but Local'
  | 'Shared Foundation'
  | 'Likely Local Change'

export type ReviewPriority =
  | 'Critical Review Priority'
  | 'High Review Priority'
  | 'Normal Review Priority'
  | 'Low Review Priority'

export interface DecisionAssessment {
  headline: string
  title: DecisionTitle
  summary: string
  basisSummary: string
  whyItMatters: string
  actions: string[]
  topDrivers: string[]
  reviewPriority: ReviewPriority
  impactScope: ImpactScope | 'Local'
  changePressure: ChangePressure
  externalReliance: ExternalReliance
  structuralPosition: StructuralPosition
  tone: DecisionStatusTone
}

export function formatImpactScopeValue(impactScope: ImpactScope): string {
  return formatImpactScopeValueCopy(impactScope)
}

export function formatChangePressureValue(
  changePressure: ChangePressure
): string {
  return formatChangePressureValueCopy(changePressure)
}

export function formatExternalRelianceValue(
  externalReliance: ExternalReliance
): string {
  return formatExternalRelianceValueCopy(externalReliance)
}

export function formatStructuralPositionValue(
  structuralPosition: StructuralPosition
): string {
  return formatStructuralPositionValueCopy(structuralPosition)
}

export function formatImpactScopeHelper(
  ca: number,
  unit: 'file' | 'module' = 'file'
): string {
  return formatImpactScopeHelperCopy(ca, unit)
}

export function formatChangePressureHelper(relativeChurn: number): string {
  return formatChangePressureHelperCopy(relativeChurn)
}

export function formatExternalRelianceHelper(
  ce: number,
  unit: 'file' | 'module' = 'file'
): string {
  return formatExternalRelianceHelperCopy(ce, unit)
}

export function formatStructuralPositionHelper(instability: number): string {
  return formatStructuralPositionHelperCopy(instability)
}

export function getAssessmentMethodItems(): string[] {
  return [...decisionCopy.evidence.assessmentMethodItems]
}

export function getReviewPriorityTone(
  reviewPriority: ReviewPriority
): DecisionStatusTone {
  switch (reviewPriority) {
    case 'Critical Review Priority':
      return 'danger'
    case 'High Review Priority':
      return 'warning'
    case 'Normal Review Priority':
      return 'info'
    default:
      return 'success'
  }
}

export function getImpactScopeTone(
  impactScope: ImpactScope
): DecisionStatusTone {
  switch (impactScope) {
    case 'Broad':
      return 'warning'
    case 'Moderate':
      return 'info'
    default:
      return 'success'
  }
}

export function getChangePressureTone(
  changePressure: ChangePressure
): DecisionStatusTone {
  switch (changePressure) {
    case 'High':
      return 'warning'
    case 'Moderate':
      return 'info'
    default:
      return 'success'
  }
}

export function getExternalRelianceTone(
  externalReliance: ExternalReliance
): DecisionStatusTone {
  switch (externalReliance) {
    case 'High':
      return 'warning'
    case 'Moderate':
      return 'info'
    default:
      return 'success'
  }
}

export function getStructuralPositionTone(
  structuralPosition: StructuralPosition
): DecisionStatusTone {
  switch (structuralPosition) {
    case 'Foundation-like':
      return 'info'
    case 'Outward-Dependent':
      return 'warning'
    default:
      return 'default'
  }
}

export interface DecisionAssessmentInput {
  kind: ThresholdSubject
  hasCycle: boolean
  ca: number
  ce: number
  instability: number
  relativeChurn30d: number
  isOrphan?: boolean
  thresholdCalibration?: ReviewThresholdCalibration
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

function getDiagnosisHeadline(params: {
  title: DecisionTitle
  impactScope: ImpactScope
  changePressure: ChangePressure
  hasCycle: boolean
  isOrphan: boolean
}): string {
  return getDecisionHeadlineCopy(params)
}

function getBasisSummary(params: {
  hasCycle: boolean
  isOrphan: boolean
}): string {
  return getDecisionBasisSummaryCopy(params)
}

function createActiveButLocalCopy(params: {
  subject: 'file' | 'module'
  impactScope: ImpactScope
}) {
  return getActiveButLocalDecisionCopy(params)
}

function createSharedFoundationCopy(params: {
  subject: 'file' | 'module'
  changePressure: ChangePressure
}) {
  return getSharedFoundationDecisionCopy(params)
}

function createLikelyLocalChangeCopy(params: {
  subject: 'file' | 'module'
  impactScope: ImpactScope
  changePressure: ChangePressure
}) {
  return getLikelyLocalDecisionCopy(params)
}

function getDecisionTone(
  title: DecisionTitle,
  hasCycle: boolean
): DecisionStatusTone {
  if (
    hasCycle ||
    title === 'Critical Hotspot' ||
    title === 'Circular Dependency'
  ) {
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

  if (
    hasCycle ||
    title === 'Critical Hotspot' ||
    title === 'Circular Dependency'
  ) {
    return 'Critical Review Priority'
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
    isOrphan = false,
    thresholdCalibration
  } = input

  const subject = kind === 'file' ? 'file' : 'module'
  const impactScope = resolveImpactScope(ca, kind, thresholdCalibration)
  const changePressure = resolveChangePressure(
    relativeChurn30d,
    thresholdCalibration,
    kind
  )
  const externalReliance = resolveExternalReliance(
    ce,
    thresholdCalibration,
    kind
  )
  const structuralPosition = resolveStructuralPosition(instability)

  if (isOrphan) {
    const copy = getOrphanDecisionCopy()

    return {
      headline: getDiagnosisHeadline({
        title: 'Possibly Unused File',
        impactScope,
        changePressure,
        hasCycle,
        isOrphan
      }),
      title: 'Possibly Unused File',
      basisSummary: getBasisSummary({ hasCycle, isOrphan }),
      summary: copy.summary,
      whyItMatters: copy.whyItMatters,
      actions: copy.actions,
      topDrivers: copy.topDrivers,
      reviewPriority: 'Low Review Priority',
      impactScope: 'Local',
      changePressure,
      externalReliance,
      structuralPosition,
      tone: 'success'
    }
  }

  const title = hasCycle
    ? 'Circular Dependency'
    : getDecisionTitle(impactScope, changePressure)
  const reviewPriority = getReviewPriority({
    title,
    hasCycle,
    impactScope,
    changePressure,
    isOrphan
  })
  const tone = getDecisionTone(title, hasCycle)
  const headline = getDiagnosisHeadline({
    title,
    impactScope,
    changePressure,
    hasCycle,
    isOrphan
  })
  const basisSummary = getBasisSummary({ hasCycle, isOrphan })

  if (hasCycle) {
    const copy = getCycleDecisionCopy(subject)

    return {
      headline,
      title,
      basisSummary,
      summary: copy.summary,
      whyItMatters: copy.whyItMatters,
      actions: copy.actions,
      topDrivers: copy.topDrivers,
      reviewPriority,
      impactScope,
      changePressure,
      externalReliance,
      structuralPosition,
      tone
    }
  }

  if (title === 'Critical Hotspot') {
    const copy = getCriticalHotspotDecisionCopy(subject)

    return {
      headline,
      title,
      basisSummary,
      summary: copy.summary,
      whyItMatters: copy.whyItMatters,
      actions: copy.actions,
      topDrivers: copy.topDrivers,
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
      headline,
      title,
      basisSummary,
      summary: copy.summary,
      whyItMatters: copy.whyItMatters,
      actions: copy.actions,
      topDrivers: copy.topDrivers,
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
      headline,
      title,
      basisSummary,
      summary: copy.summary,
      whyItMatters: copy.whyItMatters,
      actions: copy.actions,
      topDrivers: copy.topDrivers,
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
    headline,
    title,
    basisSummary,
    summary: copy.summary,
    whyItMatters: copy.whyItMatters,
    actions: copy.actions,
    topDrivers: copy.topDrivers,
    reviewPriority,
    impactScope,
    changePressure,
    externalReliance,
    structuralPosition,
    tone
  }
}
