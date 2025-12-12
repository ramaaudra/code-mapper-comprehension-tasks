// Edge threshold constants for performance optimization
export const EDGE_THRESHOLDS = {
  // Edges > 20: bundle by directory (future enhancement)
  BUNDLE: 20
  // Note: SIMPLIFIED threshold removed - all edges rendered
} as const

// Quality thresholds
export const QUALITY_THRESHOLDS = {
  HIGH: 50, // < 50 nodes: full quality
  MEDIUM: 150, // 50-150 nodes: reduced quality
  LOW: 500 // > 150 nodes: minimal quality
} as const
