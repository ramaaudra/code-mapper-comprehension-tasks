export const graphCopy = {
  canvas: {
    fileLoadingTitle: 'Preparing dependency graph',
    fileLoadingDescription:
      'Laying out file relationships so you can compare impact paths clearly.',
    moduleLoadingTitle: 'Preparing module graph',
    moduleLoadingDescription:
      'Collecting cross-module connections and the current focus context.',
    emptyTitle: 'Pick another file to inspect dependencies',
    emptyDescription:
      'This file has no import or export links in the current analysis. Select a shared or recently changed file from the tree to review broader impact.',
    showAllModules: 'Global Map',
    showAllModulesCompact: 'Map'
  },
  node: {
    chips: {
      selected: 'Focus',
      incoming: 'Dependent',
      outgoing: 'Dependency',
      placeholder: 'Info'
    },
    changeSignal: 'Change signal',
    risk: {
      critical: 'Broad spread risk',
      high: 'Wider spread risk',
      medium: 'Moderate spread risk',
      low: 'Limited spread risk'
    },
    relation: {
      focusFile: 'Focus file',
      importedByFocusFile: 'Imported by the focus file',
      importsFocusFile: 'Imports the focus file',
      usedByCount: (count: number) =>
        `Used by ${count} ${count === 1 ? 'file' : 'files'}`
    }
  },
  modulePanel: {
    labels: {
      impactScope: 'Impact Scope',
      changeActivity: 'Change Activity',
      dependencies: 'Dependencies',
      architectureRole: 'Architecture Role'
    },
    disclosure: {
      whyTitle: 'Why this recommendation',
      whySummary:
        'Inspect the structural and evolutionary evidence behind this verdict.',
      howAssessedTitle: 'How this was assessed',
      supportingMetricsTitle: 'Supporting Metrics'
    },
    supportingMetrics: {
      files: 'Files'
    },
    tabs: {
      overview: 'Overview',
      files: 'Files',
      connections: 'Connections'
    },
    files: {
      loadingTitle: 'Loading module files',
      loadingDescription: 'Preparing the list of files inside this module.',
      emptyTitle: 'No files found',
      emptyDescription:
        'This module currently has no file entries in the analysis result.',
      summary: (
        riskScore: number,
        ca: number,
        instability: number,
        churn?: string
      ) =>
        `Spread Risk: ${riskScore.toFixed(1)} · Dependents (Ca): ${ca} · Instability (I): ${instability.toFixed(2)}${
          churn ? ` · Churn (30d): ${churn}` : ''
        }`
    },
    connections: {
      incoming: 'Incoming',
      outgoing: 'Outgoing',
      inspectAction: 'Inspect in graph',
      noIncomingTitle: 'No incoming module dependencies',
      noIncomingDescription:
        'No other modules currently depend on this module.',
      noOutgoingTitle: 'No outgoing module dependencies',
      noOutgoingDescription:
        'This module currently has no outgoing dependencies to other modules.',
      noDataTitle: 'No connection data available',
      noDataDescription:
        'The analysis result does not include incoming or outgoing module connections for this module.'
    },
    overview: {
      noModuleTitle: 'No module data available',
      noModuleDescription:
        'The current analysis result does not include architecture metrics for this module.'
    }
  }
} as const
