import type { EntryDetectionContext } from '@/shared/types/analysis'

const ROUTE_CONVENTION_FRAMEWORKS = new Set([
  'Next.js',
  'SvelteKit',
  'Astro',
  'Remix',
  'Nuxt',
  'Gatsby'
])

function hasRouteConventions(framework: string): boolean {
  return ROUTE_CONVENTION_FRAMEWORKS.has(framework)
}

/**
 * Build human-readable detection basis description.
 * Explains what sources the entry-point analysis used.
 */
export function buildReachabilityBasisCopy(
  ctx?: EntryDetectionContext
): string {
  if (!ctx || ctx.sources.length === 0) {
    return 'Based on heuristic file scanning only.'
  }

  const parts: string[] = []
  const routeConventionFrameworks = ctx.frameworks.filter((framework) =>
    hasRouteConventions(framework)
  )
  const genericFrameworks = ctx.frameworks.filter(
    (framework) => !hasRouteConventions(framework)
  )

  if (routeConventionFrameworks.length > 0) {
    parts.push(
      `${formatEnglishList(routeConventionFrameworks)} route conventions`
    )
  }

  if (genericFrameworks.length > 0) {
    parts.push(`${formatEnglishList(genericFrameworks)} project structure`)
  }

  for (const source of ctx.sources) {
    if (source === 'scripts') parts.push('package scripts')
    if (source === 'config') parts.push('config files')
    if (source === 'dependencies' && ctx.frameworks.length === 0) {
      parts.push('dependency scanning')
    }
  }

  if (parts.length === 0) {
    return 'Based on heuristic file scanning only.'
  }

  return `Based on ${formatEnglishList(parts)}.`
}

/**
 * Build confidence-aware verification guidance.
 * Helps users judge how much verification is needed.
 */
export function buildReachabilityVerificationCopy(
  ctx?: EntryDetectionContext
): string {
  if (!ctx) {
    return 'Manual verification strongly recommended.'
  }

  switch (ctx.confidence) {
    case 'high':
      return 'This is a strong signal that the path is likely unreachable, but runtime verification is still recommended.'
    case 'medium':
      return 'Verify dynamic imports and runtime references.'
    case 'low':
      return 'Manual verification strongly recommended.'
  }
}

/** Join items with commas and "and" for the last item. */
function formatEnglishList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`
}
