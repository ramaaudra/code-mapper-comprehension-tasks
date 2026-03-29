import assert from 'node:assert/strict'
import test from 'node:test'

import { renderToStaticMarkup } from 'react-dom/server'

import { AppLayout } from './AppLayout'

test('AppLayout locks the explorer shell to the viewport so scrolling stays inside panels', () => {
  const markup = renderToStaticMarkup(
    <AppLayout>
      <div>content</div>
    </AppLayout>
  )

  assert.match(markup, /\bh-dvh\b/)
  assert.match(markup, /\bmin-h-dvh\b/)
  assert.match(markup, /\boverflow-hidden\b/)
})
