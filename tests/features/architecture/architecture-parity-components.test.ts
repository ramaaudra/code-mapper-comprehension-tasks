import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const architectureStatsPath = path.resolve(
  process.cwd(),
  'src/features/architecture/components/ArchitectureStats.tsx'
)
const architectureTabPath = path.resolve(
  process.cwd(),
  'src/features/architecture/components/ArchitectureTab.tsx'
)
const folderMetricsTablePath = path.resolve(
  process.cwd(),
  'src/features/architecture/components/FolderMetricsTable.tsx'
)
const folderMetricsRowPath = path.resolve(
  process.cwd(),
  'src/features/architecture/components/FolderMetricsRow.tsx'
)

function readSource(filePath: string): string {
  return readFileSync(filePath, 'utf8')
}

test('Architecture parity surfaces stay responsive, semantic, and token-based', () => {
  const architectureStatsSource = readSource(architectureStatsPath)
  const architectureTabSource = readSource(architectureTabPath)
  const folderMetricsTableSource = readSource(folderMetricsTablePath)
  const folderMetricsRowSource = readSource(folderMetricsRowPath)

  assert.match(architectureStatsSource, /grid-cols-1[\s\S]*sm:grid-cols-3/)
  assert.doesNotMatch(architectureStatsSource, /red-(400|500)/)
  assert.doesNotMatch(architectureTabSource, /text-red-400/)

  assert.match(folderMetricsTableSource, /aria-sort=/)
  assert.match(
    folderMetricsTableSource,
    /<button[\s\S]*type='button'[\s\S]*onClick=\{\(\) => handleSort\(col.key\)\}/
  )
  assert.doesNotMatch(folderMetricsTableSource, /<th[^>]*onClick=/)

  assert.match(folderMetricsRowSource, /aria-expanded=\{expanded\}/)
  assert.match(folderMetricsRowSource, /aria-controls=\{detailsId\}/)
  assert.match(
    folderMetricsRowSource,
    /<button[\s\S]*type='button'[\s\S]*onClick=\{\(\) => setExpanded\(!expanded\)\}/
  )
  assert.doesNotMatch(folderMetricsRowSource, /<tr[^>]*onClick=/)
})
