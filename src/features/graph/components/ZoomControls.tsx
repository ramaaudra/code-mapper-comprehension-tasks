import { Button } from '@/shared/components/ui/button'
import {
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
}

export function ZoomControls({
  onZoomIn,
  onZoomOut,
  onReset,
  onFitToScreen,
  showMiniMap = false,
  onToggleMiniMap
}: ZoomControlsProps) {
  return (
    <div className="absolute bottom-4 right-4 flex flex-col gap-1 z-20">
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
          variant={showMiniMap ? 'default' : 'secondary'}
          size="icon"
          onClick={onToggleMiniMap}
          className={
            showMiniMap
              ? 'h-8 w-8 border shadow-sm'
              : 'h-8 w-8 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border shadow-sm'
          }
          title="Toggle MiniMap (M)"
        >
          <Map className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
