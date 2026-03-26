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
  | 'Possibly Unreachable'
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
  changeHistoryAvailable?: boolean
  isOrphan?: boolean
  thresholdCalibration?: ReviewThresholdCalibration
}

function getDecisionTitle(
  impactScope: ImpactScope,
  changePressure: ChangePressure,
  changeHistoryAvailable: boolean
): Exclude<DecisionTitle, 'Possibly Unreachable'> {
  if (!changeHistoryAvailable) {
    return impactScope === 'Broad' ? 'Shared Foundation' : 'Likely Local Change'
  }

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
  changeHistoryAvailable?: boolean
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
  changeHistoryAvailable?: boolean
}) {
  return getSharedFoundationDecisionCopy(params)
}

function createLikelyLocalChangeCopy(params: {
  subject: 'file' | 'module'
  impactScope: ImpactScope
  changePressure: ChangePressure
  changeHistoryAvailable?: boolean
}) {
  return getLikelyLocalDecisionCopy(params)
}

function resolveDecisionTitle(params: {
  hasCycle: boolean
  isOrphan: boolean
  impactScope: ImpactScope
  changePressure: ChangePressure
  changeHistoryAvailable: boolean
}): DecisionTitle {
  const {
    hasCycle,
    isOrphan,
    impactScope,
    changePressure,
    changeHistoryAvailable
  } = params

  if (hasCycle) {
    return 'Circular Dependency'
  }

  if (isOrphan) {
    return 'Possibly Unreachable'
  }

  return getDecisionTitle(impactScope, changePressure, changeHistoryAvailable)
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

  if (isOrphan) {
    return 'Low Review Priority'
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
    changeHistoryAvailable = true,
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
  const title = resolveDecisionTitle({
    hasCycle,
    isOrphan,
    impactScope,
    changePressure,
    changeHistoryAvailable
  })
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
  const resolvedBasisSummary = getBasisSummary({
    hasCycle,
    isOrphan,
    changeHistoryAvailable
  })

  if (hasCycle) {
    const copy = getCycleDecisionCopy(subject, {
      isPossiblyUnreachable: isOrphan
    })

    return {
      headline,
      title,
      basisSummary: resolvedBasisSummary,
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

  if (title === 'Possibly Unreachable') {
    const copy = getOrphanDecisionCopy()

    return {
      headline,
      title,
      basisSummary: resolvedBasisSummary,
      summary: copy.summary,
      whyItMatters: copy.whyItMatters,
      actions: copy.actions,
      topDrivers: copy.topDrivers,
      reviewPriority,
      impactScope: 'Local',
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
      basisSummary: resolvedBasisSummary,
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
      basisSummary: resolvedBasisSummary,
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
    const copy = createSharedFoundationCopy({
      subject,
      changePressure,
      changeHistoryAvailable
    })

    return {
      headline,
      title,
      basisSummary: resolvedBasisSummary,
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
    changePressure,
    changeHistoryAvailable
  })

  return {
    headline,
    title,
    basisSummary: resolvedBasisSummary,
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
