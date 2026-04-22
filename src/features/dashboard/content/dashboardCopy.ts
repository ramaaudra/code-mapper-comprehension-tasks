import { reachabilityCopy } from '@/shared/content/reachabilityCopy'

export const dashboardCopy = {
  page: {
    title: 'Project Overview',
    description: 'Review prioritized actions and system health.'
  },
  sections: {
    quickSnapshot: {
      eyebrow: 'Quick Snapshot',
      title: 'Repository size and recent pressure'
    },
    reviewFirst: {
      eyebrow: 'Start Here',
      title: 'Start with the next safe review move'
    },
    currentIssues: {
      eyebrow: 'Current Issues',
      title: 'Blockers and cleanup follow-up'
    },
    systemContext: {
      eyebrow: 'Supporting Context',
      title: 'Why the queue is prioritizing these areas'
    }
  },
  sectionStates: {
    reviewFirst: {
      loadingTitle: 'Preparing the ranked review queue',
      loadingDescription:
        'Module-level architecture metrics are still loading. Use Current Issues below for immediate blockers until the next safe review move is ready.',
      errorTitle: 'Could not rank the next review move',
      errorDescription:
        'Architecture metrics failed to load, so spread risk and recent change pressure are not available yet.'
    },
    systemContext: {
      loadingTitle: 'Loading supporting review context',
      loadingDescription:
        'Change safety and coupling evidence will appear here after the architecture metrics finish loading.',
      errorTitle: 'Could not load supporting review context',
      errorDescription:
        'Architecture metrics failed to load, so the supporting evidence for coupling and refactor safety is unavailable right now.'
    }
  },
  guideTeaser: {
    title: 'Need help reading the metrics?',
    description:
      'Open the guide if you want the meaning behind spread risk, churn, and stability labels.',
    cta: 'Open Guide'
  },
  priorityReviewQueue: {
    categoryLabels: {
      cycles: 'Active Cycle',
      'critical-risk': 'High Spread Risk',
      'warning-risk': 'Shared Area',
      hotspot: 'Active Hotspot',
      cleanup: 'Cleanup Candidate',
      healthy: 'Healthy'
    }
  },
  highRiskModules: {
    title: 'Shared areas that can spread change',
    description:
      'Review these modules carefully before editing shared flows or services.',
    emptyTitle: 'No module data available',
    emptyDescription: 'Run analysis to see propagation-risk hotspots',
    columns: {
      spreadRisk: 'Spread Risk',
      spreadPotential: 'Spread Potential',
      sharedBy: 'Shared By'
    },
    footerCta: 'View all in Architecture tab →',
    tooltip: {
      title: 'What is Propagation Risk?',
      intro:
        'Spread risk estimates how widely a module change may travel through the codebase when many other areas depend on it.',
      heuristicLabel: 'Heuristic:',
      thresholdsIntro: 'Risk Zones:',
      thresholdsNote:
        'These thresholds are product heuristics for triage, not universal scientific cutoffs.',
      summary:
        'A high score means many dependents combined with a dependency structure that can spread change impact widely.'
    },
    instabilityTitle: (value: string) =>
      `Instability (I): ${value}\n0.0 = Stable, 1.0 = Unstable`
  },
  evolutionaryHotspots: {
    title: 'Recently active areas to review first',
    description:
      'These modules changed heavily in recent history and deserve closer review.',
    unavailableTitle: 'Evolutionary metrics unavailable',
    unavailableDescription:
      'Open a Git-backed project with usable history to inspect change pressure and hotspot ranking.',
    emptyTitle: 'No recent change pressure detected',
    emptyDescription: 'No modules changed in the last 30 days.',
    labels: {
      changedIn30d: 'Changed in 30d',
      spreadRisk: 'Spread Risk',
      changedFiles: 'Changed Files'
    },
    footer: 'Showing the top 5 modules by hotspot priority.',
    tooltip: {
      title: 'What is an Evolutionary Hotspot?',
      intro:
        'Evolutionary Hotspot Score combines recent relative churn with structural propagation risk to prioritize modules that deserve more careful review.',
      note: 'This is a product heuristic for prioritization, not a universal scientific defect threshold.'
    }
  },
  issuesPanel: {
    emptyStateTitle: 'Issues Analysis',
    emptyStateDescription: 'No analysis data available',
    analysisQuality: {
      title: 'Analysis quality warning',
      description:
        'Fix unresolved imports before you trust dependency paths, shared impact, or refactor guidance from this snapshot.',
      affectedImportsLabel: 'Imports',
      affectedPatternsLabel: 'Patterns',
      affectedFilesLabel: 'Files',
      previewHint:
        'Open setup guidance to inspect the unresolved patterns and follow the recovery steps.'
    },
    cycles: {
      title: 'Dependency cycles to fix',
      description:
        'Cycles increase testing surface and make refactors less predictable.',
      empty: 'No dependency cycles detected.',
      cta: 'Review cycles'
    },
    cleanup: {
      title: 'Cleanup candidates',
      description: 'Files unreachable from detected entry points.',
      cta: 'Open cleanup list',
      formalTitle: reachabilityCopy.collectionTitle,
      emptyTitle: `No ${reachabilityCopy.collectionTitle.toLowerCase()} found.`,
      emptyDescription:
        'All files were reached from the detected entry points in the current analysis.'
    }
  },
  architectureHealth: {
    title: 'Change Safety Summary',
    reviewPostureLabel: 'Review posture',
    reviewPostureDetail: (score: number) => `Score: ${score}/100`,
    scoreTooltip: {
      title: 'How this summary is scored',
      description:
        'This secondary score compresses cycle pressure, shared risk, and cleanup pressure into one supporting signal.',
      baselineLabel: 'Baseline',
      cyclesLabel: (count: number) => `Cycles (${count})`,
      sharedRiskLabel: 'Shared risk areas',
      cleanupLabel: 'Cleanup pressure',
      finalLabel: 'Final score'
    }
  },
  couplingSnapshot: {
    title: 'Coupling Snapshot',
    description:
      'Use this to understand how dependency load is distributed across files.',
    averagePrefix: 'Average',
    averageSuffix: 'outgoing dependencies per file.',
    bucketHelper: 'Select a bucket to inspect matching files.',
    mostCoupledPrefix: 'Highest:',
    mostCoupledValue: (count: number) => `${count} outgoing dependencies`,
    dialogTitle: (label: string, count: number) =>
      `${label} coupling files (${count})`,
    dialogDescription: (label: string, range: string) =>
      `Files in the ${label.toLowerCase()} bucket have ${range} outgoing dependencies.`
  }
} as const
