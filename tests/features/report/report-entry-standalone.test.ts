import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const reportEntryPath = path.resolve(
  process.cwd(),
  'src/features/report/report-entry.tsx'
)

test('report entry provides static data before file analysis hooks mount', () => {
  const source = readFileSync(reportEntryPath, 'utf8')

  assert.match(source, /<StaticProvider>\s*<FileAnalysisProvider>/)
  assert.doesNotMatch(source, /<FileAnalysisProvider>\s*<StaticProvider>/)
})
