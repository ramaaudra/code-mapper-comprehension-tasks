import { useCallback, useState } from 'react'

export type ViewMode = 'overview' | 'architecture'

export function useViewMode(initialMode: ViewMode = 'overview') {
  const [viewMode, setViewMode] = useState<ViewMode>(initialMode)

  const switchToOverview = useCallback(() => {
    setViewMode('overview')
  }, [])

  const switchToArchitecture = useCallback(() => {
    setViewMode('architecture')
  }, [])

  const toggleViewMode = useCallback(() => {
    setViewMode((prev) => (prev === 'overview' ? 'architecture' : 'overview'))
  }, [])

  return {
    viewMode,
    setViewMode,
    switchToOverview,
    switchToArchitecture,
    toggleViewMode,
    isOverview: viewMode === 'overview',
    isArchitecture: viewMode === 'architecture'
  }
}
