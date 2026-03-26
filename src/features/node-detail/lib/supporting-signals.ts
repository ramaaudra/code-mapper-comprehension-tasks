import { reachabilityCopy } from '@/shared/content/reachabilityCopy'
import {
  ARCHITECTURE_THRESHOLDS,
  getBlastRadiusDescription,
  getBlastRadiusLabel
} from '@/shared/lib/utils/risk'

import { nodeDetailCopy } from '../content/nodeDetailCopy'

import type { FileArchitectureMetrics } from '@/features/architecture/types/architecture'
import type { DecisionTitle } from '@/shared/lib/utils/decision-assessment'
import type { RiskLevel } from '@/shared/types/risk'

export interface NodeDetailBlastRadiusAssessment {
  riskScore: number
  level: RiskLevel
  isInCycle: boolean
}

export type NodeDetailSupportingSignalId =
  | 'unreachable'
  | 'verification-scope'
  | 'god-object'
  | 'bottleneck'

export interface NodeDetailSupportingSignal {
  id: NodeDetailSupportingSignalId
  title: string
  description: string
  tone: 'warning' | 'danger' | 'success'
  riskLevel?: RiskLevel
  riskScore?: number
}

interface ResolveNodeDetailSupportingSignalsInput {
  decisionTitle: DecisionTitle
  isPossiblyUnreachable: boolean
  archMetrics?: FileArchitectureMetrics
  blastRadiusAssessment?: NodeDetailBlastRadiusAssessment | null
}

function shouldShowVerificationScopeSignal(
  blastRadiusAssessment?: NodeDetailBlastRadiusAssessment | null
): boolean {
  if (!blastRadiusAssessment || blastRadiusAssessment.level === 'low') {
    return false
  }

  return true
}

export function resolveNodeDetailSupportingSignals({
  decisionTitle,
  isPossiblyUnreachable,
  archMetrics,
  blastRadiusAssessment
}: ResolveNodeDetailSupportingSignalsInput): NodeDetailSupportingSignal[] {
  const signals: NodeDetailSupportingSignal[] = []

  if (isPossiblyUnreachable && decisionTitle === 'Circular Dependency') {
    signals.push({
      id: 'unreachable',
      title: reachabilityCopy.title,
      description: `${reachabilityCopy.detailDescription} ${reachabilityCopy.verificationHint}`,
      tone: 'warning'
    })
  }

  if (
    blastRadiusAssessment &&
    shouldShowVerificationScopeSignal(blastRadiusAssessment)
  ) {
    signals.push({
      id: 'verification-scope',
      title: getBlastRadiusLabel(blastRadiusAssessment.level),
      description: getBlastRadiusDescription(blastRadiusAssessment.level),
      tone: blastRadiusAssessment.level === 'medium' ? 'warning' : 'danger',
      riskLevel: blastRadiusAssessment.level,
      riskScore: blastRadiusAssessment.riskScore
    })
  }

  if (archMetrics && archMetrics.ce > ARCHITECTURE_THRESHOLDS.GOD_OBJECT_CE) {
    signals.push({
      id: 'god-object',
      title: nodeDetailCopy.blastRadius.godObjectTitle,
      description: nodeDetailCopy.blastRadius.godObjectDescription(
        archMetrics.ce
      ),
      tone: 'warning'
    })
  }

  if (archMetrics && archMetrics.ca > ARCHITECTURE_THRESHOLDS.BOTTLENECK_CA) {
    signals.push({
      id: 'bottleneck',
      title: nodeDetailCopy.blastRadius.bottleneckTitle,
      description: nodeDetailCopy.blastRadius.bottleneckDescription(
        archMetrics.ca
      ),
      tone: 'warning'
    })
  }

  return signals
}
