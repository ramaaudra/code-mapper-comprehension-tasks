import { getBasename } from '@/shared/lib/utils'

interface StatsBarProps {
  fileCount: number
  selectedFileId: string | null
  selectedNodeId: string | null
  analysisLoadedAt: string | null
}

export function StatsBar({
  fileCount,
  selectedFileId,
  selectedNodeId,
  analysisLoadedAt
}: StatsBarProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-6">
          <span>
            <strong className="text-slate-900 dark:text-slate-100">
              {fileCount}
            </strong>{' '}
            files
          </span>
          {selectedNodeId && (
            <span className="text-green-600 dark:text-green-400">
              <strong>Selected:</strong>{' '}
              {getBasename(selectedNodeId || selectedFileId || '')}
            </span>
          )}
        </div>
        <div className="text-xs">
          {analysisLoadedAt && (
            <>
              Updated:{' '}
              <strong>{new Date(analysisLoadedAt).toLocaleTimeString()}</strong>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
