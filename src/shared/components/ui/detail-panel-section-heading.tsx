import type { ReactNode } from 'react'

interface DetailPanelSectionHeadingProps {
  title: string
  meta?: ReactNode
}

export function DetailPanelSectionHeading({
  title,
  meta
}: DetailPanelSectionHeadingProps) {
  return (
    <div className='flex items-center justify-between gap-3'>
      <h3 className='text-sm font-medium text-foreground'>{title}</h3>
      {meta ? (
        <div className='text-xs text-muted-foreground'>{meta}</div>
      ) : null}
    </div>
  )
}
