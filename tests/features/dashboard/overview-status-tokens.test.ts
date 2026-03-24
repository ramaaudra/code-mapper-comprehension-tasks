import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const architectureHealthScorePath = path.resolve(
  process.cwd(),
  'src/features/dashboard/components/ArchitectureHealthScore.tsx'
)
const issuesPanelPath = path.resolve(
  process.cwd(),
  'src/features/dashboard/components/IssuesPanel.tsx'
)
const couplingBucketsPath = path.resolve(
  process.cwd(),
  'src/features/dashboard/lib/couplingBuckets.ts'
)
const riskUtilsPath = path.resolve(
  process.cwd(),
  'src/shared/lib/utils/risk.ts'
)

function readSource(filePath: string): string {
  return readFileSync(filePath, 'utf8')
}

test('Overview risk surfaces use semantic status tokens instead of raw alert colors', () => {
  const architectureHealthScoreSource = readSource(architectureHealthScorePath)
  const issuesPanelSource = readSource(issuesPanelPath)
  const couplingBucketsSource = readSource(couplingBucketsPath)
  const riskUtilsSource = readSource(riskUtilsPath)

  assert.match(architectureHealthScoreSource, /status-critical-/)
  assert.match(architectureHealthScoreSource, /status-warning-/)
  assert.match(architectureHealthScoreSource, /status-success-/)
  assert.match(issuesPanelSource, /status-critical-/)
  assert.match(issuesPanelSource, /status-success-/)
  assert.match(couplingBucketsSource, /status-success-solid/)
  assert.match(couplingBucketsSource, /status-warning-solid/)
  assert.match(couplingBucketsSource, /status-critical-solid/)
  assert.match(riskUtilsSource, /status-critical-solid/)
  assert.match(riskUtilsSource, /status-warning-solid/)
  assert.match(riskUtilsSource, /status-success-solid/)

  assert.doesNotMatch(architectureHealthScoreSource, /text-red-500/)
  assert.doesNotMatch(architectureHealthScoreSource, /text-orange-500/)
  assert.doesNotMatch(architectureHealthScoreSource, /text-yellow-500/)
  assert.doesNotMatch(architectureHealthScoreSource, /text-green-500/)
  assert.doesNotMatch(issuesPanelSource, /border-red-500/)
  assert.doesNotMatch(issuesPanelSource, /bg-red-500/)
  assert.doesNotMatch(issuesPanelSource, /border-emerald-500/)
  assert.doesNotMatch(couplingBucketsSource, /bg-red-500/)
  assert.doesNotMatch(couplingBucketsSource, /bg-orange-500/)
  assert.doesNotMatch(couplingBucketsSource, /bg-yellow-500/)
  assert.doesNotMatch(couplingBucketsSource, /bg-green-500/)
  assert.doesNotMatch(riskUtilsSource, /bg-red-500/)
  assert.doesNotMatch(riskUtilsSource, /bg-orange-500/)
  assert.doesNotMatch(riskUtilsSource, /bg-yellow-500/)
  assert.doesNotMatch(riskUtilsSource, /bg-green-500/)
})
