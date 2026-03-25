import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const architectureTablePath = path.resolve(
  process.cwd(),
  'src/features/architecture/components/ArchitectureTable.tsx'
)

function readSource(): string {
  return readFileSync(architectureTablePath, 'utf8')
}

test('ArchitectureTable reduces baseline hotspot noise and adds verbal structural-position context to each module row', () => {
  const source = readSource()

  assert.match(source, /resolveStructuralPosition/)
  assert.match(source, /getStructuralPositionBandLabel/)
  assert.match(source, /folderStructuralRoleLabel/)
  assert.match(source, /folder\.evolution\.hotspotStatus !== 'stable'/)
  assert.doesNotMatch(source, /stable:\s*'Baseline band'/)
})
