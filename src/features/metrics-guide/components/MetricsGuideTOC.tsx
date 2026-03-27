import { cn } from '@/shared/lib/utils'

import type { MetricsGuideMode } from '@/shared/types/explorer'

interface TOCLink {
  id: string
  label: string
}

const quickGuideTOC: TOCLink[] = [
  { id: 'what-you-can-do', label: 'What You Can Do' },
  { id: 'key-ideas', label: 'Key Ideas' },
  { id: 'visual-primer', label: 'Visual Primer' },
  { id: 'decision-matrix', label: 'Decision Matrix' },
  { id: 'screens', label: 'Which Screen?' },
  { id: 'important-caveats', label: 'Caveats' }
]

const referenceTOC: TOCLink[] = [
  { id: 'core-metrics', label: 'Core Metrics' },
  { id: 'derived-heuristics', label: 'Derived Heuristics' },
  { id: 'how-to-read', label: 'How to Read' },
  { id: 'glossary', label: 'Glossary' }
]

interface MetricsGuideTOCProps {
  mode: MetricsGuideMode
  activeSection: string | null
  onSectionClick: (id: string) => void
}

export function MetricsGuideTOC({
  mode,
  activeSection,
  onSectionClick
}: MetricsGuideTOCProps) {
  const links = mode === 'quick' ? quickGuideTOC : referenceTOC

  return (
    <nav aria-label='Metrics guide navigation' className='space-y-1'>
      <p className='mb-3 text-xs font-medium uppercase tracking-label text-muted-foreground/70'>
        On this page
      </p>
      <ul className='space-y-0.5 border-l border-border/60'>
        {links.map((link) => {
          const isActive = activeSection === link.id
          return (
            <li key={link.id}>
              <button
                type='button'
                onClick={() => onSectionClick(link.id)}
                className={cn(
                  'w-full cursor-pointer border-l-2 py-2.5 pl-3 pr-2 text-left text-sm transition-colors',
                  isActive
                    ? mode === 'quick'
                      ? 'border-primary/70 bg-primary/5 font-medium text-foreground'
                      : 'border-foreground/50 bg-muted/50 font-medium text-foreground'
                    : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
                )}
              >
                {link.label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export { quickGuideTOC, referenceTOC }
