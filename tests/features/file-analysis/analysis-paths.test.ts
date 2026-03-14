import assert from 'node:assert/strict'
import test from 'node:test'

import { createAliasedPathSet } from '../../../src/features/file-analysis/lib/analysis-paths'

import type { AnalysisNode } from '../../../src/shared/types/analysis'

test('createAliasedPathSet preserves absolute and relative aliases for tree status lookups', () => {
  const nodes: AnalysisNode[] = [
    {
      id: '/repo/src/utils/math.ts',
      label: 'src/utils/math.ts'
    }
  ]

  const aliasedPaths = createAliasedPathSet(['/repo/src/utils/math.ts'], nodes)

  assert.equal(aliasedPaths.has('/repo/src/utils/math.ts'), true)
  assert.equal(aliasedPaths.has('src/utils/math.ts'), true)
})
