import { type VariantProps, cva } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/shared/lib/utils'

const shortcutBadgeVariants = cva(
  'inline-flex shrink-0 select-none items-center justify-center rounded-md border px-2 py-0.5 font-mono text-xs font-medium leading-none',
  {
    variants: {
      tone: {
        default: 'border-border/70 bg-muted/60 text-muted-foreground',
        inverse:
          'border-primary-foreground/30 bg-primary-foreground/20 text-primary-foreground'
      }
    },
    defaultVariants: {
      tone: 'default'
    }
  }
)

export interface ShortcutBadgeProps
  extends
    React.ComponentPropsWithoutRef<'kbd'>,
    VariantProps<typeof shortcutBadgeVariants> {}

export function ShortcutBadge({
  className,
  tone,
  children,
  ...props
}: ShortcutBadgeProps) {
  return (
    <kbd className={cn(shortcutBadgeVariants({ tone }), className)} {...props}>
      {children}
    </kbd>
  )
}
