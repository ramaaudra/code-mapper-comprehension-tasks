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

interface FolderMetricsRowProps {
  folder: FolderArchitectureMetrics
}

/**
 * Get color class for propagation-risk dot based on risk level.
 * Uses same scheme as HighRiskModules panel.
 */
function getRiskDotColor(score: number): string {
  const level = getRiskLevel(score)
  return getRiskColorClass(level)
}

export function FolderMetricsRow({ folder }: FolderMetricsRowProps) {
  const [expanded, setExpanded] = useState(false)
  const riskScore = calculateRiskScore(folder.ca, folder.instability)

  return (
    <>
      <tr
        className='cursor-pointer border-b border-border/50 transition-colors hover:bg-muted/30'
        onClick={() => setExpanded(!expanded)}
      >
        <td className='px-3 py-2 font-mono text-sm'>
          <span className='flex items-center gap-2'>
            <CaretRight
              size={12}
              className={`shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`}
            />
            <span className='truncate' title={folder.folderPath}>
              {truncateMiddle(folder.folderPath, 48)}
            </span>
            {folder.hasCycle && <CycleBadge />}
          </span>
        </td>
        <td className='px-3 py-2 text-center font-mono'>{folder.ca}</td>
        <td className='px-3 py-2 text-center font-mono'>{folder.ce}</td>
        <td className='px-3 py-2 text-center'>
          <InstabilityBadge value={folder.instability} />
        </td>
        <td className='px-3 py-2'>
          <div className='flex items-center justify-center gap-2'>
            <span className='font-mono text-sm'>{riskScore.toFixed(1)}</span>
            <span
              className={`h-2 w-2 rounded-full ${getRiskDotColor(riskScore)}`}
              title={`Propagation Risk: ${riskScore.toFixed(1)}`}
            />
          </div>
        </td>
      </tr>

      {/* Expandable coupling breakdown */}
      {expanded && (
        <tr className='bg-muted/20'>
          <td colSpan={5} className='px-6 py-3'>
            <CouplingBreakdown
              couplingTo={folder.couplingTo}
              couplingFrom={folder.couplingFrom}
            />
          </td>
        </tr>
      )}
    </>
  )
}
