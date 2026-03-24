import { Button } from '@/shared/components/ui/button'
import { X } from '@/shared/components/ui/icons'
import { truncateMiddle } from '@/shared/lib/utils'

import type { ReactNode } from 'react'

interface DetailPanelHeaderProps {
  icon: ReactNode
  title: string
  subtitle: string
  meta?: ReactNode
  trailing?: ReactNode
  onClose: () => void
  closeLabel?: string
}

export function DetailPanelHeader({
  icon,
  title,
  subtitle,
  meta,
  trailing,
  onClose,
  closeLabel = 'Close panel'
}: DetailPanelHeaderProps) {
  return (
    <div className='flex items-start justify-between gap-4 border-b border-border p-4'>
      <div className='flex min-w-0 items-start gap-3 overflow-hidden'>
        <div className='mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted'>
          {icon}
        </div>
        <div className='min-w-0'>
          <h2
            className='truncate font-mono text-lg font-semibold text-foreground'
            title={title}
          >
            {title}
          </h2>
          <div className='mt-0.5 flex items-center gap-1.5'>
            <p
              className='max-w-[220px] truncate font-mono text-xs text-muted-foreground'
              title={subtitle}
            >
              {truncateMiddle(subtitle, 44)}
            </p>
            {meta}
            {trailing}
          </div>
        </div>
      </div>
      <Button
        variant='ghost'
        size='icon'
        onClick={onClose}
        aria-label={closeLabel}
        className='-mr-2 -mt-2 h-8 w-8 shrink-0'
      >
        <X className='h-4 w-4' />
      </Button>
    </div>
  )
}
