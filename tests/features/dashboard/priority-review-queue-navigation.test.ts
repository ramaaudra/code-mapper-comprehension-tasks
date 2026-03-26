import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const priorityReviewQueuePath = path.resolve(
  process.cwd(),
  'src/features/dashboard/components/PriorityReviewQueue.tsx'
)
const projectDashboardPath = path.resolve(
  process.cwd(),
  'src/features/dashboard/components/ProjectDashboard.tsx'
)
const issuesPanelPath = path.resolve(
  process.cwd(),
  'src/features/dashboard/components/IssuesPanel.tsx'
)

function readSource(filePath: string): string {
  return readFileSync(filePath, 'utf8')
}

test('PriorityReviewQueue routes cleanup follow-up to a dedicated cleanup handler instead of cycle triage', () => {
  const source = readSource(priorityReviewQueuePath)

  assert.match(source, /onShowCleanupCandidates\?: \(\) => void/)
  assert.match(source, /if \(target\.kind === 'cleanup'\)/)
  assert.match(source, /onShowCleanupCandidates\?\.\(\)/)
  assert.doesNotMatch(
    source,
    /if \(target\.kind === 'cycles' \|\| target\.kind === 'issues'\)/
  )
})

test('ProjectDashboard owns one cleanup dialog state and passes it to both queue and issues panel', () => {
  const source = readSource(projectDashboardPath)

  assert.match(
    source,
    /const \[cleanupDialogOpen, setCleanupDialogOpen\] = useState\(false\)/
  )
  assert.match(
    source,
    /onShowCleanupCandidates=\{\(\) => setCleanupDialogOpen\(true\)\}/
  )
  assert.match(source, /cleanupDialogOpen=\{cleanupDialogOpen\}/)
  assert.match(source, /onCleanupDialogOpenChange=\{setCleanupDialogOpen\}/)
})

test('IssuesPanel no longer owns its own cleanup dialog state', () => {
  const source = readSource(issuesPanelPath)

  assert.doesNotMatch(source, /useState\(false\)/)
  assert.match(source, /cleanupDialogOpen: boolean/)
  assert.match(source, /onCleanupDialogOpenChange: \(open: boolean\) => void/)
})
