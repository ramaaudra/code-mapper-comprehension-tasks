import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const moduleSidePanelPath = path.resolve(
  process.cwd(),
  'src/features/graph/components/ModuleSidePanel.tsx'
)

function readModuleSidePanelSource(): string {
  return readFileSync(moduleSidePanelPath, 'utf8')
}

test('ModuleSidePanel reads DataContext defensively so it works in live and report runtimes', () => {
  const source = readModuleSidePanelSource()

  assert.match(source, /useContext\(DataContext\)/)
  assert.doesNotMatch(source, /useDataContext\(\)/)
})
