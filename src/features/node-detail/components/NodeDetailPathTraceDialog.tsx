import { DetailPanelState } from '@/shared/components/ui/detail-panel-state'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/shared/components/ui/dialog'
import { ArrowRight, Map as MapIcon } from '@/shared/components/ui/icons'
import { getBasename } from '@/shared/lib/utils'

import { nodeDetailCopy } from '../content/nodeDetailCopy'

interface NodeDetailPathTraceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isTracing: boolean
  traceTarget: string
  tracedPath: string[] | null
}

export function NodeDetailPathTraceDialog({
  open,
  onOpenChange,
  isTracing,
  traceTarget,
  tracedPath
}: NodeDetailPathTraceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <MapIcon className='h-5 w-5 text-muted-foreground' />
            Dependency Path to "{traceTarget}"
          </DialogTitle>
        </DialogHeader>
        <div className='mt-4'>
          {isTracing ? (
            <div className='flex items-center justify-center py-8'>
              <div className='text-sm text-muted-foreground'>
                Tracing path...
              </div>
            </div>
          ) : tracedPath && tracedPath.length > 0 ? (
            <div className='space-y-4'>
              <div className='mb-3 text-sm text-muted-foreground'>
                Shortest path found ({tracedPath.length} steps):
              </div>
              <div className='flex flex-col gap-2'>
                {tracedPath.map((file, index) => (
                  <div key={file} className='flex items-center gap-3'>
                    <div className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground'>
                      {index + 1}
                    </div>
                    <div className='min-w-0 flex-1'>
                      <div className='truncate rounded-md bg-muted/50 p-2 font-mono text-sm'>
                        {getBasename(file)}
                      </div>
                    </div>
                    {index < tracedPath.length - 1 ? (
                      <div className='shrink-0 text-muted-foreground'>
                        <ArrowRight className='h-3 w-3' />
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <DetailPanelState
              title={nodeDetailCopy.pathTrace.noPathTitle}
              description={nodeDetailCopy.pathTrace.noPathDescription}
              compact={true}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
