import { cn } from '@/shared/lib/utils'

import type { MetricsGuideMode } from '@/shared/types/explorer'
import type { ReactNode } from 'react'

interface MetricsGuideSectionProps {
  id: string
  eyebrow: string
  title: string
  description: string
  children: ReactNode
  className?: string
  mode?: MetricsGuideMode
}

export function MetricsGuideSection({
  id,
  eyebrow,
  title,
  description,
  children,
  className,
  mode = 'quick'
}: MetricsGuideSectionProps) {
  return (
    <section id={id} className={cn('scroll-mt-6 space-y-4', className)}>
      <div className='space-y-1.5'>
        <p
          className={cn(
            'text-xs font-medium uppercase tracking-label',
            mode === 'quick' ? 'text-primary/70' : 'text-muted-foreground/85'
          )}
        >
          {eyebrow}
        </p>
        <div className='space-y-1'>
          <h2 className='text-xl font-semibold text-foreground'>{title}</h2>
          <p className='max-w-3xl text-sm text-muted-foreground/90'>
            {description}
          </p>
        </div>
      </div>
      {children}
    </section>
  )
}
