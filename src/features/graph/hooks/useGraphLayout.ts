import { useCallback, useState } from 'react'

import type { LayoutDirection } from '../types/graph'

export function useGraphLayout(initialDirection: LayoutDirection = 'LR') {
  const [layoutDirection, setLayoutDirection] =
    useState<LayoutDirection>(initialDirection)

  const toggleLayout = useCallback(() => {
    setLayoutDirection((prev) => (prev === 'TB' ? 'LR' : 'TB'))
  }, [])

  const setHorizontalLayout = useCallback(() => {
    setLayoutDirection('LR')
  }, [])

  const setVerticalLayout = useCallback(() => {
    setLayoutDirection('TB')
  }, [])

  return {
    layoutDirection,
    setLayoutDirection,
    toggleLayout,
    setHorizontalLayout,
    setVerticalLayout,
    isHorizontal: layoutDirection === 'LR',
    isVertical: layoutDirection === 'TB'
  }
}
