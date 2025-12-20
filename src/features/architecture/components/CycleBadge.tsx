import { WarningCircle } from '@/shared/components/ui/icons'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/shared/components/ui/tooltip'

export function CycleBadge() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 text-xs cursor-help">
            <WarningCircle size={12} weight="fill" />
          </span>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-xs">Terlibat dalam circular dependency</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
