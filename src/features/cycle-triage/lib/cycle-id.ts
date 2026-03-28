import { normalizePath } from '@/shared/lib/utils'

export function normalizeCyclePath(paths: string[]): string[] {
  const normalizedPaths = paths
    .map(normalizePath)
    .filter((path): path is string => path.length > 0)
  const compactedPath = normalizedPaths.filter(
    (path, index) => index === 0 || path !== normalizedPaths[index - 1]
  )

  if (compactedPath.length === 0) {
    return []
  }

  if (compactedPath.length === 1) {
    return [compactedPath[0], compactedPath[0]]
  }

  const firstPath = compactedPath[0]
  const lastPath = compactedPath[compactedPath.length - 1]

  if (firstPath !== lastPath) {
    compactedPath.push(firstPath)
  }

  return compactedPath
}

export function createCycleId(cyclePath: string[]): string {
  return cyclePath.map(normalizePath).join('->')
}
