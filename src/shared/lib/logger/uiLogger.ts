export interface UiLogEnv {
  DEV?: boolean
  PROD?: boolean
}

export interface UiSerializedError {
  errorMessage: string
  errorName: string
  errorStack?: string
}

export interface UiLogger {
  debug(message: string, ...details: unknown[]): void
  error(message: string, ...details: unknown[]): void
  info(message: string, ...details: unknown[]): void
  warn(message: string, ...details: unknown[]): void
}

type UiConsole = Pick<Console, 'debug' | 'error' | 'info' | 'warn'>

function getImportMetaEnv(): UiLogEnv | undefined {
  return (import.meta as ImportMeta & { env?: UiLogEnv }).env
}

export function isUiLoggingEnabled(env?: UiLogEnv): boolean {
  const runtimeEnv = env ?? getImportMetaEnv()

  if (runtimeEnv?.DEV !== undefined) {
    return runtimeEnv.DEV
  }

  if (runtimeEnv?.PROD !== undefined) {
    return !runtimeEnv.PROD
  }

  if (typeof process !== 'undefined' && process.env.NODE_ENV) {
    return process.env.NODE_ENV !== 'production'
  }

  return false
}

export function serializeUiError(
  error: unknown
): UiSerializedError | undefined {
  if (!(error instanceof Error)) {
    return undefined
  }

  return {
    errorName: error.name,
    errorMessage: error.message,
    ...(error.stack ? { errorStack: error.stack } : {})
  }
}

function normalizeUiLogDetails(details: unknown[]): unknown[] {
  return details.flatMap((detail) => {
    if (detail === undefined) {
      return []
    }

    const serializedError = serializeUiError(detail)
    return [serializedError ?? detail]
  })
}

function formatUiLogMessage(scope: string, message: string): string {
  return `[Code Mapper][${scope}] ${message}`
}

export function createUiLogger(
  scope: string,
  options: {
    console?: UiConsole
    enabled?: boolean
    env?: UiLogEnv
  } = {}
): UiLogger {
  const output = options.console ?? console
  const enabled = options.enabled ?? isUiLoggingEnabled(options.env)

  function write(
    level: keyof UiConsole,
    message: string,
    details: unknown[]
  ): void {
    if (!enabled) {
      return
    }

    const normalizedDetails = normalizeUiLogDetails(details)
    output[level](formatUiLogMessage(scope, message), ...normalizedDetails)
  }

  return {
    debug(message: string, ...details: unknown[]): void {
      write('debug', message, details)
    },
    info(message: string, ...details: unknown[]): void {
      write('info', message, details)
    },
    warn(message: string, ...details: unknown[]): void {
      write('warn', message, details)
    },
    error(message: string, ...details: unknown[]): void {
      write('error', message, details)
    }
  }
}
