import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const projectDashboardPath = path.resolve(
  process.cwd(),
  'src/features/dashboard/components/ProjectDashboard.tsx'
)

function readProjectDashboardSource(): string {
  return readFileSync(projectDashboardPath, 'utf8')
}

test('ProjectDashboard overview keeps a single page h1 and uses the next semantic level for section headings', () => {
  const source = readProjectDashboardSource()

  assert.match(
    source,
    /<h1 className='text-2xl font-semibold text-foreground'>/
  )
  assert.match(
    source,
    /<h2 className='text-2xl font-bold text-foreground'>{title}<\/h2>/
  )
  assert.doesNotMatch(
    source,
    /<h1 className='text-2xl font-bold text-foreground'>{title}<\/h1>/
  )
})

test('ProjectDashboard overview renders the quick snapshot as a supporting definition list instead of repeated metric cards', () => {
  const source = readProjectDashboardSource()

  assert.match(source, /<dl\b/)
  assert.doesNotMatch(source, /<MetricCard/)
})
