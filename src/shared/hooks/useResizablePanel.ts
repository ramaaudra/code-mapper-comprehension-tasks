import { useCallback, useEffect, useRef, useState } from 'react'

interface UseResizablePanelOptions {
  defaultWidth?: number
  minWidth?: number
  maxWidth?: number
}

interface ResizeHandleProps {
  role: 'separator'
  'aria-orientation': 'vertical'
  'aria-label': string
  tabIndex: number
  onMouseDown: () => void
  onKeyDown: (e: React.KeyboardEvent) => void
}

interface UseResizablePanelReturn {
  panelWidth: number
  isResizing: boolean
  panelRef: React.RefObject<HTMLDivElement | null>
  startResizing: () => void
  resizeHandleProps: ResizeHandleProps
}

const DEFAULT_WIDTH = 420
const MIN_WIDTH = 280
const MAX_WIDTH = 720

function clampPanelWidth(
  width: number,
  minWidth: number,
  maxWidth: number
): number {
  return Math.max(minWidth, Math.min(maxWidth, width))
}

export function useResizablePanel(
  options: UseResizablePanelOptions = {}
): UseResizablePanelReturn {
  const {
    defaultWidth = DEFAULT_WIDTH,
    minWidth = MIN_WIDTH,
    maxWidth = MAX_WIDTH
  } = options

  const [panelWidth, setPanelWidth] = useState(() =>
    clampPanelWidth(defaultWidth, minWidth, maxWidth)
  )
  const [isResizing, setIsResizing] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const isResizingRef = useRef(isResizing)
  isResizingRef.current = isResizing

  const startResizing = useCallback(() => setIsResizing(true), [])
  const stopResizing = useCallback(() => setIsResizing(false), [])

  const resize = useCallback(
    (mouseMoveEvent: MouseEvent) => {
      if (!isResizingRef.current || !panelRef.current) {
        return
      }

      const newWidth = window.innerWidth - mouseMoveEvent.clientX
      setPanelWidth((prev) => {
        const clamped = clampPanelWidth(newWidth, minWidth, maxWidth)
        return Math.abs(prev - clamped) < 2 ? prev : clamped
      })
    },
    [minWidth, maxWidth]
  )

  useEffect(() => {
    if (!isResizing) {
      return
    }

    window.addEventListener('mousemove', resize)
    window.addEventListener('mouseup', stopResizing)
    document.body.classList.add('resizing')

    return () => {
      window.removeEventListener('mousemove', resize)
      window.removeEventListener('mouseup', stopResizing)
      document.body.classList.remove('resizing')
    }
  }, [isResizing, resize, stopResizing])

  useEffect(() => {
    const handleResize = () => {
      setPanelWidth((width) => clampPanelWidth(width, minWidth, maxWidth))
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [maxWidth, minWidth])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setPanelWidth((w) => Math.max(minWidth, w - 20))
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        setPanelWidth((w) => Math.min(maxWidth, w + 20))
      }
    },
    [minWidth, maxWidth]
  )

  const resizeHandleProps: ResizeHandleProps = {
    role: 'separator',
    'aria-orientation': 'vertical',
    'aria-label': 'Resize panel',
    tabIndex: 0,
    onMouseDown: startResizing,
    onKeyDown: handleKeyDown
  }

  return {
    panelWidth,
    isResizing,
    panelRef,
    startResizing,
    resizeHandleProps
  }
}
