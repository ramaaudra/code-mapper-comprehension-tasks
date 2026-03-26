import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const nodeDetailPanelPath = path.resolve(
  process.cwd(),
  'src/features/node-detail/components/NodeDetailPanel.tsx'
)

test('NodeDetailPanel does not use a custom memo comparator that only watches node identity', () => {
  const source = readFileSync(nodeDetailPanelPath, 'utf8')

  assert.doesNotMatch(source, /return nodeIdEqual/)
  assert.doesNotMatch(source, /,\s*\(prevProps,\s*nextProps\)\s*=>/)
})
