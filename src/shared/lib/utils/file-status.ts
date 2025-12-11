/**
 * File status utilities for path normalization and file matching
 */

/**
 * Normalize file path by replacing backslashes with forward slashes
 */
export function normalizePath(value: string): string {
  return value.replace(/\\/g, '/')
}

/**
 * Check if two file paths match (handles relative vs absolute paths)
 */
export function matchesFile(candidate: string, target: string): boolean {
  const normalizedCandidate = normalizePath(candidate)
  const normalizedTarget = normalizePath(target)
  return (
    normalizedCandidate === normalizedTarget ||
    normalizedCandidate.endsWith(`/${normalizedTarget}`)
  )
}

/**
 * Check if any file in the set matches the target
 */
export function hasMatchInSet(set: Set<string>, target: string): boolean {
  for (const candidate of set) {
    if (matchesFile(candidate, target)) {
      return true
    }
  }
  return false
}

/**
 * Get value from map where key matches the target file path
 */
export function getValueFromMap<T>(
  map: Map<string, T>,
  target: string
): T | undefined {
  for (const [key, value] of map.entries()) {
    if (matchesFile(key, target)) {
      return value
    }
  }
  return undefined
}
