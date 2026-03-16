export const cycleTriageCopy = {
  page: {
    title: 'Cycle Triage Workspace',
    description:
      'Inspect the loop, see why it matters, and check the first dependency to investigate.',
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
    description: 'Pick one loop. Then inspect the graph.',
    empty: 'No dependency cycles detected.'
  },
  detail: {
    selectPrompt:
      'Choose a cycle from the queue to inspect the loop and suggested first investigation.',
    whatIsHappening: 'What is happening',
    whyPrioritized: 'Why this is prioritized',
    cycleGraph: 'Cycle graph',
    routeLabel: 'Loop route',
    directionHint: 'Arrows show import direction.',
    cycleRoutesShown: 'Cycle imports shown',
    nearbyRoutesShown: 'Nearby imports shown',
    inspectFirst: 'Inspect first',
    nearbyLimitHint:
      'Showing {visible} of {total} nearby imports as a list to keep the loop view readable.',
    suggestedInvestigation: 'Suggested first investigation',
    verifyAfterFix: 'What to verify after the fix',
    loopPath: 'Loop path',
    filesInLoop: 'Files in this loop',
    showNearby: 'Show nearby dependents',
    hideNearby: 'Hide nearby dependents',
    nearbyHint:
      'Nearby dependents add one-hop context outside the loop. Keep them hidden unless you need more impact context.',
    confidence: 'Confidence',
    candidateEdge: 'Check this dependency first',
    noCycles: 'No circular dependencies detected in this analysis.'
  }
} as const
