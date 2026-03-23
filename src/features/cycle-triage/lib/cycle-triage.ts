import type {
  BuildCycleTriageItemsInput,
  CycleFileMetric,
  CycleGraphEdge,
  CycleTriageItem,
  FixPriority,
  SuggestedInvestigation
} from '../types/cycle-triage'

type ImpactBand = 'limited' | 'moderate' | 'broad'
type ChangeBand = 'stable' | 'moderate' | 'active'

interface CycleThresholds {
  impactBroad: number
  impactModerate: number
  changeActive: number
  changeModerate: number
}

function normalizePath(value: string): string {
  return value.replace(/\\/g, '/')
}

function getBasename(filePath: string): string {
  const normalized = normalizePath(filePath)
  const segments = normalized.split('/')
  return segments[segments.length - 1] || normalized
}

function uniquePaths(paths: string[]): string[] {
  return [...new Set(paths.map(normalizePath))]
}

function normalizeCyclePath(paths: string[]): string[] {
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

function createCycleId(cyclePath: string[]): string {
  return cyclePath.map(normalizePath).join('->')
}

function findDependencyReference(params: {
  dependencyMap: Record<
    string,
    { target: string; strength: number; line: number }[]
  >
  source: string
  target: string
}) {
  const { dependencyMap, source, target } = params
  const dependencies = dependencyMap[source] ?? []

  return dependencies.find(
    (dependency) => normalizePath(dependency.target) === normalizePath(target)
  )
}

function percentile(values: number[], percentileRank: number): number {
  if (values.length === 0) {
    return 0
  }

  const sorted = [...values].sort((a, b) => a - b)
  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.floor((sorted.length - 1) * percentileRank))
  )

  return sorted[index] ?? 0
}

function createThresholds(fileMetrics: CycleFileMetric[]): CycleThresholds {
  const impactValues = fileMetrics
    .map((metric) => metric.ca)
    .filter((value) => value > 0)
  const changeValues = fileMetrics
    .map((metric) => metric.evolution?.churn30d?.relativeChurn ?? 0)
    .filter((value) => value > 0)

  return {
    impactBroad: percentile(impactValues, 0.75),
    impactModerate: percentile(impactValues, 0.4),
    changeActive: percentile(changeValues, 0.75),
    changeModerate: percentile(changeValues, 0.4)
  }
}

function resolveImpactBand(
  maxDependents: number,
  thresholds: CycleThresholds
): ImpactBand {
  if (maxDependents <= 0) {
    return 'limited'
  }

  if (maxDependents >= Math.max(5, thresholds.impactBroad)) {
    return 'broad'
  }

  if (maxDependents >= Math.max(2, thresholds.impactModerate)) {
    return 'moderate'
  }

  return 'limited'
}

function resolveChangeBand(
  maxRelativeChurn: number,
  thresholds: CycleThresholds
): ChangeBand {
  if (maxRelativeChurn <= 0) {
    return 'stable'
  }

  if (maxRelativeChurn >= Math.max(0.3, thresholds.changeActive)) {
    return 'active'
  }

  if (maxRelativeChurn >= Math.max(0.08, thresholds.changeModerate)) {
    return 'moderate'
  }

  return 'stable'
}

function isEntryLikeFile(filePath: string): boolean {
  const basename = getBasename(filePath).toLowerCase()
  return (
    basename.includes('index') ||
    basename.includes('main') ||
    basename.includes('app') ||
    basename.includes('config')
  )
}

function buildTitle(files: string[], cyclePath: string[]): string {
  const basenames = files.map(getBasename)
  if (basenames.length === 2) {
    return `${basenames[0]} <-> ${basenames[1]} loop`
  }

  return `${cyclePath.slice(0, -1).map(getBasename).join(' -> ')} loop`
}

function buildRouteLabel(cyclePath: string[]): string {
  return cyclePath.map(getBasename).join(' -> ')
}

function buildPriorityDrivers(params: {
  fixPriority: FixPriority
  impactBand: ImpactBand
  changeBand: ChangeBand
  uniqueFileCount: number
  entryLikeFiles: string[]
}): string[] {
  const { impactBand, changeBand, uniqueFileCount, entryLikeFiles } = params
  const drivers: string[] = []

  if (impactBand === 'broad') {
    drivers.push('broad downstream usage')
  } else if (impactBand === 'moderate') {
    drivers.push('shared downstream usage')
  }

  if (changeBand === 'active') {
    drivers.push('recent change activity')
  } else if (changeBand === 'moderate') {
    drivers.push('some recent change activity')
  }

  if (entryLikeFiles.length > 0) {
    drivers.push(
      `entry-like file involvement (${entryLikeFiles.map(getBasename).join(', ')})`
    )
  }

  if (uniqueFileCount >= 4) {
    drivers.push(`a longer loop across ${uniqueFileCount} files`)
  } else if (drivers.length === 0) {
    drivers.push('a small local loop with limited downstream impact')
  }

  return drivers
}

function joinReasonParts(parts: string[]): string {
  if (parts.length <= 1) {
    return parts[0] ?? ''
  }

  if (parts.length === 2) {
    return `${parts[0]} and ${parts[1]}`
  }

  return `${parts.slice(0, -1).join(', ')}, and ${parts[parts.length - 1]}`
}

function chooseRecommendedEdge(params: {
  cycleEdges: CycleGraphEdge[]
  metricsByPath: Map<string, CycleFileMetric>
  entryLikeFiles: string[]
}): CycleGraphEdge | undefined {
  const { cycleEdges, metricsByPath, entryLikeFiles } = params

  if (cycleEdges.length === 0) {
    return undefined
  }

  const entryLikeSet = new Set(entryLikeFiles.map(normalizePath))
  const entryEdge = cycleEdges.find((edge) =>
    entryLikeSet.has(normalizePath(edge.target))
  )
  if (entryEdge) {
    return entryEdge
  }

  return [...cycleEdges].sort((edgeA, edgeB) => {
    const sourceA = metricsByPath.get(normalizePath(edgeA.source))
    const sourceB = metricsByPath.get(normalizePath(edgeB.source))
    const scoreA = (sourceA?.ca ?? 0) + (sourceA?.ce ?? 0)
    const scoreB = (sourceB?.ca ?? 0) + (sourceB?.ce ?? 0)
    return scoreA - scoreB
  })[0]
}

function buildSuggestedInvestigation(params: {
  files: string[]
  uniqueFileCount: number
  entryLikeFiles: string[]
  recommendedEdge?: CycleGraphEdge
}): SuggestedInvestigation {
  const { files, uniqueFileCount, entryLikeFiles, recommendedEdge } = params

  if (entryLikeFiles.length > 0) {
    const entryName = getBasename(entryLikeFiles[0] ?? '')
    return {
      summary: `Check whether a barrel or entry import through ${entryName} is closing the loop.`,
      detail:
        'Entry-like files often re-export or wire modules together. Inspect that import direction first before changing deeper files.',
      confidence: 'high',
      candidateEdge: recommendedEdge
    }
  }

  if (uniqueFileCount === 2) {
    const [firstFile, secondFile] = files
    return {
      summary: `Inspect whether ${getBasename(firstFile ?? '')} and ${getBasename(secondFile ?? '')} can depend on a shared contract instead of each other.`,
      detail:
        'A two-file loop is often easiest to break by extracting shared contracts, types, or coordination code into a lower-level module.',
      confidence: 'medium',
      candidateEdge: recommendedEdge
    }
  }

  return {
    summary:
      'Review the least shared edge first before deciding where to invert or extract the dependency.',
    detail:
      'Start with the edge that appears least reused by the rest of the codebase so the first investigation stays narrow.',
    confidence: 'low',
    candidateEdge: recommendedEdge
  }
}

function buildWhyItMatters(fixPriority: FixPriority): string {
  switch (fixPriority) {
    case 'high':
      return 'Changes here can bounce through shared paths and widen retest scope.'
    case 'medium':
      return 'This loop can still hide coordination and initialization issues across the same chain.'
    default:
      return 'This loop looks relatively contained, but it still makes refactors harder to reason about.'
  }
}

function buildWhatIsHappening(files: string[]): string {
  if (files.length === 2) {
    return `This loop routes ${getBasename(files[0] ?? '')} and ${getBasename(files[1] ?? '')} back into the same dependency chain.`
  }

  return `This loop sends dependencies back through the same chain across ${files.length} files.`
}

function buildVerificationChecks(params: {
  impactBand: ImpactBand
  changeBand: ChangeBand
}): string[] {
  const checks = [
    'Confirm the dependency path no longer returns to the starting file.'
  ]

  if (params.impactBand !== 'limited') {
    checks.push(
      'Retest the modules that import the files involved in this loop.'
    )
  }

  if (params.changeBand !== 'stable') {
    checks.push(
      'Recheck recently changed flows that touch this loop to confirm behavior is still intact.'
    )
  }

  return checks
}

function createNeighborEdges(params: {
  filesSet: Set<string>
  dependencyMap: Record<string, { target: string }[]>
}): CycleGraphEdge[] {
  const { filesSet, dependencyMap } = params
  const edges: CycleGraphEdge[] = []
  const seen = new Set<string>()

  for (const [source, dependencies] of Object.entries(dependencyMap)) {
    const normalizedSource = normalizePath(source)
    const sourceInCycle = filesSet.has(normalizedSource)

    for (const dependency of dependencies) {
      const normalizedTarget = normalizePath(dependency.target)
      const targetInCycle = filesSet.has(normalizedTarget)

      if (sourceInCycle === targetInCycle) {
        continue
      }

      const edge: CycleGraphEdge = {
        source: normalizedSource,
        target: normalizedTarget
      }
      const signature = `${edge.source}->${edge.target}`

      if (!seen.has(signature)) {
        seen.add(signature)
        edges.push(edge)
      }
    }
  }

  return edges
}

export function buildCycleTriageItems({
  cycles,
  dependencyMap,
  fileMetrics
}: BuildCycleTriageItemsInput): CycleTriageItem[] {
  const thresholds = createThresholds(fileMetrics)
  const metricsByPath = new Map(
    fileMetrics.map(
      (metric) => [normalizePath(metric.filePath), metric] as const
    )
  )

  return cycles
    .map((cycleInfo) => {
      const cyclePath = normalizeCyclePath(cycleInfo.cycle)
      const files = uniquePaths(cyclePath.slice(0, -1))
      const filesSet = new Set(files)
      const cycleEdges = cyclePath.slice(0, -1).map((source, index) => {
        const target = cyclePath[index + 1] ?? source
        const dependencyReference = findDependencyReference({
          dependencyMap,
          source,
          target
        })

        return {
          source,
          target,
          line: dependencyReference?.line,
          strength: dependencyReference?.strength
        }
      })
      const metrics = files
        .map((filePath) => metricsByPath.get(filePath))
        .filter((metric): metric is CycleFileMetric => metric != null)
      const uniqueFileCount = files.length
      const maxDependents = metrics.reduce(
        (currentMax, metric) => Math.max(currentMax, metric.ca),
        0
      )
      const maxRelativeChurn = metrics.reduce(
        (currentMax, metric) =>
          Math.max(currentMax, metric.evolution?.churn30d?.relativeChurn ?? 0),
        0
      )
      const impactBand = resolveImpactBand(maxDependents, thresholds)
      const changeBand = resolveChangeBand(maxRelativeChurn, thresholds)
      const entryLikeFiles = files.filter(isEntryLikeFile)

      let fixPriority: FixPriority = 'low'
      if (
        impactBand === 'broad' ||
        changeBand === 'active' ||
        (entryLikeFiles.length > 0 && impactBand !== 'limited')
      ) {
        fixPriority = 'high'
      } else if (
        impactBand === 'moderate' ||
        changeBand === 'moderate' ||
        uniqueFileCount >= 3 ||
        entryLikeFiles.length > 0
      ) {
        fixPriority = 'medium'
      }

      const priorityDrivers = buildPriorityDrivers({
        fixPriority,
        impactBand,
        changeBand,
        uniqueFileCount,
        entryLikeFiles
      })
      const priorityReason =
        fixPriority === 'low'
          ? 'Low priority because this looks like a small local loop with limited downstream impact.'
          : `${fixPriority[0]?.toUpperCase() ?? ''}${fixPriority.slice(1)} priority because ${joinReasonParts(
              priorityDrivers.slice(0, 3)
            )}.`
      const recommendedEdge = chooseRecommendedEdge({
        cycleEdges,
        metricsByPath,
        entryLikeFiles
      })
      const suggestedInvestigation = buildSuggestedInvestigation({
        files,
        uniqueFileCount,
        entryLikeFiles,
        recommendedEdge
      })
      const neighborEdges = createNeighborEdges({
        filesSet,
        dependencyMap
      })

      return {
        id: createCycleId(cyclePath),
        title: buildTitle(files, cyclePath),
        routeLabel: buildRouteLabel(cyclePath),
        detectionSeverity: cycleInfo.severity,
        fixPriority,
        priorityReason,
        priorityDrivers,
        whatIsHappening: buildWhatIsHappening(files),
        whyItMatters: buildWhyItMatters(fixPriority),
        cyclePath,
        files,
        uniqueFileCount,
        entryLikeFiles,
        moduleKeys: uniquePaths(metrics.map((metric) => metric.moduleKey)),
        cycleEdges,
        neighborEdges,
        nearbyFiles: uniquePaths(
          neighborEdges.flatMap((edge) => [edge.source, edge.target])
        ).filter((filePath) => !filesSet.has(filePath)),
        suggestedInvestigation,
        verificationChecks: buildVerificationChecks({
          impactBand,
          changeBand
        })
      }
    })
    .sort((cycleA, cycleB) => {
      const priorityOrder: Record<FixPriority, number> = {
        high: 0,
        medium: 1,
        low: 2
      }

      if (
        priorityOrder[cycleA.fixPriority] !== priorityOrder[cycleB.fixPriority]
      ) {
        return (
          priorityOrder[cycleA.fixPriority] - priorityOrder[cycleB.fixPriority]
        )
      }

      return cycleA.uniqueFileCount - cycleB.uniqueFileCount
    })
}
