import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const issuesPanelPath = path.resolve(
  process.cwd(),
  'src/features/dashboard/components/IssuesPanel.tsx'
)
const dashboardCopyPath = path.resolve(
  process.cwd(),
  'src/features/dashboard/content/dashboardCopy.ts'
)
const reachabilityCopyPath = path.resolve(
  process.cwd(),
  'src/shared/content/reachabilityCopy.ts'
)
const metricsPanelPath = path.resolve(
  process.cwd(),
  'src/features/dashboard/components/MetricsPanel.tsx'
)
const overviewPriorityPath = path.resolve(
  process.cwd(),
  'src/features/dashboard/lib/overview-priority.ts'
)
const overviewHealthStoryPath = path.resolve(
  process.cwd(),
  'src/features/dashboard/lib/overview-health-story.ts'
)
const fileTreeViewPath = path.resolve(
  process.cwd(),
  'src/features/file-analysis/components/FileTreeView.tsx'
)
const simulationDialogPath = path.resolve(
  process.cwd(),
  'src/features/simulation/components/SimulationDialog.tsx'
)

test('dashboard cleanup language uses unreachable terminology for the formal metric and cleanup candidates as shorthand', () => {
  const issuesPanelSource = readFileSync(issuesPanelPath, 'utf8')
  const dashboardCopySource = readFileSync(dashboardCopyPath, 'utf8')
  const reachabilityCopySource = readFileSync(reachabilityCopyPath, 'utf8')
  const metricsPanelSource = readFileSync(metricsPanelPath, 'utf8')
  const overviewPrioritySource = readFileSync(overviewPriorityPath, 'utf8')
  const overviewHealthStorySource = readFileSync(
    overviewHealthStoryPath,
    'utf8'
  )
  const fileTreeViewSource = readFileSync(fileTreeViewPath, 'utf8')
  const simulationDialogSource = readFileSync(simulationDialogPath, 'utf8')
  const combined = [
    issuesPanelSource,
    dashboardCopySource,
    reachabilityCopySource,
    metricsPanelSource,
    overviewPrioritySource,
    overviewHealthStorySource,
    fileTreeViewSource,
    simulationDialogSource
  ].join('\n')

  assert.doesNotMatch(combined, /Orphaned Files/)
  assert.doesNotMatch(combined, /New Orphans/)
  assert.doesNotMatch(combined, /possible orphan/i)
  assert.doesNotMatch(combined, /\bOrphan:\b/)
  assert.match(combined, /Possibly Unreachable Files/)
  assert.match(combined, /cleanup candidate/i)
  assert.doesNotMatch(combined, /No orphaned files found/i)
  assert.match(combined, /Unreachable/)
  assert.match(combined, /Becomes Unreachable/)
})
