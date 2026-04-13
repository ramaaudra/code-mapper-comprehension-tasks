import { DetailPanelState } from '@/shared/components/ui/detail-panel-state'
import { getRelativePath } from '@/shared/lib/utils'

import { nodeDetailCopy } from '../content/nodeDetailCopy'
import { SourceCodeViewer } from './SourceCodeViewer'

import type { NodeDetailSourceState } from '../lib/panel-state'
import type { FileContentResponse } from '@/features/architecture/types/architecture'

interface NodeDetailSourceSectionProps {
  sourceState: NodeDetailSourceState
  contentError: Error | null
  fileContent: FileContentResponse | undefined
  nodePath: string
  displayBasename: string
}

const MAX_LINES = 1000

function detectLanguage(filename: string): string {
  if (filename.endsWith('.tsx')) {
    return 'tsx'
  }
  if (filename.endsWith('.ts')) {
    return 'typescript'
  }
  if (filename.endsWith('.jsx')) {
    return 'jsx'
  }
  if (filename.endsWith('.js')) {
    return 'javascript'
  }
  if (filename.endsWith('.json')) {
    return 'json'
  }
  if (filename.endsWith('.css')) {
    return 'css'
  }
  return 'text'
}

function formatFileSize(size: number): string {
  if (size < 1024) {
    return `${size} B`
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`
  }
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

export function NodeDetailSourceSection({
  sourceState,
  contentError,
  fileContent,
  nodePath,
  displayBasename
}: NodeDetailSourceSectionProps) {
  if (sourceState === 'report') {
    return (
      <DetailPanelState
        title={nodeDetailCopy.source.reportModeTitle}
        description={nodeDetailCopy.source.reportModeDescription}
      />
    )
  }

  if (sourceState === 'loading') {
    return (
      <DetailPanelState
        title={nodeDetailCopy.source.loadingTitle}
        description={nodeDetailCopy.source.loadingDescription}
      />
    )
  }

  if (sourceState === 'error') {
    return (
      <DetailPanelState
        title={nodeDetailCopy.source.errorTitle}
        description={contentError?.message || 'An unknown error occurred.'}
        tone='danger'
      />
    )
  }

  if (sourceState === 'empty' || !fileContent) {
    return (
      <DetailPanelState
        title={nodeDetailCopy.source.noContentTitle}
        description={nodeDetailCopy.source.noContentDescription}
      />
    )
  }

  return (
    <div className='flex h-full flex-col'>
      <div className='flex items-center justify-between border-b bg-muted/50 px-4 py-2 text-xs text-muted-foreground'>
        <div className='flex items-center gap-2'>
          <span
            className='max-w-[200px] truncate font-mono'
            title={fileContent.path}
          >
            {getRelativePath(fileContent.path)}
          </span>
        </div>
        <div className='flex items-center gap-3'>
          <span>{formatFileSize(fileContent.size)}</span>
          <span>{fileContent.lines.toLocaleString()} lines</span>
        </div>
      </div>
      <div className='min-h-0 flex-1'>
        <SourceCodeViewer
          code={fileContent.content}
          language={detectLanguage(displayBasename || nodePath)}
          showLineNumbers={true}
          maxLines={MAX_LINES}
          className='h-full rounded-none border-0'
        />
      </div>
    </div>
  )
}
