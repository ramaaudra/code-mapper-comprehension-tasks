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

test('ModuleSidePanel keeps file actions visible and makes the supporting metrics grid adapt to narrow panels', () => {
  const source = readModuleSidePanelSource()

  assert.match(
    source,
    /aria-label=\{`View file details for \$\{file.filePath\}`\}/
  )
  assert.match(source, /grid-cols-1 sm:grid-cols-2 gap-3/)
  assert.doesNotMatch(source, /opacity-0/)
  assert.doesNotMatch(source, /group-hover:opacity-100/)
})
