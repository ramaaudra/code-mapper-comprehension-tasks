/**
 * Normalize path separators to forward slash
 */
export function normalizePath(path: string): string {
  return path.replace(/\\/g, '/')
}

/**
 * Get basename from file path without using path module
 */
export function getBasename(filePath: string): string {
  return filePath.split('/').pop() || filePath
}

/**
 * Check if two paths match (with normalization)
 */
export function pathsMatch(path1: string, path2: string): boolean {
  const normalized1 = normalizePath(path1)
  const normalized2 = normalizePath(path2)
  return (
    normalized1 === normalized2 ||
    normalized1.endsWith(`/${normalized2}`) ||
    normalized2.endsWith(`/${normalized1}`)
  )
}

/**
 * Find matching key in Set with path normalization
 */
export function hasPathInSet(set: Set<string>, targetPath: string): boolean {
  const normalizedTarget = normalizePath(targetPath)
  for (const candidate of set) {
    if (pathsMatch(candidate, normalizedTarget)) {
      return true
    }
  }
  return false
}

/**
 * Get value from Map with path matching
 */
export function getValueFromPathMap<T>(
  map: Map<string, T>,
  targetPath: string
): T | undefined {
  const normalizedTarget = normalizePath(targetPath)
  for (const [key, value] of map.entries()) {
    if (pathsMatch(key, normalizedTarget)) {
      return value
    }
  }
  return undefined
}
