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
    <section id={id} className={cn('scroll-mt-6 space-y-5', className)}>
      <div className='space-y-1.5'>
        <p className='text-sm font-semibold uppercase tracking-widest text-primary/80'>
          {eyebrow}
        </p>
        <div className='space-y-1'>
          <h2 className='text-2xl font-bold text-foreground'>{title}</h2>
          <p className='max-w-3xl text-sm text-muted-foreground/90 md:text-base'>
            {description}
          </p>
        </div>
      </div>
      {children}
    </section>
  )
}
