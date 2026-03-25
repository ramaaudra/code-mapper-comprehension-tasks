import { WarningCircle } from '@/shared/components/ui/icons'
import { SimpleTooltip } from '@/shared/components/ui/simple-tooltip'

export function CycleBadge() {
  return (
    <SimpleTooltip content='Involved in circular dependency' side='top' asChild>
      <span
        aria-hidden='true'
        className='inline-flex cursor-help items-center gap-1 rounded border border-status-critical-border bg-status-critical-surface px-1.5 py-0.5 text-xs text-status-critical-foreground'
      >
        <WarningCircle size={12} weight='fill' />
      </span>
    </SimpleTooltip>
  )
}
