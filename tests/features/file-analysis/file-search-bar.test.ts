import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const fileSearchBarPath = path.resolve(
  process.cwd(),
  'src/features/file-analysis/components/FileSearchBar.tsx'
)

function readFileSearchBarSource(): string {
  return readFileSync(fileSearchBarPath, 'utf8')
}

test('FileSearchBar exposes a real search label instead of relying on placeholder text', () => {
  const source = readFileSearchBarSource()

  assert.match(source, /type='search'/)
  assert.match(source, /aria-label='Find a file by name or path'/)
  assert.match(source, /placeholder=\{`Find file \$\{modifierKey\}F`\}/)
})
