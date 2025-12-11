import { useCallback, useState } from 'react'

export type ViewMode = 'overview' | 'file'

export function useViewMode(initialMode: ViewMode = 'overview') {
  const [viewMode, setViewMode] = useState<ViewMode>(initialMode)

  const switchToOverview = useCallback(() => {
    setViewMode('overview')
  }, [])

  const switchToFile = useCallback(() => {
    setViewMode('file')
  }, [])

  const toggleViewMode = useCallback(() => {
    setViewMode((prev) => (prev === 'overview' ? 'file' : 'overview'))
  }, [])

  return {
    viewMode,
    setViewMode,
    switchToOverview,
    switchToFile,
    toggleViewMode,
    isOverview: viewMode === 'overview',
    isFileView: viewMode === 'file'
  }
}
