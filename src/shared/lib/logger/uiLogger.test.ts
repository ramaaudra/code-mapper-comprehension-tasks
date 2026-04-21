import assert from 'node:assert/strict'
import test from 'node:test'

import { createUiLogger, serializeUiError } from './uiLogger'

type ConsoleDouble = Pick<Console, 'debug' | 'error' | 'info' | 'warn'> & {
  debugCalls: unknown[][]
  errorCalls: unknown[][]
  infoCalls: unknown[][]
  warnCalls: unknown[][]
}

function createConsoleDouble(): ConsoleDouble {
  const debugCalls: unknown[][] = []
  const infoCalls: unknown[][] = []
  const warnCalls: unknown[][] = []
  const errorCalls: unknown[][] = []

  return {
    debugCalls,
    infoCalls,
    warnCalls,
    errorCalls,
    debug: (...args: unknown[]) => {
      debugCalls.push(args)
    },
    info: (...args: unknown[]) => {
      infoCalls.push(args)
    },
    warn: (...args: unknown[]) => {
      warnCalls.push(args)
    },
    error: (...args: unknown[]) => {
      errorCalls.push(args)
    }
  }
}

test('uiLogger stays silent in production mode by default', () => {
  const consoleDouble = createConsoleDouble()
  const logger = createUiLogger('AnalysisData', {
    console: consoleDouble,
    env: {
      DEV: false,
      PROD: true
    }
  })

  logger.error('Reanalysis failed', new Error('Network down'))

  assert.equal(consoleDouble.errorCalls.length, 0)
})

test('uiLogger preserves console visibility with compact context in development mode', () => {
  const consoleDouble = createConsoleDouble()
  const logger = createUiLogger('ApiClient', {
    console: consoleDouble,
    env: {
      DEV: true,
      PROD: false
    }
  })

  logger.warn('Failed to parse VITE_API_URL', {
    event: 'api_base_url_parse_failed',
    value: '::invalid::'
  })

  assert.equal(consoleDouble.warnCalls.length, 1)
  assert.match(
    String(consoleDouble.warnCalls[0][0]),
    /\[Code Mapper\]\[ApiClient\] Failed to parse VITE_API_URL/
  )
  assert.deepEqual(consoleDouble.warnCalls[0][1], {
    event: 'api_base_url_parse_failed',
    value: '::invalid::'
  })
})

test('uiLogger serializes Error instances before writing to the console', () => {
  const consoleDouble = createConsoleDouble()
  const logger = createUiLogger('AnalysisData', {
    console: consoleDouble,
    env: {
      DEV: true,
      PROD: false
    }
  })
  const error = new TypeError('Request failed')

  error.stack = 'TypeError: Request failed\n    at useAnalysisData.ts:104:13'

  logger.error('Reanalysis failed', error)

  assert.equal(consoleDouble.errorCalls.length, 1)
  assert.deepEqual(consoleDouble.errorCalls[0][1], serializeUiError(error))
})
