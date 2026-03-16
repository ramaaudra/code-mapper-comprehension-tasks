export const dashboardCopy = {
  page: {
    title: 'Project Overview',
    description:
      'Dependency analysis summary and repair priorities for your project.'
  },
  sections: {
    quickSnapshot: {
      eyebrow: 'Quick Snapshot',
      title: 'Project size and recent activity',
      description:
        'Use this row to orient yourself before diving into the review queues below.'
    },
    reviewFirst: {
      eyebrow: 'Review First',
      title: 'Shared and active areas that deserve attention',
      description:
        'Use these two views together: the left list shows where changes can spread, and the right list shows where recent change pressure is highest.'
    },
    currentIssues: {
      eyebrow: 'Current Issues',
      title: 'Blockers and cleanup candidates',
      description:
        'Check cycles first, then review orphaned files when you have maintenance time.'
    },
    systemContext: {
      eyebrow: 'System Context',
      title: 'Overall change safety and dependency load',
      description:
        'These summaries help you understand the broader system condition after triaging the urgent areas above.'
    }
  },
  guideTeaser: {
    title: 'New to Instability Metrics?',
    description:
      "Learn why Unstable doesn't mean broken — and why high instability is often a good thing for UI code.",
    cta: 'Read Guide'
  },
  actionableInsights: {
    title: 'Start Here',
    description:
      'Review these first to reduce change risk and avoid broader regressions.',
    primaryLabel: 'Do this first',
    secondaryLabel: 'Then review',
    cta: {
      file: 'Open file',
      module: 'Open module',
      architecture: 'Open architecture',
      cycles: 'Review cycles'
    },
    cycle: {
      message: (count: number) =>
        `Break ${count} dependency ${count === 1 ? 'cycle' : 'cycles'} before broader refactors`,
      action:
        'Cycles increase coordination and testing cost. Start with the smallest loop and remove one back-reference first.'
    },
    criticalRisk: {
      message: (path: string) => `Review ${path} before editing shared flows`,
      action:
        'This area is widely reused and structurally able to spread change, so expect broader verification than a local edit.'
    },
    godObject: {
      message: (name: string) =>
        `Split ${name} before adding more responsibilities`,
      action: (count: number) =>
        `${count} direct dependencies suggest this file is carrying too many concerns.`
    },
    warningRisk: {
      message: (path: string) => `Plan broader checks before editing ${path}`,
      action:
        'Changes here can reach more dependents than a local module update, so review nearby consumers before merging.'
    },
    hotspot: {
      message: (path: string) =>
        `Review ${path} carefully before editing this active area`,
      action: (percent: number) =>
        `Recent change activity is ${percent}% in the last 30 days, so this area deserves closer review while it is still changing.`
    },
    orphans: {
      message: (count: number) =>
        `Validate ${count} cleanup ${count === 1 ? 'candidate' : 'candidates'} when no blocker remains`,
      actionHigh:
        'These files may be removable, but confirm dynamic imports, tests, and scripts before cleanup.',
      actionLow: 'Low urgency. Review them during maintenance or cleanup work.'
    },
    success: {
      message: 'No urgent review blockers detected',
      action: 'You can start with normal feature work and focused local review.'
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
      description: 'These files may be removable after a quick validation pass.'
    }
  },
  architectureHealth: {
    title: 'Overall Change Safety',
    description:
      'A summary of cycle pressure, shared-change risk, and code hygiene signals across the repository.',
    labels: {
      changeProfile: 'Change Profile:',
      cycles: 'Cycles:',
      criticalRisks: 'Critical Risks:'
    }
  },
  couplingSnapshot: {
    title: 'Coupling Snapshot',
    description:
      'Use this to understand how dependency load is distributed across files.',
    averagePrefix: 'Average:',
    averageSuffix: 'outgoing dependencies per file',
    bucketHelper: 'Click a bucket to inspect matching files.',
    mostCoupled: 'Highest outgoing dependency count:',
    dialogTitle: (label: string, count: number) =>
      `${label} coupling files (${count})`,
    dialogDescription: (label: string, range: string) =>
      `Files in the ${label.toLowerCase()} bucket have ${range} outgoing dependencies.`
  }
} as const
