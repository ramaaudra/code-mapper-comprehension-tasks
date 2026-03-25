import { useState } from 'react'

import { CaretRight } from '@/shared/components/ui/icons'
import { truncateMiddle } from '@/shared/lib/utils'
import {
  calculateRiskScore,
  getRiskColorClass,
  getRiskLevel
} from '@/shared/lib/utils/risk'

import { CouplingBreakdown } from './CouplingBreakdown'
import { CycleBadge } from './CycleBadge'
import { InstabilityBadge } from './InstabilityBadge'

import type { FolderArchitectureMetrics } from '../types/architecture'
import type { ReviewThresholdCalibration } from '@/shared/lib/metric-thresholds'

interface FolderMetricsRowProps {
  folder: FolderArchitectureMetrics
  thresholdCalibration?: ReviewThresholdCalibration
}

function createDetailsId(folderPath: string): string {
  const normalizedPath = folderPath
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return `legacy-architecture-folder-details-${normalizedPath || 'module'}`
}

function getCalibratedRiskDotColor(
  score: number,
  thresholdCalibration?: ReviewThresholdCalibration
): string {
  return getRiskColorClass(getRiskLevel(score, thresholdCalibration))
}

export function FolderMetricsRow({
  folder,
  thresholdCalibration
}: FolderMetricsRowProps) {
  const [expanded, setExpanded] = useState(false)
  const riskScore = calculateRiskScore(folder.ca, folder.instability)
  const detailsId = createDetailsId(folder.folderPath)

  return (
    <>
      <tr className='border-b border-border/50 transition-colors hover:bg-muted/30'>
        <td className='px-3 py-2 font-mono text-sm'>
          <button
            type='button'
            onClick={() => setExpanded(!expanded)}
            aria-label={`Toggle coupling breakdown for ${folder.folderPath}`}
            aria-expanded={expanded}
            aria-controls={detailsId}
            className='flex w-full items-center gap-2 rounded-md text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
          >
            <CaretRight
              size={12}
              className={`shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`}
            />
            <span className='truncate' title={folder.folderPath}>
              {truncateMiddle(folder.folderPath, 48)}
            </span>
            {folder.hasCycle && <CycleBadge />}
          </button>
        </td>
        <td className='px-3 py-2 text-center font-data'>{folder.ca}</td>
        <td className='px-3 py-2 text-center font-data'>{folder.ce}</td>
        <td className='px-3 py-2 text-center'>
          <InstabilityBadge value={folder.instability} />
        </td>
        <td className='px-3 py-2'>
          <div className='flex items-center justify-center gap-2'>
            <span className='font-data text-sm'>{riskScore.toFixed(1)}</span>
            <span
              className={`h-2 w-2 rounded-full ${getCalibratedRiskDotColor(
                riskScore,
                thresholdCalibration
              )}`}
              title={`Propagation Risk: ${riskScore.toFixed(1)}`}
            />
          </div>
        </td>
      </tr>

      {/* Expandable coupling breakdown */}
      {expanded && (
        <tr className='bg-muted/20'>
          <td colSpan={5} className='px-6 py-3'>
            <div id={detailsId}>
              <CouplingBreakdown
                couplingTo={folder.couplingTo}
                couplingFrom={folder.couplingFrom}
              />
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
