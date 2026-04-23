export const shellCopy = {
  brand: 'Tauta',
  regions: {
    primaryNavigation: 'Primary Navigation',
    help: 'Help & Setup',
    reportActions: 'Report Actions',
    operations: 'Operations'
  },
  sidebar: {
    show: 'Show sidebar',
    hide: 'Hide sidebar'
  },
  fileCount: (count: number) => `${count} files`,
  navigation: {
    overview: 'Overview',
    graph: 'Graph',
    architecture: 'Architecture'
  },
  utilities: {
    back: 'Back',
    metricsGuide: {
      label: 'Metrics Guide',
      tooltip: 'Learn how to read structural metrics and review signals.'
    },
    analysisSetup: {
      label: 'Analysis Setup',
      tooltip:
        'Review setup guidance and unresolved import warnings for accurate analysis.'
    }
  },
  contextChips: {
    graph: {
      file: 'Graph: File View',
      module: 'Graph: Module View'
    },
    guide: {
      quick: 'Guide: Quick Guide',
      reference: 'Guide: Full Reference'
    },
    setup: {
      ready: 'Setup: Analysis Ready',
      warnings: 'Setup: Warnings Detected'
    },
    cycles: {
      triage: 'Cycles: Triage Workspace'
    }
  },
  actions: {
    loading: 'Loading…',
    reload: 'Reload analysis',
    reloadChanged: (count: number) =>
      `${count} file${count === 1 ? '' : 's'} changed - click to reload`
  },
  timestamps: {
    generatedPrefix: 'Generated:'
  }
} as const
