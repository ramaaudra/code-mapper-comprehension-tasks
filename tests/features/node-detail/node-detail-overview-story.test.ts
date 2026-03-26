import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const nodeDetailPanelPath = path.resolve(
  process.cwd(),
  'src/features/node-detail/components/NodeDetailPanel.tsx'
)
const nodeDetailOverviewSectionPath = path.resolve(
  process.cwd(),
  'src/features/node-detail/components/NodeDetailOverviewSection.tsx'
)
const decisionStorySectionPath = path.resolve(
  process.cwd(),
  'src/shared/components/ui/decision-story-section.tsx'
)

test('Node Detail overview story surfaces dependency and architecture-role evidence on the first screen', () => {
  const panelSource = readFileSync(nodeDetailPanelPath, 'utf8')
  const overviewSectionSource = readFileSync(
    nodeDetailOverviewSectionPath,
    'utf8'
  )
  const storySource = readFileSync(decisionStorySectionPath, 'utf8')

  assert.match(panelSource, /<NodeDetailOverviewSection/)
  assert.match(overviewSectionSource, /dependencies:\s*archMetrics\s*\?/)
  assert.match(overviewSectionSource, /architectureRole:\s*archMetrics\s*\?/)
  assert.match(storySource, /decisionCopy\.evidence\.labels\.dependencies/)
  assert.match(storySource, /decisionCopy\.evidence\.labels\.architectureRole/)
  assert.match(storySource, /evidenceHelpers\?\.dependencies/)
  assert.match(storySource, /evidenceHelpers\?\.architectureRole/)
})
