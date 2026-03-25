import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const architectureTablePath = path.resolve(
  process.cwd(),
  'src/features/architecture/components/ArchitectureTable.tsx'
)
const folderMetricsRowPath = path.resolve(
  process.cwd(),
  'src/features/architecture/components/FolderMetricsRow.tsx'
)

function readSource(filePath: string): string {
  return readFileSync(filePath, 'utf8')
}

test('architecture module rows do not nest cycle buttons inside the row toggle control', () => {
  const architectureTableSource = readSource(architectureTablePath)
  const folderMetricsRowSource = readSource(folderMetricsRowPath)

  assert.doesNotMatch(
    architectureTableSource,
    /<button[\s\S]*<CycleBadge(?:\s|\/>)[\s\S]*<\/button>/
  )
  assert.doesNotMatch(
    folderMetricsRowSource,
    /<button[\s\S]*<CycleBadge(?:\s|\/>)[\s\S]*<\/button>/
  )
})
