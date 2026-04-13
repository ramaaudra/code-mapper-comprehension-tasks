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
  default: {
    container: 'border-border bg-muted/20 text-muted-foreground',
    description: 'text-muted-foreground'
  },
  warning: {
    container:
      'border-status-warning-border bg-status-warning-surface text-status-warning-foreground',
    description: 'text-status-warning-foreground/85'
  },
  danger: {
    container:
      'border-status-critical-border bg-status-critical-surface text-status-critical-foreground',
    description: 'text-status-critical-foreground/85'
  }
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
        toneClasses[tone].container
      )}
    >
      <div className='mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-background/60'>
        {icon ?? <AlertTriangle className='h-4 w-4' />}
      </div>
      <p className='text-sm font-medium'>{title}</p>
      {description ? (
        <p
          className={cn(
            'mt-1 max-w-sm text-xs leading-relaxed',
            toneClasses[tone].description
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  )
}
