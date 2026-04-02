import { DetailPanelState } from '@/shared/components/ui/detail-panel-state'

import { nodeDetailCopy } from '../content/nodeDetailCopy'
import {
  resolveNodeDetailSupportingSignals,
  type NodeDetailBlastRadiusAssessment
} from '../lib/supporting-signals'
import { NodeDetailConnascenceSection } from './NodeDetailConnascenceSection'
import { NodeDetailDiagnosisSection } from './NodeDetailDiagnosisSection'
import { NodeDetailGraphToolsSection } from './NodeDetailGraphToolsSection'
import { NodeDetailSupportingSignalsSection } from './NodeDetailSupportingSignalsSection'
import { NodeDetailTechnicalBasisSection } from './NodeDetailTechnicalBasisSection'

import type { NodeDetailCycleTriageSummary } from '../lib/cycle-triage-link'
import type { BlastRadiusRole } from '../lib/panel-state'
import type { FileArchitectureMetrics } from '@/features/architecture/types/architecture'
import type { DecisionAssessment } from '@/shared/lib/utils'
import type {
  ConnascenceSignal,
  EntryDetectionContext,
  FileEvolutionMetrics
} from '@/shared/types/analysis'
import type { CycleTriageNavigationRequest } from '@/shared/types/explorer'
import type { ReactNode } from 'react'

export interface NodeDetailOverviewState {
  showDiagnosis: boolean
  showDiagnosisUnavailableState: boolean
  showBlastRadius: boolean
  showWhyDisclosure: boolean
  showArchitectureMetrics: boolean
  showEvolutionMetrics: boolean
}

interface NodeDetailOverviewSectionProps {
  overviewState: NodeDetailOverviewState
  decisionAssessment: DecisionAssessment | null
  isPossiblyUnreachable: boolean
  changeHistoryAvailable: boolean
  fileEvolution: FileEvolutionMetrics | null
  archMetrics: FileArchitectureMetrics | undefined
  blastRadiusAssessment: NodeDetailBlastRadiusAssessment | null
  blastRadiusRole: BlastRadiusRole
  onFocusSubgraph?: (nodeId: string, direction: 'inward' | 'outward') => void
  focusDirection: 'inward' | 'outward'
  onFocusDirectionChange: (direction: 'inward' | 'outward') => void
  resolvedNodeId: string
  decisionIcon: ReactNode
  entryDetectionContext?: EntryDetectionContext
  connascenceSignals: ConnascenceSignal[]
  onNavigateToFile?: (filePath: string) => void
  onOpenDependents?: () => void
  onFocusDependents?: () => void
  relatedCycleSummary: NodeDetailCycleTriageSummary | null
  onShowCycleTriage?: (request: CycleTriageNavigationRequest) => void
}

export function NodeDetailOverviewSection({
  overviewState,
  decisionAssessment,
  isPossiblyUnreachable,
  changeHistoryAvailable,
  fileEvolution,
  archMetrics,
  blastRadiusAssessment,
  blastRadiusRole,
  onFocusSubgraph,
  focusDirection,
  onFocusDirectionChange,
  resolvedNodeId,
  decisionIcon,
  entryDetectionContext,
  connascenceSignals,
  onNavigateToFile,
  onOpenDependents,
  onFocusDependents,
  relatedCycleSummary,
  onShowCycleTriage
}: NodeDetailOverviewSectionProps) {
  const supportingSignals =
    overviewState.showBlastRadius &&
    blastRadiusRole === 'supporting' &&
    decisionAssessment
      ? resolveNodeDetailSupportingSignals({
          decisionTitle: decisionAssessment.title,
          isPossiblyUnreachable,
          archMetrics,
          blastRadiusAssessment,
          entryDetectionContext
        })
      : []

  return (
    <div className='space-y-6'>
      {overviewState.showDiagnosis && decisionAssessment ? (
        <NodeDetailDiagnosisSection
          decisionAssessment={decisionAssessment}
          decisionIcon={decisionIcon}
          changeHistoryAvailable={changeHistoryAvailable}
          fileEvolution={fileEvolution}
          archMetrics={archMetrics}
          relatedCycleSummary={relatedCycleSummary}
          resolvedNodeId={resolvedNodeId}
          onShowCycleTriage={onShowCycleTriage}
        />
      ) : null}

      {overviewState.showDiagnosisUnavailableState ? (
        <DetailPanelState
          title={nodeDetailCopy.diagnosisUnavailable.title}
          description={nodeDetailCopy.diagnosisUnavailable.description}
        />
      ) : null}

      <NodeDetailSupportingSignalsSection
        signals={supportingSignals}
        archMetrics={archMetrics}
      />

      <NodeDetailConnascenceSection
        signals={connascenceSignals}
        onNavigateToFile={onNavigateToFile}
        onOpenDependents={onOpenDependents}
        onFocusDependents={onFocusDependents}
      />

      {overviewState.showWhyDisclosure ? (
        <NodeDetailTechnicalBasisSection
          showArchitectureMetrics={overviewState.showArchitectureMetrics}
          showEvolutionMetrics={overviewState.showEvolutionMetrics}
          changeHistoryAvailable={changeHistoryAvailable}
          archMetrics={archMetrics}
          fileEvolution={fileEvolution}
        />
      ) : null}

      {onFocusSubgraph ? (
        <NodeDetailGraphToolsSection
          focusDirection={focusDirection}
          resolvedNodeId={resolvedNodeId}
          onFocusSubgraph={onFocusSubgraph}
          onFocusDirectionChange={onFocusDirectionChange}
        />
      ) : null}
    </div>
  )
}
