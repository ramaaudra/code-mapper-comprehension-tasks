import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf8')
}

test('overview hardening guards incomplete architecture context and keeps help accessible', () => {
  const projectDashboard = readProjectFile(
    'src/features/dashboard/components/ProjectDashboard.tsx'
  )
  const issuesPanel = readProjectFile(
    'src/features/dashboard/components/IssuesPanel.tsx'
  )
  const couplingDistribution = readProjectFile(
    'src/features/dashboard/components/CouplingDistribution.tsx'
  )
  const infoTooltip = readProjectFile(
    'src/shared/components/ui/info-tooltip.tsx'
  )

  assert.match(projectDashboard, /isLoading:\s*isArchitectureLoading/)
  assert.match(projectDashboard, /error:\s*architectureError/)
  assert.match(projectDashboard, /OverviewSectionState/)
  assert.match(projectDashboard, /StatusAnnouncer/)
  assert.match(projectDashboard, /dashboardCopy\.sectionStates\.reviewFirst/)
  assert.match(projectDashboard, /dashboardCopy\.sectionStates\.systemContext/)
  assert.match(projectDashboard, /<dl className='grid gap-px bg-border\/70/)
  assert.match(projectDashboard, /<dd className='mt-2 space-y-1'/)
  assert.doesNotMatch(projectDashboard, /<\/dd>\s*<p className='mt-1/)

  assert.match(
    issuesPanel,
    /focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2/
  )
  assert.match(issuesPanel, /<ul className='space-y-1/)
  assert.doesNotMatch(issuesPanel, /<br \/>/)

  assert.match(couplingDistribution, /<ul className='space-y-0\.5/)
  assert.match(infoTooltip, /min-h-11/)
  assert.match(infoTooltip, /min-w-11/)
})
