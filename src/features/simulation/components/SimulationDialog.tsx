import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/shared/components/ui/dialog'
import { FileWarning, FileX } from '@/shared/components/ui/icons'
import { getBasename } from '@/shared/lib/utils/path'

import type { SimulationResult } from '../hooks/useSimulation'

interface SimulationDialogProps {
  result: SimulationResult | null
  onClose: () => void
}

export function SimulationDialog({ result, onClose }: SimulationDialogProps) {
  return (
    <Dialog open={!!result} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Hasil Simulasi Penghapusan</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-6">
          {/* Broken Files Section */}
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              <FileWarning className="h-5 w-5 text-red-500" />
              File yang Akan Rusak ({result?.brokenFiles.length || 0})
            </h3>
            <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
              {result?.brokenFiles.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  Tidak ada file yang akan rusak
                </p>
              ) : (
                result?.brokenFiles.map((file) => (
                  <div
                    key={file}
                    className="text-sm p-2 bg-muted rounded font-mono"
                  >
                    {getBasename(file)}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* New Orphans Section */}
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              <FileX className="h-5 w-5 text-yellow-500" />
              Orphan Baru ({result?.newOrphans.length || 0})
            </h3>
            <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
              {result?.newOrphans.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  Tidak ada file yang akan menjadi orphan
                </p>
              ) : (
                result?.newOrphans.map((file) => (
                  <div
                    key={file}
                    className="text-sm p-2 bg-muted rounded font-mono"
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
