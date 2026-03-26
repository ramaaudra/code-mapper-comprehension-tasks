import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const filesToCheck = [
  'src/features/node-detail/components/NodeDetailPanel.tsx',
  'src/features/node-detail/components/SourceCodeViewer.tsx',
  'src/shared/components/ui/diagnosis-card.tsx',
  'src/shared/components/ui/review-priority-badge.tsx',
  'src/features/architecture/components/ArchitectureStats.tsx'
].map((filePath) => path.resolve(process.cwd(), filePath))

test('Node Detail surfaces use semantic status tokens instead of raw utility colors', () => {
  for (const filePath of filesToCheck) {
    const source = readFileSync(filePath, 'utf8')

    assert.doesNotMatch(source, /text-(red|orange|sky|green|yellow)-500/)
    assert.doesNotMatch(source, /bg-yellow-500\/10/)
    assert.doesNotMatch(source, /border-(red|orange|yellow)-500/)
  }
})
