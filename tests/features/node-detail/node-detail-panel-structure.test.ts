import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const nodeDetailPanelPath = path.resolve(
  process.cwd(),
  'src/features/node-detail/components/NodeDetailPanel.tsx'
)

test('NodeDetailPanel composes focused section components instead of keeping inline render blocks', () => {
  const source = readFileSync(nodeDetailPanelPath, 'utf8')

  assert.match(source, /NodeDetailOverviewSection/)
  assert.match(source, /NodeDetailRelationsSection/)
  assert.match(source, /NodeDetailSourceSection/)
  assert.match(source, /NodeDetailPathTraceDialog/)
  assert.match(source, /<NodeDetailOverviewSection/)
  assert.match(source, /<NodeDetailRelationsSection/)
  assert.match(source, /<NodeDetailSourceSection/)
  assert.match(source, /<NodeDetailPathTraceDialog/)
  assert.doesNotMatch(source, /const renderDependencyList =/)
  assert.doesNotMatch(source, /const renderSourceContent =/)
})
