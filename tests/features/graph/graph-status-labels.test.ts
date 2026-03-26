import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const useGraphGenerationPath = path.resolve(
  process.cwd(),
  'src/features/graph/hooks/useGraphGeneration.ts'
)
const reachabilityCopyPath = path.resolve(
  process.cwd(),
  'src/shared/content/reachabilityCopy.ts'
)

test('graph badges use compact unreachable terminology instead of orphan wording', () => {
  const source = readFileSync(useGraphGenerationPath, 'utf8')
  const reachabilityCopySource = readFileSync(reachabilityCopyPath, 'utf8')

  assert.doesNotMatch(source, /label:\s*'Orphan'/)
  assert.doesNotMatch(source, /label:\s*'Sim Result: Orphan'/)
  assert.match(source, /reachabilityCopy\.(badgeCompact|simulationBadge)/)
  assert.match(reachabilityCopySource, /Unreachable/)
  assert.match(reachabilityCopySource, /Becomes Unreachable/)
  assert.doesNotMatch(source, /Possibly Unreachable/)
})
