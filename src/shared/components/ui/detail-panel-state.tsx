import { AlertTriangle } from '@/shared/components/ui/icons'
import { cn } from '@/shared/lib/utils'

import type { ReactNode } from 'react'

interface DetailPanelStateProps {
  title: string
  description?: string
  icon?: ReactNode
  tone?: 'default' | 'warning' | 'danger'
  compact?: boolean
}

const toneClasses = {
  default: 'border-border bg-muted/20 text-muted-foreground',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-600',
  danger: 'border-destructive/30 bg-destructive/10 text-destructive'
} as const

export function DetailPanelState({
  title,
  description,
  icon,
  tone = 'default',
  compact = false
}: DetailPanelStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border px-4 text-center shadow-sm',
        compact ? 'py-8' : 'min-h-[12rem] py-10',
        toneClasses[tone]
      )}
    >
      <div className='mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-background/60'>
        {icon ?? <AlertTriangle className='h-4 w-4' />}
      </div>
      <p className='text-sm font-medium'>{title}</p>
      {description ? (
        <p className='mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground'>
          {description}
        </p>
      ) : null}
    </div>
  )
}
