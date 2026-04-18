import { reachabilityCopy } from '@/shared/content/reachabilityCopy'

export const dashboardCopy = {
  page: {
    title: 'Project Overview',
    description:
      'Review the safest next moves before you open the graph or edit a shared area.'
  },
  sections: {
    quickSnapshot: {
      eyebrow: 'Quick Snapshot',
      title: 'Repository size and recent pressure',
      description:
        'Use this row for orientation only. It should confirm scale, not decide your next review step.',
      helper:
        'Use these numbers only to size the repo and recent pressure. Keep your first decision in the review queue above.'
    },
    reviewFirst: {
      eyebrow: 'Start Here',
      title: 'Start with the next safe review move',
      description:
        'This ranked list already combines shared spread risk and recent change pressure, so you only need to read one decision surface first.'
    },
    currentIssues: {
      eyebrow: 'Current Issues',
      title: 'Blockers and cleanup follow-up',
      description:
        'Open blockers first, then return to lower-risk cleanup when the urgent review work is under control.'
    },
    systemContext: {
      eyebrow: 'Supporting Context',
      title: 'Why the queue is prioritizing these areas',
      description:
        'Use these summaries when you need more evidence about shared impact, coupling, or overall refactor safety.'
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
    primaryBadge: 'Primary next move',
    supportingBadge: 'Supporting follow-up'
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
        'Break these first to reduce coordination cost and make refactors easier to reason about.',
      empty: 'No dependency cycles detected.',
      cta: 'Review cycles',
      previewHint:
        'Open the triage workspace to compare loops, inspect the cycle graph, and decide where to investigate first.'
    },
    cleanup: {
      title: 'Cleanup candidates',
      description:
        'Open the list to confirm whether these files are still used before deleting anything.',
      cta: 'Open cleanup list',
      formalTitle: reachabilityCopy.collectionTitle,
      emptyTitle: `No ${reachabilityCopy.collectionTitle.toLowerCase()} found.`,
      emptyDescription:
        'All files were reached from the detected entry points in the current analysis.'
    }
  },
  architectureHealth: {
    title: 'Change Safety Summary',
    description:
      'A story-first summary of the blockers and shared-risk signals affecting refactor safety.',
    reviewPostureLabel: 'Review posture',
    reviewPostureDetail: (score: number) =>
      `Secondary score: ${score}/100. Use it only as a compact cross-check after reading the story above.`,
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
