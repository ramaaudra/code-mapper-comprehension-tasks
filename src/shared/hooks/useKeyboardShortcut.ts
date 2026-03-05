import { useCallback, useEffect } from 'react'

export interface ShortcutConfig {
  key: string
  meta?: boolean
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  preventDefault?: boolean
}

function matchesShortcut(
  event: KeyboardEvent,
  config: ShortcutConfig,
  isMac: boolean
): boolean {
  const keyMatches = event.key.toLowerCase() === config.key.toLowerCase()
  const shiftMatches = config.shift ? event.shiftKey : !event.shiftKey
  const altMatches = config.alt ? event.altKey : !event.altKey
  const modifierMatches = isMac
    ? (config.meta ? event.metaKey : true) &&
      (config.ctrl ? event.ctrlKey : true)
    : (config.meta ? event.ctrlKey : true) &&
      (config.ctrl ? event.ctrlKey : true)

  return (
    keyMatches &&
    modifierMatches &&
    shiftMatches &&
    altMatches &&
    // Ensure no extra modifiers are pressed
    (isMac ? !event.ctrlKey || config.ctrl === true : !event.metaKey)
  )
}

export function useKeyboardShortcut(
  config: ShortcutConfig,
  callback: () => void
): void {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const isMac = /mac|darwin/i.test(navigator.userAgent)

      if (matchesShortcut(event, config, isMac)) {
        if (config.preventDefault) {
          event.preventDefault()
        }
        callback()
      }
    },
    [config, callback]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])
}
