import { WarningCircle } from '@/shared/components/ui/icons'
import { SimpleTooltip } from '@/shared/components/ui/simple-tooltip'

export function CycleBadge() {
  return (
    <SimpleTooltip content='Involved in circular dependency' side='top'>
      <span className='inline-flex cursor-help items-center gap-1 rounded bg-red-500/20 px-1.5 py-0.5 text-xs text-red-400'>
        <WarningCircle size={12} weight='fill' />
      </span>
    </SimpleTooltip>
  )
}
