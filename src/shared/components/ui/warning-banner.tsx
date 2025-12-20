import { useState } from 'react'

import { cn } from '@/shared/lib/utils'

import { Button } from './button'
import { AlertTriangle, ChevronRight, X } from './icons'

interface WarningBannerProps {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  onDismiss?: () => void
  className?: string
  storageKey?: string
}

export function WarningBanner({
  title,
  description,
  actionLabel,
  onAction,
  onDismiss,
  className,
  storageKey
}: WarningBannerProps) {
  const [isDismissed, setIsDismissed] = useState(() => {
    if (storageKey) {
      return localStorage.getItem(storageKey) === 'dismissed'
    }
    return false
  })

  if (isDismissed) {
    return null
  }

  const handleDismiss = () => {
    if (storageKey) {
      localStorage.setItem(storageKey, 'dismissed')
    }
    setIsDismissed(true)
    onDismiss?.()
  }

  return (
    <div
      className={cn(
        'bg-yellow-500/10 border-b border-yellow-500/20 px-4 py-2.5',
        'flex items-center justify-between gap-4',
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0" />
        <div className="flex items-center gap-2 min-w-0 text-sm">
          <span className="font-medium text-yellow-600 dark:text-yellow-400 shrink-0">
            {title}
          </span>
          <span className="text-yellow-700/80 dark:text-yellow-300/80 truncate">
            {description}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {actionLabel && onAction && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onAction}
            className="h-7 text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 hover:bg-yellow-500/10"
          >
            {actionLabel}
            <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDismiss}
          className="h-7 w-7 text-yellow-600/60 hover:text-yellow-600 dark:text-yellow-400/60 dark:hover:text-yellow-400 hover:bg-yellow-500/10"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
