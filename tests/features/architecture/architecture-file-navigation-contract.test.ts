import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const architecturePagePath = path.resolve(
  process.cwd(),
  'src/features/architecture/components/ArchitecturePage.tsx'
)
const architectureTablePath = path.resolve(
  process.cwd(),
  'src/features/architecture/components/ArchitectureTable.tsx'
)
const appPath = path.resolve(process.cwd(), 'src/App.tsx')
const reportShellPath = path.resolve(
  process.cwd(),
  'src/features/report/components/ReportShell.tsx'
)

function readSource(filePath: string): string {
  return readFileSync(filePath, 'utf8')
}

test('Architecture file review flow exposes a navigation callback from shell to table rows', () => {
  const architecturePageSource = readSource(architecturePagePath)
  const architectureTableSource = readSource(architectureTablePath)
  const appSource = readSource(appPath)
  const reportShellSource = readSource(reportShellPath)

  assert.match(
    architecturePageSource,
    /interface ArchitecturePageProps \{[\s\S]*onNavigateToFile\?: \(filePath: string\) => void/
  )
  assert.match(
    architecturePageSource,
    /<ArchitectureTable[\s\S]*onNavigateToFile=\{onNavigateToFile\}/
  )
  assert.match(
    architectureTableSource,
    /interface ArchitectureTableProps \{[\s\S]*onNavigateToFile\?: \(filePath: string\) => void/
  )
  assert.match(
    appSource,
    /<ArchitecturePage[\s\S]*onNavigateToFile=\{\(filePath\)\s*=>[\s\S]*explorer\.navigateToFile\(filePath\)[\s\S]*\}/
  )
  assert.match(
    reportShellSource,
    /<ArchitecturePage[\s\S]*onNavigateToFile=\{\(filePath\)\s*=>[\s\S]*explorer\.navigateToFile\(filePath\)[\s\S]*\}/
  )
})
