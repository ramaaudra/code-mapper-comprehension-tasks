export const architectureCopy = {
  page: {
    title: 'Architecture Analysis',
    description:
      'Use this page to compare modules, inspect how changes may spread, and spot hotspot areas before refactoring shared code.',
    emptyTitle: 'No architecture data',
    emptyDescription: 'Run analysis to see module metrics',
    errorTitle: 'Failed to load architecture data',
    summaryTitle: 'Quick orientation',
    summaryDescription:
      'Use these totals to confirm scale and context. The review table below should drive your next decision.',
    searchLabel: 'Search modules',
    searchPlaceholder: 'Filter by module path',
    triageCue:
      'Sorted by spread risk by default. Start with the top rows to review modules where changes may spread more widely.'
  },
  tab: {
    title: 'Architecture Overview',
    empty: 'No module data available',
    averageInstabilityLabel: 'Average Instability',
    modulesInCycles: (count: number) => `${count} modules in cycles`
  },
  summaryCards: {
    totalModules: 'Total Modules',
    averageStructuralPosition: 'Average Structural Position',
    outwardFacingModules: 'More Outward-Facing Modules',
    modulesInCycles: 'Modules in Cycles',
    criticalReviewAreas: 'Critical Review Areas'
  },
  table: {
    title: 'Review modules in detail',
    description:
      'Sort by Spread Risk to find shared modules that need broader testing, or sort by Hotspot Priority to find modules under recent change pressure.',
    columns: {
      module: 'Module',
      usedBy: 'Used By',
      imports: 'Imports',
      structuralPosition: 'Structural Position',
      spreadRisk: 'Spread Risk',
      hotspotPriority: 'Hotspot Priority'
    },
    expanded: {
      file: 'File',
      usedBy: 'Used By',
      imports: 'Imports',
      structuralPosition: 'Structural Position',
      changedIn30d: 'Changed in 30d',
      empty: 'No files in this module',
      reviewFocusTitle: 'Module review focus',
      startHereTitle: 'Start here',
      startHereDescription:
        'Review the highest-signal files first before broader cleanup inside this module.',
      nextFilesTitle: 'Next files to verify',
      nextFilesDescription:
        'Use these files to confirm whether impact stays local after you understand the first review targets.',
      remainingTitle: 'Remaining files',
      inspectFileAction: 'Inspect file',
      showRemainingAction: 'Show remaining',
      hideRemainingAction: 'Hide remaining files',
      cycleWarningTitle: 'Cycle warning',
      cycleWarningDescription:
        'This module includes files in a dependency cycle. Review those files before broader refactors.'
    }
  },
  couplingBreakdown: {
    importsFromOtherModules: 'Imports from other modules',
    usedByOtherModules: 'Used by other modules',
    noOutgoing: 'No outgoing cross-module dependencies',
    noIncoming: 'No incoming cross-module dependents'
  },
  readingGuide: {
    collapsedTitle: 'How to read structural position',
    collapsedDescription:
      'Learn why instability is a structural position metric, not a defect or a direct danger score.',
    readHere: 'Read guide',
    fullGuide: 'Full Guide',
    expandedTitle: 'Understanding the Instability (I) Metric'
  }
} as const
