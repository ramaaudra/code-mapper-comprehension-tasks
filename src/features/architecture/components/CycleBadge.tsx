import { WarningCircle } from '@/shared/components/ui/icons'
import { SimpleTooltip } from '@/shared/components/ui/simple-tooltip'

export function CycleBadge() {
  return (
    <SimpleTooltip content="Involved in circular dependency" side="top">
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 text-xs cursor-help">
        <WarningCircle size={12} weight="fill" />
      </span>
    </SimpleTooltip>
  )
}
