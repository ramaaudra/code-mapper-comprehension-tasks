import { getRelativePath } from '@/shared/lib/utils'

import { cycleTriageCopy } from '../content/cycleTriageCopy'
import { CYCLE_GRAPH_CHEVRON_MARKER } from '../lib/cycle-graph-marker'
import {
  CYCLE_GRAPH_NODE_HEIGHT,
  CYCLE_GRAPH_NODE_WIDTH,
  buildCycleGraphModel,
  type CycleGraphEdgeModel
} from '../lib/cycle-graph-model'

import type { CycleTriageItem } from '../types/cycle-triage'

interface CycleGraphProps {
  item: CycleTriageItem
  showNearbyDependents: boolean
  onNavigateToFile?: (filePath: string) => void
}

function buildLoopSummary(item: CycleTriageItem) {
  if (item.files.length === 2) {
    const [firstFile = '', secondFile = ''] = item.files
    const firstBasename = firstFile.split('/').pop() ?? firstFile
    const secondBasename = secondFile.split('/').pop() ?? secondFile
    return `Mutual import between ${firstBasename} and ${secondBasename}.`
  }

  return `${item.uniqueFileCount} files in one dependency loop.`
}

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

export function CycleGraph({
  item,
  showNearbyDependents,
  onNavigateToFile
}: CycleGraphProps) {
  const model = buildCycleGraphModel({ item, showNearbyDependents })
  const recommendedEdge = item.suggestedInvestigation.candidateEdge
  const recommendedEdgeModel = recommendedEdge
    ? model.cycleEdges.find(
        (edge) =>
          edge.source === recommendedEdge.source &&
          edge.target === recommendedEdge.target
      )
    : null
  const cycleMarkerId = `cycle-marker-${item.id}`
  const nearbyMarkerId = `nearby-marker-${item.id}`
  const centerX = model.width / 2
  const centerY = model.height / 2
  const graphHint = cycleTriageCopy.detail.directionHint

  return (
    <div className='overflow-hidden rounded-xl border border-border/70 bg-muted/20'>
      <div className='border-b border-border/60 bg-background/60 px-4 py-3'>
        <p className='text-base font-medium leading-6 text-foreground'>
          {buildLoopSummary(item)}
        </p>
        <p className='mt-2 text-sm leading-6 text-muted-foreground'>
          {graphHint}
          {showNearbyDependents && model.hiddenNearbyCount > 0
            ? ` ${cycleTriageCopy.detail.nearbyLimitHint.replace('{visible}', String(model.visibleNearbyCount)).replace('{total}', String(item.nearbyFiles.length))}`
            : ''}
        </p>
      </div>
      <svg
        viewBox={`0 0 ${model.width} ${model.height}`}
        className={
          item.files.length === 2 ? 'h-[300px] w-full' : 'h-[360px] w-full'
        }
        role='img'
        aria-label='Cycle graph'
      >
        <defs>
          <marker
            id={cycleMarkerId}
            markerWidth={String(CYCLE_GRAPH_CHEVRON_MARKER.width)}
            markerHeight={String(CYCLE_GRAPH_CHEVRON_MARKER.height)}
            refX={String(CYCLE_GRAPH_CHEVRON_MARKER.refX)}
            refY={String(CYCLE_GRAPH_CHEVRON_MARKER.refY)}
            orient='auto'
          >
            <path
              d={CYCLE_GRAPH_CHEVRON_MARKER.path}
              fill='none'
              stroke='hsl(var(--destructive))'
              strokeWidth={String(CYCLE_GRAPH_CHEVRON_MARKER.strokeWidth)}
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </marker>
          <marker
            id={nearbyMarkerId}
            markerWidth={String(CYCLE_GRAPH_CHEVRON_MARKER.width)}
            markerHeight={String(CYCLE_GRAPH_CHEVRON_MARKER.height)}
            refX={String(CYCLE_GRAPH_CHEVRON_MARKER.refX)}
            refY={String(CYCLE_GRAPH_CHEVRON_MARKER.refY)}
            orient='auto'
          >
            <path
              d={CYCLE_GRAPH_CHEVRON_MARKER.path}
              fill='none'
              stroke='hsl(var(--muted-foreground))'
              strokeWidth={String(CYCLE_GRAPH_CHEVRON_MARKER.strokeWidth)}
              strokeLinecap='round'
              strokeLinejoin='round'
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
        {recommendedEdge ? (
          <text
            x={recommendedEdgeModel?.labelX ?? centerX}
            y={(recommendedEdgeModel?.labelY ?? centerY) - 18}
            textAnchor='middle'
            fontSize='11'
            fontWeight='600'
            fill='hsl(var(--destructive))'
            fontFamily='Recursive, system-ui, sans-serif'
          >
            Start here
          </text>
        ) : null}
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
                  fontSize='12'
                  fill='hsl(var(--muted-foreground))'
                  fontFamily='JetBrains Mono, monospace'
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
                x={node.x - CYCLE_GRAPH_NODE_WIDTH / 2}
                y={node.y - CYCLE_GRAPH_NODE_HEIGHT / 2}
                width={CYCLE_GRAPH_NODE_WIDTH}
                height={CYCLE_GRAPH_NODE_HEIGHT}
                rx={16}
                fill={fill}
                fillOpacity={0.96}
                stroke={stroke}
                strokeOpacity={strokeOpacity}
                style={{
                  cursor: onNavigateToFile ? 'pointer' : 'default'
                }}
                onClick={() => onNavigateToFile?.(node.filePath)}
              />
              <text
                x={node.x}
                y={node.y + 4}
                textAnchor='middle'
                fontSize='12'
                fontWeight={node.isCycleNode ? '600' : '500'}
                fill={textFill}
                fontFamily='JetBrains Mono, monospace'
                style={{
                  cursor: onNavigateToFile ? 'pointer' : 'default'
                }}
                onClick={() => onNavigateToFile?.(node.filePath)}
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
              <title>{getRelativePath(node.filePath)}</title>
            </g>
          )
        })}
      </svg>
      {showNearbyDependents &&
      (model.importsIntoLoop.length > 0 || model.importsFromLoop.length > 0) ? (
        <div className='border-t border-border/60 bg-background/40 px-4 py-4'>
          <details className='space-y-4'>
            <summary className='cursor-pointer text-xs font-medium text-foreground'>
              {cycleTriageCopy.detail.nearbyRoutes}
              {`: ${model.importsIntoLoop.length} in, ${model.importsFromLoop.length} out`}
            </summary>
            <div className='grid gap-4 lg:grid-cols-2'>
              {model.importsIntoLoop.length > 0 ? (
                <div className='space-y-2'>
                  <p className='text-xs font-medium text-foreground'>
                    {cycleTriageCopy.detail.importsIntoLoop}
                  </p>
                  <div className='space-y-1.5'>
                    {model.importsIntoLoop.map((route) => (
                      <div
                        key={`${route.source}->${route.target}`}
                        className='rounded-md border border-border/60 bg-muted/20 px-3 py-2 font-mono text-xs text-muted-foreground'
                      >
                        {route.label}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              {model.importsFromLoop.length > 0 ? (
                <div className='space-y-2'>
                  <p className='text-xs font-medium text-foreground'>
                    {cycleTriageCopy.detail.importsFromLoop}
                  </p>
                  <div className='space-y-1.5'>
                    {model.importsFromLoop.map((route) => (
                      <div
                        key={`${route.source}->${route.target}`}
                        className='rounded-md border border-border/60 bg-muted/20 px-3 py-2 font-mono text-xs text-muted-foreground'
                      >
                        {route.label}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </details>
        </div>
      ) : null}
    </div>
  )
}
