import * as React from 'react'

import { ShortcutBadge } from '@/shared/components/ui/shortcut-badge'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/shared/components/ui/tooltip'
import { cn } from '@/shared/lib/utils'

interface SimpleTooltipProps {
  /**
   * Konten yang akan ditampilkan di tooltip
   * Bisa string sederhana atau React node
   */
  content: React.ReactNode

  /**
   * Element yang akan di-trigger tooltip-nya
   */
  children: React.ReactNode

  /**
   * Posisi tooltip relative ke trigger
   * @default 'top'
   */
  side?: 'top' | 'right' | 'bottom' | 'left'

  /**
   * Alignment tooltip relative ke trigger
   * @default 'center'
   */
  align?: 'start' | 'center' | 'end'

  /**
   * Offset dari trigger (dalam pixels)
   * @default 4
   */
  sideOffset?: number

  /**
   * CSS class untuk TooltipContent
   */
  className?: string

  /**
   * CSS class untuk TooltipTrigger wrapper
   */
  triggerClassName?: string

  /**
   * Delay before the tooltip appears (in ms).
   * @default 200 (inherited from the global TooltipProvider)
   */
  delayDuration?: number

  /**
   * Whether the trigger uses the asChild pattern.
   * Set to true when the child component needs to receive the ref.
   * @default false
   */
  asChild?: boolean
}

/**
 * SimpleTooltip - A lightweight tooltip wrapper with minimal boilerplate.
 *
 * Uses the global TooltipProvider from main.tsx, so no local provider is needed.
 * Default styling already includes text-xs and a practical max width.
 *
 * @example
 * // Basic usage - string content
 * <SimpleTooltip content="Copy to clipboard">
 *   <Button>Copy</Button>
 * </SimpleTooltip>
 *
 * @example
 * // With custom styling
 * <SimpleTooltip
 *   content={<div className="font-medium">Full path: {filePath}</div>}
 *   className="max-w-xs whitespace-pre-line"
 * >
 *   <span className="truncate">{basename}</span>
 * </SimpleTooltip>
 *
 * @example
 * // With asChild for proper ref forwarding
 * <SimpleTooltip content="Show sidebar" side="bottom" asChild>
 *   <Button variant="ghost" size="icon">
 *     <PanelLeftOpen />
 *   </Button>
 * </SimpleTooltip>
 */
export function SimpleTooltip({
  content,
  children,
  side = 'top',
  align = 'center',
  sideOffset = 4,
  className,
  triggerClassName,
  asChild = false
}: SimpleTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild={asChild} className={triggerClassName}>
        {children}
      </TooltipTrigger>
      <TooltipContent
        side={side}
        align={align}
        sideOffset={sideOffset}
        className={cn('text-xs', className)}
      >
        {content}
      </TooltipContent>
    </Tooltip>
  )
}

interface TextTooltipProps extends Omit<SimpleTooltipProps, 'content'> {
  /**
   * Text yang akan ditampilkan (string sederhana)
   */
  text: string

  /**
   * Maksimum width untuk tooltip
   * @default 'xs' (320px)
   */
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'none'

  /**
   * Preserve whitespace dan line breaks
   * @default false
   */
  preserveWhitespace?: boolean
}

const maxWidthClasses: Record<string, string> = {
  xs: 'max-w-xs',
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  none: ''
}

/**
 * TextTooltip - SimpleTooltip khusus untuk text content
 * Dengan preset styling untuk text truncation dan whitespace
 *
 * @example
 * // For file paths
 * <TextTooltip text={fullPath} preserveWhitespace>
 *   <button>{basename}</button>
 * </TextTooltip>
 *
 * @example
 * // For long descriptions
 * <TextTooltip text={description} maxWidth="sm">
 *   <span className="truncate">{summary}</span>
 * </TextTooltip>
 */
export function TextTooltip({
  text,
  maxWidth = 'xs',
  preserveWhitespace = false,
  className,
  ...props
}: TextTooltipProps) {
  return (
    <SimpleTooltip
      content={
        <p
          className={cn(
            preserveWhitespace && 'whitespace-pre-line',
            maxWidthClasses[maxWidth]
          )}
        >
          {text}
        </p>
      }
      className={cn(maxWidthClasses[maxWidth], className)}
      {...props}
    />
  )
}

interface ActionTooltipProps extends Omit<SimpleTooltipProps, 'content'> {
  /**
   * Label action yang akan ditampilkan
   */
  label: string

  /**
   * Shortcut key yang akan ditampilkan (opsional)
   * @example "Ctrl+C", "⌘K"
   */
  shortcut?: string
}

/**
 * ActionTooltip - Untuk tooltip pada action buttons
 * Menampilkan label action dengan optional keyboard shortcut
 *
 * @example
 * <ActionTooltip label="Refresh" shortcut="⌘R">
 *   <Button variant="ghost" size="icon">
 *     <RotateCcw />
 *   </Button>
 * </ActionTooltip>
 */
export function ActionTooltip({
  label,
  shortcut,
  className,
  ...props
}: ActionTooltipProps) {
  return (
    <SimpleTooltip
      content={
        <div className='flex items-center gap-2'>
          <span>{label}</span>
          {shortcut && (
            <ShortcutBadge tone='inverse' className='text-2xs'>
              {shortcut}
            </ShortcutBadge>
          )}
        </div>
      }
      className={cn('font-medium', className)}
      {...props}
    />
  )
}
