import assert from 'node:assert/strict'
import test from 'node:test'

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { ExplorerShell } from '../../../../src/shared/components/layouts/ExplorerShell'
import { TooltipProvider } from '../../../../src/shared/components/ui/tooltip'

function renderShell(): string {
  return renderToStaticMarkup(
    <TooltipProvider delayDuration={0}>
      <ExplorerShell
        runtimeMode='live'
        isLoading={false}
        loadError={null}
        hasData={true}
        onRefresh={() => {}}
        activePrimaryViewMode='overview'
        activeUtilityViewMode={null}
        contextChip={null}
        onShowOverview={() => {}}
        onShowGraph={() => {}}
        onShowArchitecture={() => {}}
        onShowMetricsGuide={() => {}}
        isTreeCollapsed={false}
        onToggleTree={() => {}}
        onShowSetupGuide={() => {}}
        hasUnresolvedImports={false}
        fileCount={79}
        analysisLoadedAt={null}
        hasChanges={true}
        totalChanges={3}
        sidebar={<div>Sidebar</div>}
        main={<div>Main content</div>}
      />
    </TooltipProvider>
  )
}

test('ExplorerShell exposes a main landmark and keeps the brand out of the page heading hierarchy', () => {
  const html = renderShell()

  assert.match(html, /<main[^>]*>/)
  assert.doesNotMatch(html, /<h1[^>]*>Code Mapper<\/h1>/)
})

test('ExplorerShell enlarges top-bar controls to more touch-friendly sizes', () => {
  const html = renderShell()

  assert.match(html, /h-10 w-10/)
  assert.match(html, /h-10 touch-manipulation gap-1\.5 px-3/)
  assert.doesNotMatch(html, /h-8 w-8/)
})
