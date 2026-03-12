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
      'The analysis result does not include readable source content for this file.',
    reportModeTitle: 'Source viewer unavailable in static report mode',
    reportModeDescription:
      'Open the live application to inspect source content interactively.'
  },
  orphan: {
    sectionTitle: 'File Status',
    title: 'Orphaned File (Unused)',
    description:
      'This file has 0 dependents and is not an entry point in the current analysis. It is likely unused and worth reviewing for cleanup.',
    footer:
      'Tip: Verify whether this is a test file, a script, or a dynamic import before deleting it. False positives may occur.'
  },
  blastRadius: {
    sectionTitle: 'Blast Radius',
    criticalTitle: 'Critical Circular Dependency',
    criticalDescription:
      'This file is part of a circular dependency chain. Changes can increase initialization, runtime, and maintenance risks.',
    godObjectTitle: 'God Object Detected',
    godObjectDescription: (ce: number) =>
      `This file depends on ${ce} other files. Consider splitting responsibilities into smaller units.`,
    bottleneckTitle: 'Core Bottleneck',
    bottleneckDescription: (ca: number) =>
      `${ca} files depend on this. Changes here are more likely to affect many other files.`
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
    legacyTitle: 'Graph Actions',
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
