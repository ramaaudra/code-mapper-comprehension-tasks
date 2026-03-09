export const METRIC_LABELS = {
  dependentsCa: 'Dependents (Ca)',
  dependenciesCe: 'Dependencies (Ce)',
  instability: 'Instability (I)',
  dependentImpact: 'Dependent Impact',
  propagationRisk: 'Propagation Risk',
  blastRadius: 'Blast Radius'
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
  propagationRisk:
    'Derived heuristic calculated as Ca x I. It estimates how strongly change pressure may propagate through dependents.',
  blastRadius:
    'Derived heuristic that estimates the nearby verification scope after a file change.'
} as const

export const HEURISTIC_LABELS = {
  architectureHealth: 'Architecture Health Indicator',
  criticalPropagationRiskBand: 'Critical propagation-risk band'
} as const
