import { getReviewSignalDefinition } from '@/shared/lib/metric-thresholds'

const propagationRiskSignal = getReviewSignalDefinition('propagationRisk')
const blastRadiusSignal = getReviewSignalDefinition('blastRadius')
const hotspotStatusSignal = getReviewSignalDefinition('hotspotStatus')

export const METRIC_LABELS = {
  dependentsCa: 'Dependents (Ca)',
  dependenciesCe: 'Dependencies (Ce)',
  instability: 'Instability (I)',
  dependentImpact: 'Dependent Impact',
  propagationRisk: 'Propagation Risk',
  blastRadius: 'Blast Radius',
  commits30d: 'Commits (30d)',
  relativeChurn30d: 'Relative Churn (30d)',
  relativeChurn90d: 'Relative Churn (90d)',
  evolutionaryHotspotScore: 'Evolutionary Hotspot Score',
  hotspotStatus: 'Hotspot Status'
} as const

export const METRIC_TOOLTIPS = {
  dependentsCa:
    'Afferent Coupling. Number of files or modules that depend on this item.',
  dependenciesCe:
    'Efferent Coupling. Number of files or modules this item depends on.',
  instability:
    'Structural metric calculated as I = Ce / (Ca + Ce). It describes structural position, not defect severity.',
  dependentImpact:
    'Interpretive indicator based on Dependents (Ca). Higher values mean more files or modules may need review when this item changes.',
  propagationRisk: `${propagationRiskSignal.whyItExists} ${propagationRiskSignal.scientificStatusNote}`,
  blastRadius: `${blastRadiusSignal.whyItExists} ${blastRadiusSignal.scientificStatusNote}`,
  commits30d:
    'Number of commits in the last 30 days that touched this file within the analyzed Git history window.',
  relativeChurn30d:
    'Recent code change pressure over the last 30 days, normalized by effective lines of code.',
  relativeChurn90d:
    'Medium-term code change pressure over the last 90 days, normalized by effective lines of code.',
  evolutionaryHotspotScore:
    'Product heuristic that combines recent relative churn with structural propagation risk to prioritize review hotspots.',
  hotspotStatus: `${hotspotStatusSignal.whyItExists} ${hotspotStatusSignal.scientificStatusNote}`
} as const

export const HEURISTIC_LABELS = {
  architectureHealth: 'Architecture Health Indicator',
  criticalPropagationRiskBand: 'Critical propagation-risk band'
} as const
