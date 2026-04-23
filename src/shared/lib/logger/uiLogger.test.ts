import assert from 'node:assert/strict'
import test from 'node:test'

import { createUiLogger } from './uiLogger'

test('createUiLogger prefixes messages with the Tauta brand', () => {
  const entries: string[] = []
  const logger = createUiLogger('ReportShell', {
    enabled: true,
    console: {
      debug(message): void {
        entries.push(message)
      },
      info(message): void {
        entries.push(message)
      },
      warn(message): void {
        entries.push(message)
      },
      error(message): void {
        entries.push(message)
      }
    }
  })

  logger.info('loaded')

  assert.deepEqual(entries, ['[Tauta][ReportShell] loaded'])
})
