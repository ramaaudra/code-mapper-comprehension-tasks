import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf8')
}

test('dark-only contract does not keep light-mode runtime branches', () => {
  const indexHtml = readProjectFile('index.html')
  const indexCss = readProjectFile('src/index.css')
  const themeProvider = readProjectFile(
    'src/shared/components/providers/ThemeProvider.tsx'
  )
  const appLayout = readProjectFile(
    'src/shared/components/layouts/AppLayout.tsx'
  )
  const setupGuidePage = readProjectFile(
    'src/features/setup-guide/components/SetupGuidePage.tsx'
  )
  const nodeDetailSourceSection = readProjectFile(
    'src/features/node-detail/components/NodeDetailSourceSection.tsx'
  )
  const sourceCodeViewer = readProjectFile(
    'src/features/node-detail/components/SourceCodeViewer.tsx'
  )
  const appEntry = readProjectFile('src/App.tsx')
  const reportEntry = readProjectFile('src/features/report/report-entry.tsx')

  assert.match(indexHtml, /<html[^>]*class="dark"/)
  assert.doesNotMatch(indexHtml, /prefers-color-scheme:\s*light/)
  assert.doesNotMatch(indexCss, /--background:\s*0 0% 100%;/)
  assert.doesNotMatch(indexCss, /--card:\s*0 0% 100%;/)
  assert.doesNotMatch(indexCss, /color-scheme:\s*light/)
  assert.doesNotMatch(indexCss, /\.dark\s*\{/)

  assert.match(appEntry, /<ThemeProvider>/)
  assert.match(reportEntry, /<ThemeProvider>/)

  assert.doesNotMatch(themeProvider, /setTheme/)
  assert.doesNotMatch(themeProvider, /classList\.remove\('light'\)/)

  assert.doesNotMatch(appLayout, /from-slate-50/)
  assert.doesNotMatch(appLayout, /to-slate-100/)
  assert.doesNotMatch(appLayout, /dark:/)
  assert.doesNotMatch(setupGuidePage, /dark:/)
  assert.doesNotMatch(setupGuidePage, /text-amber-700/)
  assert.doesNotMatch(setupGuidePage, /text-emerald-700/)

  assert.doesNotMatch(nodeDetailSourceSection, /theme='auto'/)

  assert.doesNotMatch(sourceCodeViewer, /'light'\s*\|\s*'dark'\s*\|\s*'auto'/)
  assert.doesNotMatch(sourceCodeViewer, /vsLight/)
})
