import { cn } from '@/shared/lib/utils'

import type { ReactNode } from 'react'

interface DetailPanelSectionHeadingProps {
  title: string
  meta?: ReactNode
  level?: 'section' | 'subsection'
  titleClassName?: string
  metaClassName?: string
}

export function DetailPanelSectionHeading({
  title,
  meta,
  level = 'subsection',
  titleClassName,
  metaClassName
}: DetailPanelSectionHeadingProps) {
  const titleBaseClass =
    level === 'section'
      ? 'text-base font-semibold text-foreground'
      : 'text-sm font-medium text-foreground'

  return (
    <div className='flex items-center justify-between gap-3'>
      <h3 className={cn(titleBaseClass, titleClassName)}>{title}</h3>
      {meta ? (
        <div className={cn('text-xs text-muted-foreground', metaClassName)}>
          {meta}
        </div>
      ) : null}
    </div>
  )
}
