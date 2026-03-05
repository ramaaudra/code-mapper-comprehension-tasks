import { useEffect, useState } from 'react'

interface PlatformInfo {
  isMac: boolean
  isWindows: boolean
  isLinux: boolean
  modifierKey: '⌘' | 'Ctrl'
  altKey: '⌥' | 'Alt'
}

export function usePlatform(): PlatformInfo {
  const [platform, setPlatform] = useState<PlatformInfo>({
    isMac: false,
    isWindows: false,
    isLinux: false,
    modifierKey: 'Ctrl',
    altKey: 'Alt'
  })

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase()
    const isMac = /mac|darwin/.test(userAgent)
    const isWindows = /win/.test(userAgent)
    const isLinux = /linux/.test(userAgent)

    setPlatform({
      isMac,
      isWindows,
      isLinux,
      modifierKey: isMac ? '⌘' : 'Ctrl',
      altKey: isMac ? '⌥' : 'Alt'
    })
  }, [])

  return platform
}
