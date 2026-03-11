import type { ReactNode } from 'react'

interface InsightBulletListProps {
  items: string[]
  prefix?: ReactNode
}

export function InsightBulletList({
  items,
  prefix = <span className='text-[10px]'>-</span>
}: InsightBulletListProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <ul className='space-y-1.5'>
      {items.map((item) => (
        <li key={item} className='flex items-start gap-2'>
          <span className='mt-0.5 shrink-0 text-muted-foreground/70'>
            {prefix}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}
