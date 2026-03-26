import { Badge } from '@/shared/components/ui/badge'
import { cn, getReviewPriorityTone } from '@/shared/lib/utils'

import type { ReviewPriority } from '@/shared/lib/utils'

interface ReviewPriorityBadgeProps {
  priority: ReviewPriority
  className?: string
}

const toneClasses = {
  danger:
    'border-status-critical-border bg-status-critical-surface text-status-critical-foreground',
  warning:
    'border-status-warning-border bg-status-warning-surface text-status-warning-foreground',
  info: 'border-primary/20 bg-primary/10 text-primary',
  success:
    'border-status-success-border bg-status-success-surface text-status-success-foreground',
  default: 'border-border bg-muted/60 text-foreground'
} as const

export function ReviewPriorityBadge({
  priority,
  className
}: ReviewPriorityBadgeProps) {
  const tone = getReviewPriorityTone(priority)

  return (
    <Badge
      variant='outline'
      className={cn(
        'shrink-0 rounded-full px-2 py-1 text-xs font-medium leading-none',
        toneClasses[tone],
        className
      )}
    >
      {priority}
    </Badge>
  )
}
