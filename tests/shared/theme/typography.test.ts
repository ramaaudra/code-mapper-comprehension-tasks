import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

function readIndexCss(): string {
  return readFileSync(
    new URL('../../../src/index.css', import.meta.url),
    'utf8'
  )
}

function readTailwindConfig(): string {
  return readFileSync(
    new URL('../../../tailwind.config.js', import.meta.url),
    'utf8'
  )
}

test('body typography uses Atkinson Hyperlegible Next as the primary interface font', () => {
  const css = readIndexCss()
  const bodyBlock =
    css.match(/body\s*\{[\s\S]*?background-color:[\s\S]*?\n  \}/)?.[0] ?? ''

  assert.match(
    bodyBlock,
    /font-family:\s*'Atkinson Hyperlegible Next',\s*sans-serif;/
  )
  assert.match(bodyBlock, /font-kerning:\s*normal;/)
  assert.doesNotMatch(
    bodyBlock,
    /font-family:\s*'Atkinson Hyperlegible Mono',\s*monospace;/
  )
  assert.doesNotMatch(css, /family=Recursive:wght@400;500;600;700&display=swap/)
  assert.doesNotMatch(css, /font-family:\s*'Geist Sans'/)
})

test('tailwind font families use Atkinson Hyperlegible Next for app copy and data, plus Atkinson Hyperlegible Mono for code', () => {
  const config = readTailwindConfig()
  const css = readIndexCss()

  assert.match(
    config,
    /sans:\s*\['Atkinson Hyperlegible Next',\s*'sans-serif'\]/
  )
  assert.match(
    config,
    /mono:\s*\['Atkinson Hyperlegible Mono',\s*'monospace'\]/
  )
  assert.match(
    config,
    /data:\s*\['Atkinson Hyperlegible Next',\s*'sans-serif'\]/
  )
  assert.match(
    css,
    /family=Atkinson\+Hyperlegible\+Next:wght@400;500;600;700&display=swap/
  )
  assert.doesNotMatch(css, /family=Recursive:wght@400;500;600;700&display=swap/)
})

test('global code-like elements keep Atkinson Hyperlegible Mono for evidence surfaces', () => {
  const css = readIndexCss()

  assert.match(
    css,
    /code,\s*kbd,\s*pre,\s*samp\s*\{[\s\S]*font-family:\s*'Atkinson Hyperlegible Mono',\s*monospace;/
  )
  assert.match(css, /font-variant-ligatures:\s*none;/)
})
