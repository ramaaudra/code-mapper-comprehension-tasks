import { DetailPanelSectionHeading } from '@/shared/components/ui/detail-panel-section-heading'
import { cn } from '@/shared/lib/utils'

import type { ReactNode } from 'react'

export interface DecisionEvidenceListItem {
  label: string
  value: string
  helper?: ReactNode
}

interface DecisionEvidenceListProps {
  title: string
  items: DecisionEvidenceListItem[]
  headingLevel?: 'section' | 'subsection'
  className?: string
}

export function DecisionEvidenceList({
  title,
  items,
  headingLevel = 'subsection',
  className
}: DecisionEvidenceListProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <div className={cn('space-y-3', className)}>
      <DetailPanelSectionHeading title={title} level={headingLevel} />
      <dl className='overflow-hidden rounded-lg border border-border/60 bg-muted/10'>
        {items.map((item, index) => (
          <div
            key={item.label}
            className={cn(
              'px-4 py-3',
              index > 0 ? 'border-t border-border/60' : undefined
            )}
          >
            <dt className='text-xs font-medium text-muted-foreground'>
              {item.label}
            </dt>
            <dd className='mt-1.5 space-y-1'>
              <p className='text-sm font-medium leading-relaxed text-foreground'>
                {item.value}
              </p>
              {item.helper ? (
                <div className='text-xs leading-relaxed text-muted-foreground'>
                  {item.helper}
                </div>
              ) : null}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
