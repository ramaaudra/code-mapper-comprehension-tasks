import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const issuesPanelPath = path.resolve(
  process.cwd(),
  'src/features/dashboard/components/IssuesPanel.tsx'
)

function readIssuesPanelSource(): string {
  return readFileSync(issuesPanelPath, 'utf8')
}

test('IssuesPanel gives its educational tooltip an explicit accessible name', () => {
  const source = readIssuesPanelSource()

  assert.match(
    source,
    /triggerLabel='Explain why dependency cycles block safer refactors'/
  )
})
