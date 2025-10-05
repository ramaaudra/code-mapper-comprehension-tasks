import { ZoomIn, ZoomOut, RotateCcw, Maximize } from '@/components/ui/icons';
import { Button } from '@/components/ui/button';

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onFitToScreen: () => void;
}

export function ZoomControls({ onZoomIn, onZoomOut, onReset, onFitToScreen }: ZoomControlsProps) {
  return (
    <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-20">
      <Button
        variant="secondary"
        size="icon"
        onClick={onZoomIn}
        className="h-8 w-8 bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800 backdrop-blur-sm shadow-md border"
        title="Zoom In"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      
      <Button
        variant="secondary"
        size="icon"
        onClick={onZoomOut}
        className="h-8 w-8 bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800 backdrop-blur-sm shadow-md border"
        title="Zoom Out"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      
      <Button
        variant="secondary"
        size="icon"
        onClick={onFitToScreen}
        className="h-8 w-8 bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800 backdrop-blur-sm shadow-md border"
        title="Fit to Screen"
      >
        <Maximize className="h-4 w-4" />
      </Button>
      
      <Button
        variant="secondary"
        size="icon"
        onClick={onReset}
        className="h-8 w-8 bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800 backdrop-blur-sm shadow-md border"
        title="Reset View"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
    </div>
  );
}
