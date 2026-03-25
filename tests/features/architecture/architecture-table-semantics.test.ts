import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const architectureTablePath = path.resolve(
  process.cwd(),
  'src/features/architecture/components/ArchitectureTable.tsx'
)

function readArchitectureTableSource(): string {
  return readFileSync(architectureTablePath, 'utf8')
}

test('ArchitectureTable exposes sortable headers and expandable rows as real controls with explicit state', () => {
  const source = readArchitectureTableSource()

  assert.match(source, /aria-sort=\{getAriaSort\(col.key\)\}/)
  assert.match(
    source,
    /<button[\s\S]*type='button'[\s\S]*onClick=\{\(\) => onSort\(col.key\)\}/
  )
  assert.doesNotMatch(source, /<th[^>]*onClick=/)

  assert.match(
    source,
    /aria-label=\{getToggleLabel\(\s*folder\.folderPath,\s*folder\.hasCycle\s*\)\}/
  )
  assert.match(source, /This module is involved in a circular dependency\./)
  assert.match(source, /aria-expanded=\{isExpanded\}/)
  assert.match(source, /aria-controls=\{detailsId\}/)
  assert.match(source, /id=\{detailsId\}/)
  assert.doesNotMatch(source, /<CollapsibleTrigger asChild>\s*<tr/)
})
