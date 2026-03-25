import { MetricCard } from '@/shared/components/ui/metric-card'

import type { ReactNode } from 'react'

export interface ArchitectureSummaryCard {
  label: string
  value: number | string
  subValue: string
  icon: ReactNode
}

interface ArchitectureSummarySectionProps {
  title: string
  description: string
  cards: ArchitectureSummaryCard[]
}

export function ArchitectureSummarySection({
  title,
  description,
  cards
}: ArchitectureSummarySectionProps) {
  return (
    <section
      aria-labelledby='architecture-summary-heading'
      className='space-y-3'
    >
      <div className='space-y-1'>
        <h2
          id='architecture-summary-heading'
          className='text-sm font-medium tracking-label text-muted-foreground'
        >
          {title}
        </h2>
        <p className='max-w-3xl text-sm text-muted-foreground'>{description}</p>
      </div>
      <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-5'>
        {cards.map(({ label, value, subValue, icon }) => (
          <MetricCard
            key={label}
            label={label}
            value={value}
            subValue={subValue}
            icon={icon}
            variant='minimal'
          />
        ))}
      </div>
    </section>
  )
}
