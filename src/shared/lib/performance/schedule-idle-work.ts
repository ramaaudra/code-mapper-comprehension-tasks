export interface IdleWorkScheduler {
  requestIdleCallback?: (
    callback: IdleRequestCallback,
    options?: IdleRequestOptions
  ) => number
  cancelIdleCallback?: (id: number) => void
  setTimeout: (
    callback: () => void,
    delay?: number
  ) => ReturnType<typeof globalThis.setTimeout>
  clearTimeout: (id: ReturnType<typeof globalThis.setTimeout>) => void
}

const DEFAULT_IDLE_TIMEOUT_MS = 1500
const DEFAULT_FALLBACK_DELAY_MS = 200

export function scheduleIdleWork(
  task: () => void,
  scheduler: IdleWorkScheduler = globalThis,
  options: {
    idleTimeoutMs?: number
    fallbackDelayMs?: number
  } = {}
): () => void {
  const {
    idleTimeoutMs = DEFAULT_IDLE_TIMEOUT_MS,
    fallbackDelayMs = DEFAULT_FALLBACK_DELAY_MS
  } = options

  if (
    typeof scheduler.requestIdleCallback === 'function' &&
    typeof scheduler.cancelIdleCallback === 'function'
  ) {
    const idleCallbackId = scheduler.requestIdleCallback(
      () => {
        task()
      },
      {
        timeout: idleTimeoutMs
      }
    )

    return () => scheduler.cancelIdleCallback?.(idleCallbackId)
  }

  const timeoutId = scheduler.setTimeout(task, fallbackDelayMs)

  return () => scheduler.clearTimeout(timeoutId)
}
