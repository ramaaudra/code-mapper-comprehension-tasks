import { useMemo } from 'react'

export interface QualitySettings {
  level: 'high' | 'medium' | 'low'
  enableAnimations: boolean
  enableShadows: boolean
  maxLabelLength: number
  showAllBadges: boolean
}

export function useAdaptiveQuality(nodeCount: number): QualitySettings {
  return useMemo(() => {
    if (nodeCount < 50) {
      return {
        level: 'high',
        enableAnimations: true,
        enableShadows: true,
        maxLabelLength: 50,
        showAllBadges: true
      }
    }

    if (nodeCount < 150) {
      return {
        level: 'medium',
        enableAnimations: true,
        enableShadows: false,
        maxLabelLength: 30,
        showAllBadges: true
      }
    }

    return {
      level: 'low',
      enableAnimations: false,
      enableShadows: false,
      maxLabelLength: 20,
      showAllBadges: false
    }
  }, [nodeCount])
}
