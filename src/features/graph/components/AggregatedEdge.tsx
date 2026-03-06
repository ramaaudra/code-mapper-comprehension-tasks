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
  const strokeWidth = Math.min(weight / 2, 8)

  return (
    <>
      <BaseEdge
        path={edgePath}
        style={{
          stroke: 'hsl(var(--primary))',
          strokeWidth,
          strokeOpacity: 0.6
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            background: 'hsl(var(--card))',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 500,
            border: '1px solid hsl(var(--border))',
            color: 'hsl(var(--foreground))'
          }}
          className="nodrag nopan font-mono"
        >
          {weight} deps
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
