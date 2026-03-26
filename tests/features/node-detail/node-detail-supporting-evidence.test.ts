import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const nodeDetailPanelPath = path.resolve(
  process.cwd(),
  'src/features/node-detail/components/NodeDetailPanel.tsx'
)
const sourceViewerPath = path.resolve(
  process.cwd(),
  'src/features/node-detail/components/SourceCodeViewer.tsx'
)
const nodeDetailOverviewSectionPath = path.resolve(
  process.cwd(),
  'src/features/node-detail/components/NodeDetailOverviewSection.tsx'
)
const nodeDetailCopyPath = path.resolve(
  process.cwd(),
  'src/features/node-detail/content/nodeDetailCopy.ts'
)
const reachabilityCopyPath = path.resolve(
  process.cwd(),
  'src/shared/content/reachabilityCopy.ts'
)

test('Node Detail supporting evidence removes duplicate large-file warnings and leads with verification guidance', () => {
  const panelSource = readFileSync(nodeDetailPanelPath, 'utf8')
  const sourceViewerSource = readFileSync(sourceViewerPath, 'utf8')
  const overviewSectionSource = readFileSync(
    nodeDetailOverviewSectionPath,
    'utf8'
  )
  const copySource = readFileSync(nodeDetailCopyPath, 'utf8')
  const reachabilityCopySource = readFileSync(reachabilityCopyPath, 'utf8')
  const warningCount =
    (panelSource.match(/Large file detected\./g) ?? []).length +
    (sourceViewerSource.match(/Large file detected\./g) ?? []).length

  assert.equal(warningCount, 1)
  assert.match(panelSource, /<NodeDetailOverviewSection/)
  assert.match(overviewSectionSource, /nodeDetailCopy\.disclosure\.whyTitle/)
  assert.doesNotMatch(overviewSectionSource, /Calculation:/)
  assert.match(overviewSectionSource, /Score basis:/)
  assert.match(copySource, /broader review and testing may be needed/i)
  assert.match(copySource, /reachabilityCopy\.(title|detailDescription)/)
  assert.match(
    reachabilityCopySource,
    /Possibly Unreachable|Not reached from detected entry points/i
  )
  assert.doesNotMatch(copySource, /0 dependents and is not an entry point/i)
})

test('Node Detail supporting evidence resolves secondary signals without repeating the primary cycle diagnosis', () => {
  const overviewSectionSource = readFileSync(
    nodeDetailOverviewSectionPath,
    'utf8'
  )

  assert.doesNotMatch(overviewSectionSource, /blastRadiusAssessment\.isInCycle/)
  assert.doesNotMatch(
    overviewSectionSource,
    /nodeDetailCopy\.blastRadius\.criticalTitle/
  )
  assert.match(overviewSectionSource, /resolveNodeDetailSupportingSignals/)
})
