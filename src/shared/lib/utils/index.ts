import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert absolute file path to relative path from project root
 * Tries to find common project markers like "src/", "components/", etc.
 */
export function getRelativePath(filePath: string): string {
  if (!filePath) {
    return filePath
  }

  // Common project root indicators
  const projectMarkers = [
    '/src/',
    '/components/',
    '/lib/',
    '/pages/',
    '/app/',
    '/styles/',
    '/public/',
    '/assets/'
  ]

  // Try to find the last occurrence of any project marker
  let relativeIndex = -1

  for (const marker of projectMarkers) {
    const index = filePath.lastIndexOf(marker)
    if (index > relativeIndex) {
      relativeIndex = index
    }
  }

  // If found a marker, return path starting from the marker (without leading slash)
  if (relativeIndex >= 0) {
    return filePath.substring(relativeIndex + 1)
  }

  // Otherwise, try to find the project name in path
  const pathParts = filePath.split('/')

  // Look for common project folder patterns
  const projectFolderIndex = pathParts.findIndex((_part, index) => {
    // Skip early parts (like Users, home, etc.)
    if (index < 2) {
      return false
    }

    // Look for folders that might be project names
    // Usually after "Project", "workspace", "code", "dev", etc.
    const prevPart = pathParts[index - 1]?.toLowerCase()
    return [
      'project',
      'projects',
      'workspace',
      'code',
      'dev',
      'development'
    ].includes(prevPart)
  })

  if (projectFolderIndex > 0) {
    return pathParts.slice(projectFolderIndex).join('/')
  }

  // Last resort: return last 3-4 parts of the path
  return pathParts.slice(-4).join('/')
}

/**
 * Get just the filename from a path
 */
export function getBasename(filePath: string): string {
  if (!filePath) {
    return filePath
  }
  return filePath.split('/').pop() || filePath.split('\\').pop() || filePath
}
