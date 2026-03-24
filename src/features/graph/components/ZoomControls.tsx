import { Button } from '@/shared/components/ui/button'
import {
  ArrowDown,
  ArrowRight,
  Map,
  Maximize,
  RotateCcw,
  ZoomIn,
  ZoomOut
} from '@/shared/components/ui/icons'

interface ZoomControlsProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
  onFitToScreen: () => void
  showMiniMap?: boolean
  onToggleMiniMap?: () => void
  layoutDirection?: 'LR' | 'TB'
  onLayoutDirectionChange?: (direction: 'LR' | 'TB') => void
}

const graphControlButtonClass =
  'border border-border bg-background/95 text-foreground shadow-sm backdrop-blur hover:bg-muted'

const graphToggleButtonClass = {
  active:
    'border-primary bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
  inactive:
    'border-border bg-background/95 text-muted-foreground shadow-sm backdrop-blur hover:bg-muted hover:text-foreground'
} as const

export function ZoomControls({
  onZoomIn,
  onZoomOut,
  onReset,
  onFitToScreen,
  showMiniMap = false,
  onToggleMiniMap,
  layoutDirection,
  onLayoutDirectionChange
}: ZoomControlsProps) {
  return (
    <div className='absolute bottom-4 right-4 z-20 flex flex-col gap-1'>
      {onLayoutDirectionChange && (
        <div className='mb-1 flex flex-col gap-1'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => onLayoutDirectionChange('LR')}
            aria-label='Switch graph layout to left-to-right'
            aria-pressed={layoutDirection === 'LR'}
            className={`transition-colors ${
              layoutDirection === 'LR'
                ? graphToggleButtonClass.active
                : graphToggleButtonClass.inactive
            }`}
            title='Left to Right layout'
          >
            <ArrowRight className='h-4 w-4' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => onLayoutDirectionChange('TB')}
            aria-label='Switch graph layout to top-to-bottom'
            aria-pressed={layoutDirection === 'TB'}
            className={`transition-colors ${
              layoutDirection === 'TB'
                ? graphToggleButtonClass.active
                : graphToggleButtonClass.inactive
            }`}
            title='Top to Bottom layout'
          >
            <ArrowDown className='h-4 w-4' />
          </Button>
        </div>
      )}

      <Button
        variant='secondary'
        size='icon'
        onClick={onZoomIn}
        aria-label='Zoom in graph'
        className={graphControlButtonClass}
        title='Zoom In (+)'
      >
        <ZoomIn className='h-4 w-4' />
      </Button>

      <Button
        variant='secondary'
        size='icon'
        onClick={onZoomOut}
        aria-label='Zoom out graph'
        className={graphControlButtonClass}
        title='Zoom Out (-)'
      >
        <ZoomOut className='h-4 w-4' />
      </Button>

      <Button
        variant='secondary'
        size='icon'
        onClick={onFitToScreen}
        aria-label='Fit graph to screen'
        className={graphControlButtonClass}
        title='Fit to Screen (F)'
      >
        <Maximize className='h-4 w-4' />
      </Button>

      <Button
        variant='secondary'
        size='icon'
        onClick={onReset}
        aria-label='Reset graph viewport'
        className={graphControlButtonClass}
        title='Reset View (0)'
      >
        <RotateCcw className='h-4 w-4' />
      </Button>

      {onToggleMiniMap && (
        <Button
          variant='ghost'
          size='icon'
          onClick={onToggleMiniMap}
          aria-label='Toggle graph minimap'
          aria-pressed={showMiniMap}
          className={`transition-colors ${
            showMiniMap
              ? graphToggleButtonClass.active
              : graphToggleButtonClass.inactive
          }`}
          title='Toggle MiniMap (M)'
        >
          <Map className='h-4 w-4' />
        </Button>
      )}
    </div>
  )
}
