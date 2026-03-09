/* eslint-disable no-console */

interface PerfDebugWindow extends Window {
  __perfReport?: () => void
  __perfClear?: () => void
}

export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map()
  private enabled: boolean

  constructor() {
    this.enabled = process.env.NODE_ENV === 'development'
  }

  startMeasure(label: string): () => void {
    if (!this.enabled) {
      return () => {} // No-op in production
    }

    const start = performance.now()

    return () => {
      const duration = performance.now() - start

      let measurements = this.metrics.get(label)

      if (!measurements) {
        measurements = []
        this.metrics.set(label, measurements)
      }

      measurements.push(duration)

      // Keep last 100 measurements
      if (measurements.length > 100) {
        measurements.shift()
      }

      // Log if slow
      if (duration > 100) {
        console.warn(
          `⚠️ Slow operation: ${label} took ${duration.toFixed(2)}ms`
        )
      } else {
        console.debug(`✓ ${label}: ${duration.toFixed(2)}ms`)
      }
    }
  }

  getStats(label: string) {
    const measurements = this.metrics.get(label) || []
    if (measurements.length === 0) {
      return null
    }

    const avg = measurements.reduce((a, b) => a + b, 0) / measurements.length
    const max = Math.max(...measurements)
    const min = Math.min(...measurements)

    return { avg, max, min, count: measurements.length }
  }

  report() {
    if (!this.enabled) {
      return
    }

    console.group('📊 Performance Report')
    this.metrics.forEach((_, label) => {
      const stats = this.getStats(label)
      if (stats) {
        console.log(`${label}:`, {
          avg: `${stats.avg.toFixed(2)}ms`,
          max: `${stats.max.toFixed(2)}ms`,
          min: `${stats.min.toFixed(2)}ms`,
          count: stats.count
        })
      }
    })
    console.groupEnd()
  }

  clear() {
    this.metrics.clear()
  }
}

export const perfMonitor = new PerformanceMonitor()

// Expose to window for debugging
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  ;(window as PerfDebugWindow).__perfReport = () => perfMonitor.report()
  ;(window as PerfDebugWindow).__perfClear = () => perfMonitor.clear()
}
