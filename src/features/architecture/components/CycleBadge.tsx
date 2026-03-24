import { WarningCircle } from '@/shared/components/ui/icons'
import { SimpleTooltip } from '@/shared/components/ui/simple-tooltip'

export function CycleBadge() {
  return (
    <SimpleTooltip content='Involved in circular dependency' side='top' asChild>
      <button
        type='button'
        aria-label='Module is involved in a circular dependency'
        className='inline-flex cursor-help items-center gap-1 rounded border border-status-critical-border bg-status-critical-surface px-1.5 py-0.5 text-xs text-status-critical-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
      >
        <WarningCircle size={12} weight='fill' />
      </button>
    </SimpleTooltip>
  )
}
