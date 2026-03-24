import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const dependencyGraphPath = path.resolve(
  process.cwd(),
  'src/features/graph/components/DependencyGraph.tsx'
)

function readDependencyGraphSource(): string {
  return readFileSync(dependencyGraphPath, 'utf8')
}

test('DependencyGraph scopes shortcuts to the canvas region and gives nodes unambiguous accessible names', () => {
  const source = readDependencyGraphSource()

  assert.match(source, /role='region'/)
  assert.match(source, /aria-label='Dependency graph canvas'/)
  assert.match(source, /aria-describedby='graph-shortcuts-hint'/)
  assert.match(source, /tabIndex=\{0\}/)
  assert.match(source, /onKeyDown=\{handleGraphKeyDown\}/)
  assert.match(
    source,
    /aria-label=\{`Open \$\{chipLabel\[direction\]\} node \$\{data.label\} in \$\{getRelativePath\(data.fullPath\)\}`\}/
  )
  assert.match(
    source,
    /Keyboard shortcuts: \+ zoom in, - zoom out, 0 reset, F fit graph\./
  )
  assert.doesNotMatch(source, /window\.addEventListener\('keydown'/)
})
