import * as React from 'react'

import { Info } from '@/shared/components/ui/icons'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/shared/components/ui/tooltip'
import { cn } from '@/shared/lib/utils'

interface InfoTooltipProps {
  children: React.ReactNode
  title?: string
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  className?: string
  iconClassName?: string
  asChild?: boolean
  triggerLabel?: string
}

/**
 * InfoTooltip - Komponen untuk pola tooltip edukasi dengan icon info
 *
 * Pattern yang sering muncul di dashboard:
 * - Icon Info (?) di header card
 * - Konten berisi penjelasan konsep, formula, atau definisi
 * - Styling konsisten dengan bg-popover, border-border, max-w-sm
 *
 * @example
 * <InfoTooltip title="What is Risk Score?">
 *   <div className="space-y-2">
 *     <p>Scientific metric based on Robert C. Martin's formula</p>
 *     <div className="border-t pt-1">...</div>
 *   </div>
 * </InfoTooltip>
 */
export function InfoTooltip({
  children,
  title,
  side = 'top',
  align = 'center',
  className,
  iconClassName,
  asChild = false,
  triggerLabel
}: InfoTooltipProps) {
  const resolvedTriggerLabel = triggerLabel ?? title ?? 'More information'

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {asChild ? (
          children
        ) : (
          <button
            type='button'
            aria-label={resolvedTriggerLabel}
            className={cn(
              'cursor-help text-muted-foreground transition-colors hover:text-foreground',
              iconClassName
            )}
          >
            <Info className='h-4 w-4' />
          </button>
        )}
      </TooltipTrigger>
      <TooltipContent
        side={side}
        align={align}
        className={cn('max-w-sm border-border bg-popover', className)}
      >
        {title ? (
          <div className='space-y-2'>
            <p className='font-semibold text-popover-foreground'>{title}</p>
            {children}
          </div>
        ) : (
          children
        )}
      </TooltipContent>
    </Tooltip>
  )
}

interface InfoTooltipContentProps {
  title: string
  description?: string
  children?: React.ReactNode
}

/**
 * InfoTooltipContent - Layout helper for educational tooltip content.
 * Uses a consistent pattern: title, description, and optional sections.
 */
export function InfoTooltipContent({
  title,
  description,
  children
}: InfoTooltipContentProps) {
  return (
    <div className='space-y-2'>
      <p className='font-semibold text-popover-foreground'>{title}</p>
      {description && (
        <p className='text-xs text-popover-foreground'>{description}</p>
      )}
      {children && (
        <div className='space-y-1 border-t border-border pt-1 text-xs'>
          {children}
        </div>
      )}
    </div>
  )
}

interface InfoTooltipSectionProps {
  title: string
  children: React.ReactNode
}

/**
 * InfoTooltipSection - Section dalam tooltip dengan border separator
 */
export function InfoTooltipSection({
  title,
  children
}: InfoTooltipSectionProps) {
  return (
    <div className='space-y-1 border-t border-border pt-1 text-xs'>
      <p className='font-semibold text-popover-foreground'>{title}</p>
      {children}
    </div>
  )
}
