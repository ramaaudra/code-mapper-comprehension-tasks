import { useCallback, useEffect } from 'react'

export interface ShortcutConfig {
  key: string
  meta?: boolean
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  preventDefault?: boolean
  enabled?: boolean
  ignoreEditableTargets?: boolean
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  const tagName = target.tagName.toLowerCase()

  return (
    target.isContentEditable ||
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select'
  )
}

function matchesShortcut(
  event: KeyboardEvent,
  config: ShortcutConfig,
  isMac: boolean
): boolean {
  const keyMatches = event.key.toLowerCase() === config.key.toLowerCase()
  const shiftMatches = config.shift ? event.shiftKey : !event.shiftKey
  const altMatches = config.alt ? event.altKey : !event.altKey
  const metaMatches = isMac
    ? event.metaKey === Boolean(config.meta)
    : !event.metaKey
  const ctrlMatches = isMac
    ? event.ctrlKey === Boolean(config.ctrl)
    : event.ctrlKey === Boolean(config.meta || config.ctrl)

  return keyMatches && metaMatches && ctrlMatches && shiftMatches && altMatches
}

export function useKeyboardShortcut(
  config: ShortcutConfig,
  callback: () => void
): void {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (config.enabled === false) {
        return
      }

      if (config.ignoreEditableTargets && isEditableTarget(event.target)) {
        return
      }

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
