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
    <div className="absolute bottom-4 right-4 flex flex-col gap-1 z-20">
      {onLayoutDirectionChange && (
        <div className="flex flex-col gap-1 mb-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onLayoutDirectionChange('LR')}
            className={`h-8 w-8 border shadow-sm transition-colors ${
              layoutDirection === 'LR'
                ? 'bg-slate-600 hover:bg-slate-700 text-white border-slate-600'
                : 'bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600'
            }`}
            title="Left to Right layout"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onLayoutDirectionChange('TB')}
            className={`h-8 w-8 border shadow-sm transition-colors ${
              layoutDirection === 'TB'
                ? 'bg-slate-600 hover:bg-slate-700 text-white border-slate-600'
                : 'bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600'
            }`}
            title="Top to Bottom layout"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>
      )}

      <Button
        variant="secondary"
        size="icon"
        onClick={onZoomIn}
        className="h-8 w-8 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border shadow-sm"
        title="Zoom In (+)"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>

      <Button
        variant="secondary"
        size="icon"
        onClick={onZoomOut}
        className="h-8 w-8 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border shadow-sm"
        title="Zoom Out (-)"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>

      <Button
        variant="secondary"
        size="icon"
        onClick={onFitToScreen}
        className="h-8 w-8 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border shadow-sm"
        title="Fit to Screen (F)"
      >
        <Maximize className="h-4 w-4" />
      </Button>

      <Button
        variant="secondary"
        size="icon"
        onClick={onReset}
        className="h-8 w-8 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border shadow-sm"
        title="Reset View (0)"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>

      {onToggleMiniMap && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleMiniMap}
          className={`h-8 w-8 border shadow-sm transition-colors ${
            showMiniMap
              ? 'bg-slate-600 hover:bg-slate-700 text-white border-slate-600'
              : 'bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600'
          }`}
          title="Toggle MiniMap (M)"
        >
          <Map className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
