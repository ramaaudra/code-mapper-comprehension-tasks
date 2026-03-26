import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/shared/components/ui/dialog'
import { FileWarning, FileX } from '@/shared/components/ui/icons'
import { reachabilityCopy } from '@/shared/content/reachabilityCopy'
import { getBasename } from '@/shared/lib/utils/path'

import type { SimulationResult } from '../hooks/useSimulation'

interface SimulationDialogProps {
  result: SimulationResult | null
  onClose: () => void
}

export function SimulationDialog({ result, onClose }: SimulationDialogProps) {
  return (
    <Dialog open={!!result} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Deletion Simulation Result</DialogTitle>
        </DialogHeader>
        <div className='mt-4 space-y-6'>
          {/* Broken Files Section */}
          <div>
            <h3 className='flex items-center gap-2 font-semibold'>
              <FileWarning className='h-5 w-5 text-red-500' />
              Files That Will Break ({result?.brokenFiles.length || 0})
            </h3>
            <div className='mt-2 max-h-40 space-y-1 overflow-y-auto'>
              {result?.brokenFiles.length === 0 ? (
                <p className='text-sm italic text-muted-foreground'>
                  No directly affected files detected
                </p>
              ) : (
                result?.brokenFiles.map((file) => (
                  <div
                    key={file}
                    className='rounded bg-muted p-2 font-mono text-sm'
                  >
                    {getBasename(file)}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Reachability follow-up section */}
          <div>
            <h3 className='flex items-center gap-2 font-semibold'>
              <FileX className='h-5 w-5 text-yellow-500' />
              {reachabilityCopy.simulationSectionTitle} (
              {result?.newOrphans.length || 0})
            </h3>
            <div className='mt-2 max-h-40 space-y-1 overflow-y-auto'>
              {result?.newOrphans.length === 0 ? (
                <p className='text-sm italic text-muted-foreground'>
                  {reachabilityCopy.simulationEmpty}
                </p>
              ) : (
                result?.newOrphans.map((file) => (
                  <div
                    key={file}
                    className='rounded bg-muted p-2 font-mono text-sm'
                  >
                    {getBasename(file)}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
