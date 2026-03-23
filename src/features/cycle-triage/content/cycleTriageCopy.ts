export const cycleTriageCopy = {
  page: {
    title: 'Cycle Triage Workspace',
    backToOverview: 'Back to Overview'
  },
  summary: {
    totalCycles: 'Cycles to review',
    highPriority: 'High priority',
    reviewOrder:
      'Sorted by fix priority first, then by the smallest loop to inspect.',
    measuredSignals:
      'Priority reasons use downstream usage and recent change signals.',
    fallbackSignals:
      'Priority reasons are using graph structure only until file-level architecture signals load.'
  },
  queue: {
    title: 'Review queue',
    empty: 'No dependency cycles detected.'
  },
  detail: {
    selectPrompt:
      'Choose a cycle from the queue to inspect the loop and first step.',
    whatIsHappening: 'What is happening',
    cycleGraph: 'Cycle graph',
    nearbyRoutes: 'Nearby import paths',
    directionHint: 'Arrows show import direction.',
    recommendedEdgeHint: 'Follow the highlighted edge first.',
    importsIntoLoop: 'Imports into this loop',
    importsFromLoop: 'Imports from this loop',
    nearbyLimitHint: 'Showing {visible} of {total} nearby imports.',
    verifyAfterFix: 'What to verify after the fix',
    loopPath: 'Loop path',
    filesInLoop: 'Files in this loop',
    showNearby: 'Show nearby imports',
    hideNearby: 'Hide nearby imports',
    confidence: 'Confidence',
    startHere: 'Start here',
    whySuggestion: 'Why start here?',
    reviewStatus: 'Review status',
    markReviewed: 'Mark reviewed',
    markUnreviewed: 'Move back to unreviewed',
    statusUnreviewed: 'Unreviewed',
    statusReviewing: 'Currently reviewing',
    statusReviewed: 'Reviewed',
    noCycles: 'No circular dependencies detected in this analysis.'
  }
} as const
