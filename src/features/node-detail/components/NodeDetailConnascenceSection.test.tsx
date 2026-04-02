import assert from 'node:assert/strict'
import test from 'node:test'

import { renderToStaticMarkup } from 'react-dom/server'

import { TooltipProvider } from '@/shared/components/ui/tooltip'

import { NodeDetailConnascenceSection } from './NodeDetailConnascenceSection'

const signals = [
  {
    kind: 'fragile-positional-api' as const,
    signalKey: 'fragile-positional-api:/repo/contract.ts#createUser',
    title: 'Fragile Positional API' as const,
    symbolName: 'createUser',
    declarationPreview:
      'createUser(name: string, role: string, isActive: boolean, city: string)',
    declaredIn: '/repo/contract.ts',
    targetFiles: ['/repo/caller-a.ts', '/repo/caller-b.ts'],
    requiredParamCount: 4,
    callerCount: 2,
    moduleBoundaryCount: 2,
    severity: 'high' as const,
    confidence: 'high' as const,
    whyItMatters:
      'This exported API relies on argument order across 2 cross-file call sites.',
    recommendedAction:
      'Review the linked call sites before changing the signature.',
    evidence: []
  }
]

test('NodeDetailConnascenceSection renders concrete review targets and actions', () => {
  const markup = renderToStaticMarkup(
    <TooltipProvider>
      <NodeDetailConnascenceSection
        signals={signals}
        onNavigateToFile={() => {}}
        onOpenDependents={() => {}}
        onFocusDependents={() => {}}
      />
    </TooltipProvider>
  )

  assert.match(
    markup,
    /<h3 class="[^"]*text-base[^"]*font-semibold[^"]*">Change Coordination Risks<\/h3>/
  )
  assert.match(
    markup,
    /<h3 class="[^"]*text-foreground[^"]*">Change Coordination Risks<\/h3>/
  )
  assert.match(
    markup,
    /<h4 class="[^"]*text-\[15px\][^"]*font-semibold[^"]*tracking-tight[^"]*text-foreground[^"]*">createUser depends on argument order<\/h4>/
  )
  assert.match(markup, /Change Coordination Risks/)
  assert.match(markup, /createUser depends on argument order/)
  assert.match(
    markup,
    /createUser\(name: string, role: string, isActive: boolean, city: string\)/
  )
  assert.match(markup, /Cross-module.*2 caller files/)
  assert.match(markup, /Declaration preview/)
  assert.match(markup, /Review first/)
  assert.match(markup, /Next step:/)
  assert.match(markup, /caller-a\.ts/)
  assert.match(markup, /Open Used By tab/)
  assert.match(markup, /Focus in graph/)
  assert.doesNotMatch(markup, /Pattern:/)
  assert.doesNotMatch(markup, /Suggested next step/)
})

test('NodeDetailConnascenceSection renders shared type previews when available', () => {
  const markup = renderToStaticMarkup(
    <TooltipProvider>
      <NodeDetailConnascenceSection
        signals={[
          {
            kind: 'shared-type-contract',
            signalKey: 'shared-type-contract:/repo/types.ts#Product',
            title: 'Shared Type Contract',
            typeName: 'Product',
            declarationPreview: 'Product { id, name, price, +2 more }',
            declaredIn: '/repo/types.ts',
            targetFiles: ['/repo/product-card.tsx', '/repo/product-list.tsx'],
            importerCount: 2,
            moduleBoundaryCount: 2,
            severity: 'medium',
            confidence: 'high',
            usageKind: 'parameter',
            whyItMatters:
              'This exported type is acting as a shared contract across 2 consumer files.',
            recommendedAction:
              'Inspect all linked consumers before changing this shape.',
            evidence: []
          }
        ]}
        onNavigateToFile={() => {}}
      />
    </TooltipProvider>
  )

  assert.match(markup, /Product is a shared type contract/)
  assert.match(markup, /Product \{ id, name, price, \+2 more \}/)
  assert.match(markup, /2 consumer files/)
})
