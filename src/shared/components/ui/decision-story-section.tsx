import { DecisionEvidenceList } from '@/shared/components/ui/decision-evidence-list'
import { DiagnosisCard } from '@/shared/components/ui/diagnosis-card'
import { InsightBulletList } from '@/shared/components/ui/insight-bullet-list'
import { MetricValueCard } from '@/shared/components/ui/metric-value-card'
import { decisionCopy } from '@/shared/content/decisionCopy'
import {
  formatChangePressureValue,
  formatExternalRelianceValue,
  formatImpactScopeValue,
  formatStructuralPositionValue,
  getChangePressureTone,
  getImpactScopeTone,
  cn
} from '@/shared/lib/utils'

import type { DecisionAssessment, DecisionStatusTone } from '@/shared/lib/utils'
import type { ReactNode } from 'react'

interface DecisionStorySectionEvidenceHelpers {
  impactScope?: ReactNode
  changeActivity?: ReactNode
  dependencies?: ReactNode
  architectureRole?: ReactNode
}

interface DecisionStorySectionProps {
  assessment: DecisionAssessment
  icon: ReactNode
  evidenceHelpers?: DecisionStorySectionEvidenceHelpers
  evidenceLayout?: 'cards' | 'list'
  changeActivityValue?: string
  changeActivityTone?: DecisionStatusTone
  fallbackActionLead?: string
  className?: string
}

export function DecisionStorySection({
  assessment,
  icon,
  evidenceHelpers,
  evidenceLayout = 'cards',
  changeActivityValue,
  changeActivityTone,
  fallbackActionLead = 'Review this area carefully.',
  className
}: DecisionStorySectionProps) {
  const evidenceItems = [
    {
      label: decisionCopy.evidence.labels.impactScope,
      value: formatImpactScopeValue(assessment.impactScope),
      helper: evidenceHelpers?.impactScope
    },
    {
      label: decisionCopy.evidence.labels.changeActivity,
      value:
        changeActivityValue ??
        formatChangePressureValue(assessment.changePressure),
      helper: evidenceHelpers?.changeActivity
    },
    {
      label: decisionCopy.evidence.labels.dependencies,
      value: formatExternalRelianceValue(assessment.externalReliance),
      helper: evidenceHelpers?.dependencies
    },
    {
      label: decisionCopy.evidence.labels.architectureRole,
      value: formatStructuralPositionValue(assessment.structuralPosition),
      helper: evidenceHelpers?.architectureRole
    }
  ]
  const secondaryEvidence: Array<{ label: string; helper: ReactNode }> = []

  if (evidenceHelpers?.dependencies) {
    secondaryEvidence.push({
      label: decisionCopy.evidence.labels.dependencies,
      helper: evidenceHelpers.dependencies
    })
  }

  if (evidenceHelpers?.architectureRole) {
    secondaryEvidence.push({
      label: decisionCopy.evidence.labels.architectureRole,
      helper: evidenceHelpers.architectureRole
    })
  }

  return (
    <div className={cn('space-y-3', className)}>
      <DiagnosisCard
        icon={icon}
        headline={assessment.headline}
        taxonomyLabel={assessment.title}
        reviewPriority={assessment.reviewPriority}
        summary={assessment.summary}
        basisSummary={assessment.basisSummary}
        actionLead={assessment.actions[0] ?? fallbackActionLead}
        actionList={
          assessment.actions.length > 1 ? (
            <InsightBulletList items={assessment.actions.slice(1)} />
          ) : undefined
        }
        driversLead={assessment.topDrivers[0] ?? ''}
        driversList={
          assessment.topDrivers.length > 1 ? (
            <InsightBulletList items={assessment.topDrivers.slice(1)} />
          ) : undefined
        }
        tone={assessment.tone}
      />

      {evidenceLayout === 'list' ? (
        <DecisionEvidenceList
          title={decisionCopy.evidence.supportingTitle}
          items={evidenceItems}
          headingLevel='section'
        />
      ) : (
        <>
          <div className='grid grid-cols-2 gap-3'>
            <MetricValueCard
              value={formatImpactScopeValue(assessment.impactScope)}
              label={decisionCopy.evidence.labels.impactScope}
              tone={getImpactScopeTone(assessment.impactScope)}
              helper={evidenceHelpers?.impactScope}
            />
            <MetricValueCard
              value={
                changeActivityValue ??
                formatChangePressureValue(assessment.changePressure)
              }
              label={decisionCopy.evidence.labels.changeActivity}
              tone={
                changeActivityTone ??
                getChangePressureTone(assessment.changePressure)
              }
              helper={evidenceHelpers?.changeActivity}
            />
          </div>

          {secondaryEvidence.length > 0 ? (
            <div className='grid gap-3 sm:grid-cols-2'>
              {secondaryEvidence.map((item) => (
                <div
                  key={item.label}
                  className='rounded-lg border border-border bg-muted/25 p-3'
                >
                  <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                    {item.label}
                  </p>
                  <div className='mt-1.5 text-xs leading-relaxed text-foreground/80'>
                    {item.helper}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}
