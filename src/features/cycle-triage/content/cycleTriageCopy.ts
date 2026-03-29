function getFocusedSummary(
  visible: number,
  total: number,
  filePath: string
): string {
  if (visible === 1 && total > visible) {
    return `Showing 1 of ${total} detected loop involving ${filePath}.`
  }

  if (visible === 1) {
    return `Showing 1 detected loop involving ${filePath}.`
  }

  if (total > visible) {
    return `Showing ${visible} of ${total} detected loops involving ${filePath}.`
  }

  return `Showing ${visible} detected loops involving ${filePath}.`
}

export const cycleTriageCopy = {
  page: {
    title: 'Cycle Triage Workspace',
    backToOverview: 'Back to Overview',
    focusedFileLabel: 'Focused file',
    focusedFileHint: 'Only loops that include this file are shown.',
    clearFocusedFile: 'Show all cycles',
    focusedSummary: getFocusedSummary
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
    cycleGraph: 'Cycle graph',
    nearbyRoutes: 'Nearby import paths',
    directionHint: 'Arrows show import direction.',
    importsIntoLoop: 'Imports into this loop',
    importsFromLoop: 'Imports from this loop',
    nearbyLimitHint: 'Showing {visible} of {total} nearby imports.',
    verifyAfterFix: 'What to verify after the fix',
    loopPath: 'Loop path',
    filesInLoop: 'Files in this loop',
    showNearby: 'Show nearby imports',
    hideNearby: 'Hide nearby imports',
    confidence: 'Confidence',
    whySuggestion: 'Why start here?',
    noCycles: 'No circular dependencies detected in this analysis.',
    noFocusedCyclesTitle: 'No cycles match the focused file',
    noFocusedCyclesDescription: (filePath: string) =>
      `No detected dependency cycles currently include ${filePath}. Clear the file filter to review every detected loop.`
  }
} as const
