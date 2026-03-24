import { DiagnosisCard } from '@/shared/components/ui/diagnosis-card'
import { InsightBulletList } from '@/shared/components/ui/insight-bullet-list'
import { MetricValueCard } from '@/shared/components/ui/metric-value-card'
import { decisionCopy } from '@/shared/content/decisionCopy'
import {
  formatChangePressureValue,
  formatImpactScopeValue,
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
  changeActivityValue?: string
  changeActivityTone?: DecisionStatusTone
  fallbackActionLead?: string
  className?: string
}

export function DecisionStorySection({
  assessment,
  icon,
  evidenceHelpers,
  changeActivityValue,
  changeActivityTone,
  fallbackActionLead = 'Review this area carefully.',
  className
}: DecisionStorySectionProps) {
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
    </div>
  )
}
