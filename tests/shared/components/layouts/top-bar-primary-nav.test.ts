import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const topBarPath = path.resolve(
  process.cwd(),
  'src/shared/components/layouts/TopBar.tsx'
)

test('TopBar keeps the primary navigation toggle controlled when utility screens are active', () => {
  const source = readFileSync(topBarPath, 'utf8')

  assert.match(
    source,
    /const primaryNavigationValue = activePrimaryViewMode \?\? ''/
  )
  assert.match(source, /value=\{primaryNavigationValue\}/)
  assert.doesNotMatch(source, /value=\{activePrimaryViewMode \?\? undefined\}/)
})
