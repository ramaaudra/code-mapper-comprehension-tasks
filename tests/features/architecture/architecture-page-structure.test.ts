import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const architecturePagePath = path.resolve(
  process.cwd(),
  'src/features/architecture/components/ArchitecturePage.tsx'
)
const architectureCopyPath = path.resolve(
  process.cwd(),
  'src/features/architecture/content/architectureCopy.ts'
)

function readSource(filePath: string): string {
  return readFileSync(filePath, 'utf8')
}

test('ArchitecturePage labels the primary search input, lets the filter row wrap, and keeps summary cards in a supporting visual role', () => {
  const pageSource = readSource(architecturePagePath)

  assert.match(pageSource, /htmlFor='architecture-module-search'/)
  assert.match(pageSource, /id='architecture-module-search'/)
  assert.match(pageSource, /variant='minimal'/)
  assert.match(pageSource, /className='flex flex-wrap items-center gap-4'/)
})

test('Architecture reading guide avoids duplicated "Click to learn" framing in both page markup and copy', () => {
  const pageSource = readSource(architecturePagePath)
  const copySource = readSource(architectureCopyPath)

  assert.doesNotMatch(pageSource, />\s*Click to learn\s*<\/span>/)
  assert.doesNotMatch(copySource, /collapsedDescription:\s*'Click to learn/i)
})
