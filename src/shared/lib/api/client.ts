import axios from 'axios'

import { createUiLogger } from '@/shared/lib/logger/uiLogger'

const apiClientLogger = createUiLogger('ApiClient')

function resolveBaseURL(): string {
  const metaEnv = import.meta.env ?? {}
  const envBaseURL =
    typeof metaEnv.VITE_API_URL === 'string' ? metaEnv.VITE_API_URL.trim() : ''
  const forceEnv = metaEnv.VITE_FORCE_API_URL === 'true'

  if (metaEnv.DEV || forceEnv) {
    return envBaseURL || ''
  }

  if (!envBaseURL) {
    return ''
  }

  // Allow relative paths to continue working when explicitly configured.
  if (envBaseURL.startsWith('/')) {
    return envBaseURL
  }

  if (typeof window !== 'undefined') {
    try {
      const targetURL = new URL(envBaseURL, window.location.origin)
      if (targetURL.origin === window.location.origin) {
        return targetURL.pathname === '/' ? '' : targetURL.pathname
      }
    } catch (error) {
      apiClientLogger.warn(
        'Failed to parse VITE_API_URL, fallback to current origin',
        error,
        {
          event: 'api_base_url_parse_failed',
          configuredValue: envBaseURL
        }
      )
    }
  }

  return ''
}

export const api = axios.create({
  baseURL: resolveBaseURL()
})
