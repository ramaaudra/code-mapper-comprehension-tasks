import {
  BaseEdge,
  type Edge,
  EdgeLabelRenderer,
  type EdgeProps,
  getBezierPath
} from '@xyflow/react'

import type { ModuleEdgeData } from '../utils/moduleAggregation'

type AggregatedEdgeType = Edge<ModuleEdgeData>

export function AggregatedEdge(props: EdgeProps<AggregatedEdgeType>) {
  const {
    markerEnd,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data
  } = props

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition
  })

  const weight = data?.weight ?? 1
  const showLabel = Boolean(data?.showLabel)
  const strokeWidth = data?.isFocusEdge
    ? Math.min(1 + weight * 0.35, 4)
    : Math.min(1 + weight * 0.2, 2.75)
  const strokeOpacity = data?.isFocusEdge ? 0.55 : 0.28

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: 'hsl(var(--primary))',
          strokeWidth,
          strokeOpacity
        }}
      />
      {showLabel && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              background: 'hsl(var(--card))',
              padding: '2px 8px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: 500,
              border: '1px solid hsl(var(--border))',
              color: 'hsl(var(--foreground))'
            }}
            className='nodrag nopan font-mono shadow-sm'
          >
            {weight} deps
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}
