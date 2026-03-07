import { DotsThreeVertical } from '@phosphor-icons/react'

import { useResizablePanel } from '@/shared/hooks/useResizablePanel'

interface ResizeGripProps {
  resizeHandleProps: ReturnType<typeof useResizablePanel>['resizeHandleProps']
}

export function ResizeGrip({ resizeHandleProps }: ResizeGripProps) {
  return (
    <div
      {...resizeHandleProps}
      className="absolute left-0 top-0 bottom-0 w-4 cursor-col-resize z-50 -ml-2 flex items-center justify-center group"
      title="Drag to resize"
    >
      <div className="flex flex-col items-center justify-center py-2 rounded bg-border/50 group-hover:bg-primary/20 transition-colors">
        <DotsThreeVertical
          className="h-4 w-4 text-muted-foreground group-hover:text-primary"
          weight="bold"
        />
      </div>
      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-primary/0 group-hover:bg-primary/50 active:bg-primary transition-colors" />
    </div>
  )
}
