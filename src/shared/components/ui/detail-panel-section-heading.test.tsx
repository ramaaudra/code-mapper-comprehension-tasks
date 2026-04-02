import assert from 'node:assert/strict'
import test from 'node:test'

import { renderToStaticMarkup } from 'react-dom/server'

import { DetailPanelSectionHeading } from './detail-panel-section-heading'

test('DetailPanelSectionHeading uses a larger visual role for panel sections', () => {
  const markup = renderToStaticMarkup(
    <DetailPanelSectionHeading title='Supporting evidence' level='section' />
  )

  assert.match(
    markup,
    /<h3 class="[^"]*text-base[^"]*font-semibold[^"]*text-foreground[^"]*">Supporting evidence<\/h3>/
  )
})

test('DetailPanelSectionHeading keeps subsection headings more compact', () => {
  const markup = renderToStaticMarkup(
    <DetailPanelSectionHeading
      title='Architecture Metrics'
      level='subsection'
    />
  )

  assert.match(
    markup,
    /<h3 class="[^"]*text-sm[^"]*font-medium[^"]*text-foreground[^"]*">Architecture Metrics<\/h3>/
  )
})
