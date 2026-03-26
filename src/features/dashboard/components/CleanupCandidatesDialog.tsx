import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/shared/components/ui/dialog'
import { Ghost } from '@/shared/components/ui/icons'
import { getBasename, getRelativePath } from '@/shared/lib/utils'

import { dashboardCopy } from '../content/dashboardCopy'

interface CleanupCandidatesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  files: string[]
  onNavigateToFile?: (file: string) => void
}

export function CleanupCandidatesDialog({
  open,
  onOpenChange,
  files,
  onNavigateToFile
}: CleanupCandidatesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Ghost className='h-5 w-5 text-muted-foreground' />
            {dashboardCopy.issuesPanel.cleanup.formalTitle} ({files.length})
          </DialogTitle>
        </DialogHeader>
        <div className='max-h-96 space-y-2 overflow-y-auto p-2'>
          {files.length === 0 ? (
            <div className='py-8 text-center text-muted-foreground'>
              <Ghost className='mx-auto h-12 w-12 opacity-50' />
              <p>{dashboardCopy.issuesPanel.cleanup.emptyTitle}</p>
              <p className='mt-1 text-xs'>
                {dashboardCopy.issuesPanel.cleanup.emptyDescription}
              </p>
            </div>
          ) : (
            files.map((file) => (
              <button
                key={file}
                type='button'
                onClick={() => {
                  onNavigateToFile?.(file)
                  onOpenChange(false)
                }}
                className='w-full rounded-lg bg-muted/20 px-3 py-3 text-left transition hover:bg-muted/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40'
                title={file}
              >
                <p className='font-mono text-sm font-medium text-foreground'>
                  {getBasename(file)}
                </p>
                <p className='mt-1 truncate font-mono text-xs text-muted-foreground'>
                  {getRelativePath(file)}
                </p>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
