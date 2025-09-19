import { useState, useEffect } from 'react';

interface ZoomIndicatorProps {
  panzoomInstance: any;
}

export function ZoomIndicator({ panzoomInstance }: ZoomIndicatorProps) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!panzoomInstance) return;

    const handleZoom = () => {
      const transform = panzoomInstance.getTransform();
      setZoomLevel(transform.scale);
      
      // Show indicator briefly when zoom changes
      setIsVisible(true);
      const timer = setTimeout(() => setIsVisible(false), 2000);
      return () => clearTimeout(timer);
    };

    // Listen to pan/zoom events
    panzoomInstance.on('zoom', handleZoom);
    panzoomInstance.on('panend', handleZoom);

    return () => {
      panzoomInstance.off('zoom', handleZoom);
      panzoomInstance.off('panend', handleZoom);
    };
  }, [panzoomInstance]);

  if (!isVisible) return null;

  const percentage = Math.round(zoomLevel * 100);
  
  return (
    <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-md text-sm font-mono z-20 transition-opacity duration-300">
      {percentage}%
      <div className="text-xs opacity-75 mt-1">
        {percentage < 50 ? 'Zoomed out' : percentage > 200 ? 'Very close' : 'Normal'}
      </div>
    </div>
  );
}