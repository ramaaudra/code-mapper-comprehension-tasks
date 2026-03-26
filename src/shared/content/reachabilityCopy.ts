export const reachabilityCopy = {
  badgeCompact: 'Unreachable',
  simulationBadge: 'Becomes Unreachable',
  title: 'Possibly Unreachable',
  collectionTitle: 'Possibly Unreachable Files',
  summary: 'Not reached from detected entry points',
  detailDescription:
    'This path was not reached from the current entry-point analysis.',
  verificationHint:
    'Verify runtime usage, tests, scripts, and dynamic imports before cleanup.',
  treeTooltipTitle: 'Unreachable',
  treeTooltipDescription: 'Not reached from detected entry points',
  simulationSectionTitle: 'Files That Become Unreachable',
  simulationEmpty: 'No files become unreachable'
} as const
