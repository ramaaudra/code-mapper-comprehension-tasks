import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const architecturePagePath = path.resolve(
  process.cwd(),
  'src/features/architecture/components/ArchitecturePage.tsx'
)
const architectureSummarySectionPath = path.resolve(
  process.cwd(),
  'src/features/architecture/components/ArchitectureSummarySection.tsx'
)
const architectureReadingGuideSectionPath = path.resolve(
  process.cwd(),
  'src/features/architecture/components/ArchitectureReadingGuideSection.tsx'
)
const architectureReviewToolbarPath = path.resolve(
  process.cwd(),
  'src/features/architecture/components/ArchitectureReviewToolbar.tsx'
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
  const summarySectionSource = readSource(architectureSummarySectionPath)
  const reviewToolbarSource = readSource(architectureReviewToolbarPath)

  assert.match(pageSource, /<ArchitectureSummarySection/)
  assert.match(pageSource, /<ArchitectureReviewToolbar/)
  assert.match(summarySectionSource, /variant='minimal'/)
  assert.match(reviewToolbarSource, /htmlFor='architecture-module-search'/)
  assert.match(reviewToolbarSource, /id='architecture-module-search'/)
  assert.match(
    reviewToolbarSource,
    /className='flex flex-wrap items-center gap-4'/
  )
})

test('Architecture reading guide avoids duplicated "Click to learn" framing in both page markup and copy', () => {
  const pageSource = readSource(architectureReadingGuideSectionPath)
  const copySource = readSource(architectureCopyPath)

  assert.doesNotMatch(pageSource, />\s*Click to learn\s*<\/span>/)
  assert.doesNotMatch(copySource, /collapsedDescription:\s*'Click to learn/i)
})

test('ArchitecturePage composes focused section components instead of holding every section inline', () => {
  const pageSource = readSource(architecturePagePath)

  assert.match(
    pageSource,
    /import \{[\s\S]*ArchitectureSummarySection[\s\S]*\} from '\.\/ArchitectureSummarySection'/
  )
  assert.match(
    pageSource,
    /import \{ ArchitectureReadingGuideSection \} from '\.\/ArchitectureReadingGuideSection'/
  )
  assert.match(
    pageSource,
    /import \{ ArchitectureReviewToolbar \} from '\.\/ArchitectureReviewToolbar'/
  )
  assert.match(pageSource, /<ArchitectureSummarySection/)
  assert.match(pageSource, /<ArchitectureReadingGuideSection/)
  assert.match(pageSource, /<ArchitectureReviewToolbar/)
})
