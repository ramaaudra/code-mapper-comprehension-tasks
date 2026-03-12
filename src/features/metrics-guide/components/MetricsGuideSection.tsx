import { cn } from '@/shared/lib/utils'

import type { ReactNode } from 'react'

interface MetricsGuideSectionProps {
  id: string
  eyebrow: string
  title: string
  description: string
  children: ReactNode
  className?: string
}

export function MetricsGuideSection({
  id,
  eyebrow,
  title,
  description,
  children,
  className
}: MetricsGuideSectionProps) {
  return (
    <section id={id} className={cn('scroll-mt-6 space-y-4', className)}>
      <div className='space-y-1.5'>
        <p className='text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground/85'>
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
