import { DotsThreeVertical } from '@phosphor-icons/react'

import type { useResizablePanel } from '@/shared/hooks/useResizablePanel'

interface ResizeGripProps {
  resizeHandleProps: ReturnType<typeof useResizablePanel>['resizeHandleProps']
}

export function ResizeGrip({ resizeHandleProps }: ResizeGripProps) {
  return (
    <div
      {...resizeHandleProps}
      className='group absolute bottom-0 left-0 top-0 z-50 -ml-2 flex w-4 cursor-col-resize items-center justify-center'
      title='Drag to resize'
    >
      <div className='flex flex-col items-center justify-center rounded bg-border/50 py-2 transition-colors group-hover:bg-primary/20'>
        <DotsThreeVertical
          className='h-4 w-4 text-muted-foreground group-hover:text-primary'
          weight='bold'
        />
      </div>
      <div className='absolute bottom-0 left-1/2 top-0 w-0.5 -translate-x-1/2 bg-primary/0 transition-colors active:bg-primary group-hover:bg-primary/50' />
    </div>
  )
}
