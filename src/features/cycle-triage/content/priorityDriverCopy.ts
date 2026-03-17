function extractEntryLikeFileName(driver: string): string | null {
  const match = driver.match(/entry-like file involvement \((.+)\)/i)
  return match?.[1] ?? null
}

export function getPriorityDriverChipLabel(driver: string): string {
  const normalized = driver.toLowerCase()

  if (normalized === 'broad downstream usage') {
    return 'Used by many other files'
  }

  if (normalized === 'shared downstream usage') {
    return 'Used by several other files'
  }

  if (normalized === 'recent change activity') {
    return 'Recently active'
  }

  if (normalized === 'some recent change activity') {
    return 'Some recent activity'
  }

  if (normalized.startsWith('entry-like file involvement')) {
    const entryLikeFileName = extractEntryLikeFileName(driver)
    return entryLikeFileName
      ? `Touches entry wiring (${entryLikeFileName})`
      : 'Touches entry wiring'
  }

  if (normalized.startsWith('a longer loop across')) {
    return 'Longer loop'
  }

  if (normalized === 'a small local loop with limited downstream impact') {
    return 'Local loop'
  }

  return driver
}
