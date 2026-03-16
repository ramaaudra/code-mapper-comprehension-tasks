import { getRelativePath } from '@/shared/lib/utils'

import { cycleTriageCopy } from '../content/cycleTriageCopy'
import {
  buildCycleGraphModel,
  type CycleGraphEdgeModel
} from '../lib/cycle-graph-model'

import type { CycleTriageItem } from '../types/cycle-triage'

interface CycleGraphProps {
  item: CycleTriageItem
  showNearbyDependents: boolean
}

const NODE_WIDTH = 140
const NODE_HEIGHT = 40

function renderEdge(
  edge: CycleGraphEdgeModel,
  markerId: string,
  className: 'cycle' | 'nearby',
  isRecommended = false
) {
  const stroke =
    className === 'cycle'
      ? 'hsl(var(--destructive))'
      : 'hsl(var(--muted-foreground))'
  const strokeOpacity =
    className === 'cycle' ? (isRecommended ? 1 : 0.82) : 0.28
  const strokeWidth = className === 'cycle' ? (isRecommended ? 3.25 : 2.5) : 1.5

  return (
    <g key={`${edge.source}->${edge.target}`}>
      <path
        d={edge.path}
        stroke={stroke}
        strokeOpacity={strokeOpacity}
        strokeWidth={strokeWidth}
        fill='none'
        markerEnd={`url(#${markerId})`}
      />
    </g>
  )
}

export function CycleGraph({ item, showNearbyDependents }: CycleGraphProps) {
  const model = buildCycleGraphModel({ item, showNearbyDependents })
  const recommendedEdge = item.suggestedInvestigation.candidateEdge
  const cycleMarkerId = `cycle-marker-${item.id}`
  const nearbyMarkerId = `nearby-marker-${item.id}`
  const centerX = model.width / 2
  const centerY = model.height / 2

  return (
    <div className='overflow-hidden rounded-xl border border-border/70 bg-muted/20'>
      <div className='border-b border-border/60 bg-background/60 px-4 py-3'>
        <div className='flex flex-wrap items-center gap-2 text-xs'>
          <span className='rounded-full border border-border/70 bg-background px-2 py-0.5 font-medium text-foreground'>
            {cycleTriageCopy.detail.routeLabel}
          </span>
          <code className='whitespace-normal break-all rounded-md border border-border/70 bg-muted/40 px-2.5 py-1 text-[11px] text-foreground'>
            {item.routeLabel}
          </code>
        </div>
        <p className='mt-2 text-xs text-muted-foreground'>
          {cycleTriageCopy.detail.directionHint}
          {showNearbyDependents && model.hiddenNearbyCount > 0
            ? ` ${cycleTriageCopy.detail.nearbyLimitHint.replace('{visible}', String(model.visibleNearbyCount)).replace('{total}', String(item.nearbyFiles.length))}`
            : ''}
        </p>
        <div className='mt-2 flex flex-wrap items-center gap-2 text-[11px]'>
          <span className='rounded-full border border-border/70 bg-background px-2 py-0.5 font-medium text-foreground'>
            {cycleTriageCopy.detail.cycleRoutesShown}
          </span>
          {model.cycleRouteLabels.map((route) => (
            <code
              key={`${route.source}->${route.target}`}
              className='rounded-md border border-border/70 bg-muted/40 px-2.5 py-1 text-foreground'
            >
              {route.label}
            </code>
          ))}
        </div>
        {model.recommendedRouteLabel ? (
          <div className='mt-2 flex flex-wrap items-center gap-2 text-[11px]'>
            <span className='rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 font-medium text-red-600 dark:text-red-300'>
              {cycleTriageCopy.detail.inspectFirst}
            </span>
            <code className='rounded-md border border-red-500/25 bg-red-500/5 px-2.5 py-1 text-foreground'>
              {model.recommendedRouteLabel}
            </code>
          </div>
        ) : null}
        {showNearbyDependents && model.nearbyRouteLabels.length > 0 ? (
          <div className='mt-2 flex flex-wrap items-center gap-2 text-[11px]'>
            <span className='rounded-full border border-border/70 bg-background px-2 py-0.5 font-medium text-foreground'>
              {cycleTriageCopy.detail.nearbyRoutesShown}
            </span>
            {model.nearbyRouteLabels.map((route) => (
              <code
                key={`${route.source}->${route.target}`}
                className='rounded-md border border-border/70 bg-muted/30 px-2.5 py-1 text-muted-foreground'
              >
                {route.label}
              </code>
            ))}
          </div>
        ) : null}
      </div>
      <svg
        viewBox={`0 0 ${model.width} ${model.height}`}
        className='h-[360px] w-full'
        role='img'
        aria-label='Cycle graph'
      >
        <defs>
          <marker
            id={cycleMarkerId}
            markerWidth='18'
            markerHeight='14'
            refX='14'
            refY='7'
            orient='auto'
          >
            <path
              d='M0,1 L18,7 L0,13 L4.5,7 Z'
              fill='hsl(var(--destructive))'
            />
          </marker>
          <marker
            id={nearbyMarkerId}
            markerWidth='18'
            markerHeight='14'
            refX='14'
            refY='7'
            orient='auto'
          >
            <path
              d='M0,1 L18,7 L0,13 L4.5,7 Z'
              fill='hsl(var(--muted-foreground))'
            />
          </marker>
        </defs>

        {item.files.length > 2 ? (
          <circle
            cx={centerX}
            cy={centerY}
            r='112'
            fill='none'
            stroke='hsl(var(--destructive))'
            strokeOpacity='0.1'
            strokeDasharray='6 8'
          />
        ) : null}
        {showNearbyDependents && model.nearbyEdges.length > 0 ? (
          <circle
            cx={centerX}
            cy={centerY}
            r='188'
            fill='none'
            stroke='hsl(var(--muted-foreground))'
            strokeOpacity='0.12'
            strokeDasharray='4 8'
          />
        ) : null}

        {model.nearbyEdges.map((edge) =>
          renderEdge(edge, nearbyMarkerId, 'nearby')
        )}
        {model.cycleEdges.map((edge) =>
          renderEdge(
            edge,
            cycleMarkerId,
            'cycle',
            Boolean(
              recommendedEdge &&
              recommendedEdge.source === edge.source &&
              recommendedEdge.target === edge.target
            )
          )
        )}
        {item.files.length === 2
          ? model.cycleEdges.map((edge) => {
              const route = model.cycleRouteLabels.find(
                (currentRoute) =>
                  currentRoute.source === edge.source &&
                  currentRoute.target === edge.target
              )

              if (!route) {
                return null
              }

              return (
                <text
                  key={`route-${route.source}->${route.target}`}
                  x={edge.labelX}
                  y={edge.labelY}
                  textAnchor='middle'
                  fontSize='11'
                  fill='hsl(var(--muted-foreground))'
                >
                  {route.label}
                </text>
              )
            })
          : null}

        {model.nodes.map((node) => {
          const fill = node.isCycleNode
            ? 'hsl(var(--background))'
            : 'hsl(var(--muted))'
          const stroke = node.isCycleNode
            ? 'hsl(var(--destructive))'
            : 'hsl(var(--border))'
          const strokeOpacity = node.isCycleNode ? 0.35 : 0.6
          const textFill = node.isCycleNode
            ? 'hsl(var(--foreground))'
            : 'hsl(var(--muted-foreground))'

          return (
            <g key={node.filePath}>
              <rect
                x={node.x - NODE_WIDTH / 2}
                y={node.y - NODE_HEIGHT / 2}
                width={NODE_WIDTH}
                height={NODE_HEIGHT}
                rx={16}
                fill={fill}
                fillOpacity={0.96}
                stroke={stroke}
                strokeOpacity={strokeOpacity}
              />
              <text
                x={node.x}
                y={node.y + 4}
                textAnchor='middle'
                fontSize='12'
                fontWeight={node.isCycleNode ? '600' : '500'}
                fill={textFill}
              >
                {(() => {
                  const relativePath = getRelativePath(node.filePath)
                  const segments = relativePath.split('/')
                  const basename = segments[segments.length - 1] || relativePath

                  if (basename.length <= 18) {
                    return basename
                  }

                  return `${basename.slice(0, 9)}…${basename.slice(-7)}`
                })()}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
