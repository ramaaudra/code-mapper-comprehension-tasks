import { useMemo } from 'react'

import { QUALITY_THRESHOLDS } from '../constants'

export interface QualitySettings {
  level: 'high' | 'medium' | 'low'
  enableAnimations: boolean
  enableShadows: boolean
  maxLabelLength: number
  showAllBadges: boolean
  showEdgeLabels: boolean
  autoShowMiniMap: boolean
}

export function useAdaptiveQuality(nodeCount: number): QualitySettings {
  return useMemo(() => {
    if (nodeCount < QUALITY_THRESHOLDS.HIGH) {
      return {
        level: 'high',
        enableAnimations: false, // Disable by default for performance
        enableShadows: false, // Disable shadows
        maxLabelLength: 50,
        showAllBadges: true,
        showEdgeLabels: true,
        autoShowMiniMap: false
      }
    }

    if (nodeCount < QUALITY_THRESHOLDS.MEDIUM) {
      return {
        level: 'medium',
        enableAnimations: false,
        enableShadows: false,
        maxLabelLength: 30,
        showAllBadges: true,
        showEdgeLabels: true,
        autoShowMiniMap: false
      }
    }

    return {
      level: 'low',
      enableAnimations: false,
      enableShadows: false,
      maxLabelLength: 20,
      showAllBadges: false,
      showEdgeLabels: false, // Hide edge labels for large graphs
      autoShowMiniMap: false
    }
  }, [nodeCount])
}
