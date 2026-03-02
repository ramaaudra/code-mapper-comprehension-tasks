import { useState } from 'react'

import { Button } from '@/shared/components/ui/button'
import {
  ArrowDown as Download,
  RefreshCw as Loader2
} from '@/shared/components/ui/icons'

export function ReportDownloadButton() {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleDownload = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/report/generate', { method: 'POST' })
      if (!response.ok) {
        throw new Error('Failed to generate report')
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
      alert('Failed to generate report')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button
      onClick={handleDownload}
      disabled={isGenerating}
      variant="outline"
      size="sm"
    >
      {isGenerating ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Download className="h-4 w-4 mr-2" />
      )}
      {isGenerating ? 'Generating...' : 'Export Report'}
    </Button>
  )
}
