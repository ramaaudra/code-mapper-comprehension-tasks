import { cn } from '@/shared/lib/utils'

import type { MetricsGuideSectionId } from '@/shared/lib/utils'

interface TOCLink {
  id: MetricsGuideSectionId
  label: string
}

export const metricsGuideTOCLinks: TOCLink[] = [
  { id: 'start-here', label: 'Start Here' },
  { id: 'how-to-read', label: 'How to Read the Metrics' },
  { id: 'decision-matrix', label: 'How Priorities are Set' },
  { id: 'which-screen', label: 'Which Screen to Use?' },
  { id: 'caveats-terms', label: 'Caveats and Terms' }
]

interface MetricsGuideTOCProps {
  activeSection: string | null
  onSectionClick: (id: MetricsGuideSectionId) => void
}

export function MetricsGuideTOC({
  activeSection,
  onSectionClick
}: MetricsGuideTOCProps) {
  return (
    <nav aria-label='Metrics guide navigation' className='space-y-1'>
      <p className='mb-3 text-xs font-medium uppercase tracking-label text-muted-foreground/70'>
        On this page
      </p>
      <ul className='space-y-0.5 border-l border-border/60'>
        {metricsGuideTOCLinks.map((link) => {
          const isActive = activeSection === link.id
          return (
            <li key={link.id}>
              <button
                type='button'
                onClick={() => onSectionClick(link.id)}
                className={cn(
                  'w-full cursor-pointer border-l-2 py-2.5 pl-3 pr-2 text-left text-sm transition-colors',
                  isActive
                    ? 'border-primary/70 bg-primary/5 font-medium text-foreground'
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
