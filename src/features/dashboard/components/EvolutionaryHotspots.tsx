import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/shared/components/ui/card'
import { HotspotStatusLabel } from '@/shared/components/ui/hotspot-status-label'
import { AlertTriangle, RefreshCw } from '@/shared/components/ui/icons'
import { InfoTooltip } from '@/shared/components/ui/info-tooltip'
import { cn, formatRelativeChurn, getHotspotTone } from '@/shared/lib/utils'
import {
  getRiskBgOpacityClass,
  getRiskBorderClass,
  getRiskLevel,
  getRiskTextClass
} from '@/shared/lib/utils/risk'

import type { EvolutionaryHotspotItem } from '@/shared/lib/utils/evolution'

interface EvolutionaryHotspotsProps {
  hotspots: EvolutionaryHotspotItem[]
  isAvailable: boolean
  unavailableReason?: string | null
  onViewModule?: (modulePath: string) => void
}

function getToneClasses(hotspot: EvolutionaryHotspotItem): string {
  const tone = getHotspotTone(hotspot.hotspotStatus)

  if (tone === 'danger') {
    return 'border-red-500/40 bg-red-500/5'
  }
  if (tone === 'warning') {
    return 'border-orange-500/40 bg-orange-500/5'
  }
  return 'border-border bg-muted/20'
}

export function EvolutionaryHotspots({
  hotspots,
  isAvailable,
  unavailableReason,
  onViewModule
}: EvolutionaryHotspotsProps) {
  if (!isAvailable) {
    return (
      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='flex items-center gap-2 text-base font-medium'>
            <RefreshCw className='h-4 w-4' />
            Evolutionary Hotspots
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='py-4 text-center text-muted-foreground'>
            <RefreshCw className='mx-auto mb-2 h-8 w-8 opacity-50' />
            <p className='text-sm'>Evolutionary metrics unavailable</p>
            <p className='mt-1 text-xs'>
              {unavailableReason ??
                'Open a Git-backed project with usable history to inspect change pressure and hotspot ranking.'}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const items = hotspots.slice(0, 5)

  return (
    <Card>
      <CardHeader className='pb-2'>
        <div className='flex items-center justify-between gap-2'>
          <CardTitle className='flex items-center gap-2 text-base font-medium'>
            <RefreshCw className='h-4 w-4 text-orange-500' />
            Evolutionary Hotspots
          </CardTitle>
          <InfoTooltip title='What is an Evolutionary Hotspot?' side='top'>
            <div className='space-y-2 text-xs text-popover-foreground'>
              <p>
                Evolutionary Hotspot Score combines recent relative churn with
                structural propagation risk to prioritize modules that deserve
                more careful review.
              </p>
              <p className='border-t border-border pt-2 text-popover-foreground/80'>
                This is a product heuristic for prioritization, not a universal
                scientific defect threshold.
              </p>
            </div>
          </InfoTooltip>
        </div>
      </CardHeader>
      <CardContent className='space-y-3'>
        {items.length === 0 ? (
          <div className='py-4 text-center text-muted-foreground'>
            <p className='text-sm'>No recent change pressure detected</p>
            <p className='mt-1 text-xs'>
              No modules changed in the last 30 days.
            </p>
          </div>
        ) : (
          items.map((hotspot) => {
            const riskLevel = getRiskLevel(hotspot.propagationRisk)

            return (
              <button
                type='button'
                key={hotspot.modulePath}
                onClick={() => onViewModule?.(hotspot.modulePath)}
                className={cn(
                  'w-full rounded-lg border p-4 text-left transition-all',
                  'hover:ring-2 hover:ring-[hsl(var(--primary))]/40',
                  getToneClasses(hotspot)
                )}
              >
                <div className='mb-2 flex items-start justify-between gap-2'>
                  <span
                    className='truncate font-mono text-sm'
                    title={hotspot.modulePath}
                  >
                    {hotspot.modulePath}
                  </span>
                  <span
                    className={cn(
                      'shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide',
                      getRiskBorderClass(riskLevel),
                      getRiskBgOpacityClass(riskLevel, 5),
                      getRiskTextClass(riskLevel)
                    )}
                  >
                    <HotspotStatusLabel status={hotspot.hotspotStatus} />
                  </span>
                </div>
                <div className='grid gap-2 text-xs text-muted-foreground sm:grid-cols-2'>
                  <span>
                    Relative Churn (30d):{' '}
                    <strong className='text-foreground'>
                      {formatRelativeChurn(hotspot.relativeChurn30d)}
                    </strong>
                  </span>
                  <span>
                    Propagation Risk:{' '}
                    <strong className='text-foreground'>
                      {hotspot.propagationRisk.toFixed(1)}
                    </strong>
                  </span>
                  <span>
                    Hotspot Score:{' '}
                    <strong className='text-foreground'>
                      {hotspot.hotspotScore.toFixed(2)}
                    </strong>
                  </span>
                  <span>
                    Changed Files in 30d:{' '}
                    <strong className='text-foreground'>
                      {hotspot.changedFileCount30d}
                    </strong>
                  </span>
                </div>
              </button>
            )
          })
        )}

        {hotspots.length > 5 ? (
          <div className='flex items-center gap-2 text-xs text-muted-foreground'>
            <AlertTriangle className='h-3.5 w-3.5' />
            Showing the top 5 modules by hotspot score.
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
