import { useState } from 'react'

import { CaretRight } from '@/shared/components/ui/icons'
import {
  calculateRiskScore,
  getRiskColorClass,
  getRiskLevel
} from '@/shared/lib/utils/risk'

import type { FolderArchitectureMetrics } from '../types/architecture'
import { CouplingBreakdown } from './CouplingBreakdown'
import { CycleBadge } from './CycleBadge'
import { InstabilityBadge } from './InstabilityBadge'

interface FolderMetricsRowProps {
  folder: FolderArchitectureMetrics
}

/**
 * Get color class for change-risk dot based on risk level.
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
        className="border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="px-3 py-2 font-mono text-sm">
          <span className="flex items-center gap-2">
            <CaretRight
              size={12}
              className={`transition-transform shrink-0 ${expanded ? 'rotate-90' : ''}`}
            />
            <span className="truncate" title={folder.folderPath}>
              {folder.folderPath}
            </span>
            {folder.hasCycle && <CycleBadge />}
          </span>
        </td>
        <td className="px-3 py-2 font-mono text-center">{folder.ca}</td>
        <td className="px-3 py-2 font-mono text-center">{folder.ce}</td>
        <td className="px-3 py-2 text-center">
          <InstabilityBadge value={folder.instability} />
        </td>
        <td className="px-3 py-2">
          <div className="flex items-center justify-center gap-2">
            <span className="font-mono text-sm">{riskScore.toFixed(1)}</span>
            <span
              className={`w-2 h-2 rounded-full ${getRiskDotColor(riskScore)}`}
              title={`Change Risk: ${riskScore.toFixed(1)}`}
            />
          </div>
        </td>
      </tr>

      {/* Expandable coupling breakdown */}
      {expanded && (
        <tr className="bg-muted/20">
          <td colSpan={5} className="px-6 py-3">
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
