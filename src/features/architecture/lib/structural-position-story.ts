import {
  formatReviewSignalBandRange,
  getStructuralPositionBandLabel,
  resolveStructuralPosition
} from '../../../shared/lib/metric-thresholds'

import type { StructuralPosition } from '../../../shared/lib/metric-thresholds'

interface StructuralPositionStoryContent {
  summaryLabel: string
  description: string
}

const STRUCTURAL_POSITION_STORY: Record<
  StructuralPosition,
  StructuralPositionStoryContent
> = {
  'Foundation-like': {
    summaryLabel: 'More foundational overall',
    description:
      'More foundational than outward-facing. Shared changes may need careful review.'
  },
  Balanced: {
    summaryLabel: 'Balanced overall',
    description:
      'A mix of shared and outward-facing modules. Review needs are more balanced.'
  },
  'Outward-Dependent': {
    summaryLabel: 'More outward-facing overall',
    description:
      'More outward-facing than foundational. This is common in UI-heavy areas and does not automatically mean poor design.'
  }
}

export interface StructuralPositionStory {
  band: StructuralPosition
  bandLabel: string
  summaryLabel: string
  description: string
  rangeLabel: string
}

export function describeStructuralPositionStory(
  instability: number
): StructuralPositionStory {
  const band = resolveStructuralPosition(instability)
  const content = STRUCTURAL_POSITION_STORY[band]

  return {
    band,
    bandLabel: getStructuralPositionBandLabel(band),
    summaryLabel: content.summaryLabel,
    description: content.description,
    rangeLabel: formatReviewSignalBandRange('structuralPosition', band)
  }
}
