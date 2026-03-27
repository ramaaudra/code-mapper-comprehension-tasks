import { reachabilityCopy } from '@/shared/content/reachabilityCopy'

export const nodeDetailCopy = {
  tabs: {
    overview: 'Overview',
    imports: 'Imports',
    dependents: 'Used By',
    source: 'Source'
  },
  labels: {
    impactScope: 'Impact Scope',
    changeActivity: 'Change Activity',
    dependencies: 'Dependencies',
    architectureRole: 'Architecture Role'
  },
  dependencyList: {
    emptyTitle: (type: 'imports' | 'importers') => `No ${type} found`,
    emptyDescription: (type: 'imports' | 'importers') =>
      `This file currently has no ${type} in the analysis result.`,
    tracePath: 'Trace path'
  },
  source: {
    loadingTitle: 'Loading source code',
    loadingDescription:
      'Fetching file content and preparing the source viewer.',
    errorTitle: 'Failed to load source code',
    noContentTitle: 'No source content available',
    noContentDescription:
      'The source viewer could not load readable content for this file from the current workspace.',
    reportModeTitle: 'Source viewer unavailable in static report mode',
    reportModeDescription:
      'Open the live application to inspect source code from the local workspace.'
  },
  diagnosisUnavailable: {
    title: 'Diagnosis unavailable',
    description:
      'The panel cannot build a review verdict because architecture metrics for this file are unavailable in the current dataset.'
  },
  orphan: {
    sectionTitle: 'File Status',
    title: reachabilityCopy.title,
    description: `${reachabilityCopy.detailDescription} It may be a cleanup candidate, but runtime usage still needs verification before you treat it as safe to remove.`,
    footer: `Tip: ${reachabilityCopy.verificationHint} Entry-point analysis can miss valid usage paths.`
  },
  blastRadius: {
    sectionTitle: 'Supporting Verification Signal',
    tooltipTitle: 'Blast Radius',
    tooltipDescription:
      'Use this to estimate how broad your verification may need to be after this file changes.',
    tooltipInterpretation:
      'Higher scores suggest broader review and testing may be needed before you merge a change here.',
    godObjectTitle: 'God Object Detected',
    godObjectDescription: (ce: number) =>
      `This file depends on ${ce} other files. Consider splitting responsibilities into smaller units.`,
    bottleneckTitle: 'Core Bottleneck',
    bottleneckDescription: (ca: number) =>
      `${ca} files depend on this. Changes here are more likely to affect many other files.`
  },
  consequences: {
    title: 'If you modify this file:'
  },
  technicalBasis: {
    title: 'Technical basis',
    summary: 'Raw metrics and structural evidence for this file.'
  },
  disclosure: {
    whyTitle: 'Why this recommendation',
    whySummary:
      'Inspect the structural and change-history evidence behind this verdict.',
    howAssessedTitle: 'How this was assessed',
    architectureMetricsTitle: 'Architecture Metrics',
    evolutionaryMetricsTitle: 'Evolutionary Metrics'
  },
  graphTools: {
    title: 'Graph tools',
    summary:
      'Focus inward or outward relationships without leaving this panel.',
    inward: 'Inward',
    outward: 'Outward',
    focusPrefix: 'Focus',
    focusDependencies: 'Dependencies',
    focusDependents: 'Dependents',
    focusSuffix: 'Subgraph'
  },
  pathTrace: {
    noPathTitle: 'No dependency path found',
    noPathDescription:
      'No direct dependency path could be traced between the selected files.'
  }
} as const
