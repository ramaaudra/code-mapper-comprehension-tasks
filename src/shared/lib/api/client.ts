import axios from 'axios'

function resolveBaseURL(): string {
  const envBaseURL = import.meta.env.VITE_API_URL?.trim()
  const forceEnv = import.meta.env.VITE_FORCE_API_URL === 'true'

  if (import.meta.env.DEV || forceEnv) {
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
      console.warn(
        'Failed to parse VITE_API_URL, fallback to current origin:',
        error
      )
    }
  }

  return ''
}

export const api = axios.create({
  baseURL: resolveBaseURL()
})
