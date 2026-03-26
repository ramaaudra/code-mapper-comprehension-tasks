import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const sourceCodeViewerPath = path.resolve(
  process.cwd(),
  'src/features/node-detail/components/SourceCodeViewer.tsx'
)

test('SourceCodeViewer avoids array index keys for highlighted code lines', () => {
  const source = readFileSync(sourceCodeViewerPath, 'utf8')

  assert.doesNotMatch(source, /key=\{i\}/)
  assert.match(source, /key=\{String\(_lineKey\)\}/)
})
