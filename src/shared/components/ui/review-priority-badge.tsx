import { Badge } from '@/shared/components/ui/badge'
import { cn, getReviewPriorityTone } from '@/shared/lib/utils'

import type { ReviewPriority } from '@/shared/lib/utils'

interface ReviewPriorityBadgeProps {
  priority: ReviewPriority
  className?: string
}

const toneClasses = {
  danger: 'border-red-500/35 bg-red-500/10 text-red-600',
  warning: 'border-amber-500/35 bg-amber-500/10 text-amber-600',
  info: 'border-sky-500/35 bg-sky-500/10 text-sky-600',
  success: 'border-emerald-500/35 bg-emerald-500/10 text-emerald-600',
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
        'shrink-0 rounded-full px-2 py-1 text-[11px] font-medium leading-none',
        toneClasses[tone],
        className
      )}
    >
      {priority}
    </Badge>
  )
}
