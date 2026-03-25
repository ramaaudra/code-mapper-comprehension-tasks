import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const architectureTablePath = path.resolve(
  process.cwd(),
  'src/features/architecture/components/ArchitectureTable.tsx'
)
const expandedPanelPath = path.resolve(
  process.cwd(),
  'src/features/architecture/components/ExpandedModuleReviewPanel.tsx'
)
const architectureCopyPath = path.resolve(
  process.cwd(),
  'src/features/architecture/content/architectureCopy.ts'
)

function readSource(filePath: string): string {
  return readFileSync(filePath, 'utf8')
}

test('Expanded module state is rendered as a prioritized review flow with visible file actions', () => {
  const architectureTableSource = readSource(architectureTablePath)
  const expandedPanelSource = readSource(expandedPanelPath)
  const architectureCopySource = readSource(architectureCopyPath)

  assert.match(
    architectureTableSource,
    /<ExpandedModuleReviewPanel[\s\S]*folder=\{data\.folder\}[\s\S]*files=\{data\.files\}/
  )
  assert.doesNotMatch(expandedPanelSource, /<table className='w-full text-xs'>/)
  assert.match(expandedPanelSource, /buildModuleReviewGroups/)
  assert.match(
    expandedPanelSource,
    /architectureCopy\.table\.expanded\.startHereTitle/
  )
  assert.match(
    expandedPanelSource,
    /architectureCopy\.table\.expanded\.nextFilesTitle/
  )
  assert.match(
    expandedPanelSource,
    /architectureCopy\.table\.expanded\.inspectFileAction/
  )
  assert.match(
    expandedPanelSource,
    /architectureCopy\.table\.expanded\.showRemainingAction/
  )
  assert.match(architectureCopySource, /startHereTitle:\s*'Start here'/)
  assert.match(
    architectureCopySource,
    /nextFilesTitle:\s*'Next files to verify'/
  )
  assert.match(architectureCopySource, /inspectFileAction:\s*'Inspect file'/)
  assert.match(
    architectureCopySource,
    /showRemainingAction:\s*'Show remaining'/
  )
})
