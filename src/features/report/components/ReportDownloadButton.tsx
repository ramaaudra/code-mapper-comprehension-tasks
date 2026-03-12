import { useState } from 'react'

import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/shared/components/ui/dialog'
import {
  ArrowDown as Download,
  RefreshCw as Loader2,
  WarningCircle
} from '@/shared/components/ui/icons'

import { reportCopy } from '../content/reportCopy'

import type { ApiErrorResponse } from '@/shared/lib/api/types'

export function ReportDownloadButton() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const parseErrorMessage = async (response: Response): Promise<string> => {
    const contentType = response.headers.get('content-type') || ''

    if (contentType.includes('application/json')) {
      const data = (await response.json()) as ApiErrorResponse
      return data.error || 'Failed to generate report'
    }

    const text = await response.text()
    return text || 'Failed to generate report'
  }

  const handleDownload = async () => {
    setIsGenerating(true)
    setErrorMessage(null)

    try {
      const response = await fetch('/api/report/generate', { method: 'POST' })
      if (!response.ok) {
        throw new Error(await parseErrorMessage(response))
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `code-mapper-report-${new Date().toISOString().split('T')[0]}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to download:', error)
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to generate report'
      )
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <>
      <Button
        onClick={handleDownload}
        disabled={isGenerating}
        variant='secondary'
        size='sm'
      >
        {isGenerating ? (
          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
        ) : (
          <Download className='mr-2 h-4 w-4' />
        )}
        {isGenerating
          ? reportCopy.exportButton.generating
          : reportCopy.exportButton.default}
      </Button>

      <Dialog open={!!errorMessage} onOpenChange={() => setErrorMessage(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <WarningCircle className='h-5 w-5 text-amber-500' />
              {reportCopy.exportButton.errorTitle}
            </DialogTitle>
            <DialogDescription>
              {errorMessage || reportCopy.exportButton.errorDescription}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setErrorMessage(null)}>
              {reportCopy.exportButton.close}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
