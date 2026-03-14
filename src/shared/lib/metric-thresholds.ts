import type { HotspotStatus } from '@/shared/types/analysis'
import type { RiskLevel, RiskThresholds } from '@/shared/types/risk'

export type ScientificStatus = 'metric' | 'heuristic'
export type ThresholdSubject = 'file' | 'module'
export type ThresholdCalibrationMode = 'static' | 'repo-relative'
export type ThresholdCalibrationRounding =
  | 'integer-ceil'
  | 'two-decimals'
  | 'half-step'

export type ImpactScope = 'Broad' | 'Moderate' | 'Local'
export type ChangePressure = 'High' | 'Moderate' | 'Low'
export type ExternalReliance = 'High' | 'Moderate' | 'Low'
export type StructuralPosition =
  | 'Foundation-like'
  | 'Balanced'
  | 'Outward-Dependent'

export interface ThresholdBand<TBandId extends string> {
  id: TBandId
  label: string
  min: number
  description: string
  graphLabel?: string
  lowerBoundExclusive?: boolean
}

export interface RepoPercentileCalibrationDefinition<TBandId extends string> {
  strategy: 'repo-percentile'
  minSampleSize: number
  positiveValuesOnly?: boolean
  rounding: ThresholdCalibrationRounding
  bandPercentiles: Partial<Record<TBandId, number>>
}

export interface ThresholdCatalog<TBandId extends string> {
  id: string
  label: string
  summary: string
  sourceMetricLabel: string
  scientificStatus: ScientificStatus
  scientificStatusNote: string
  whyItExists: string
  scope: ThresholdSubject | 'repo-relative'
  formula?: string
  bands: readonly ThresholdBand<TBandId>[]
  calibration?: RepoPercentileCalibrationDefinition<TBandId>
}

export interface ResolvedThresholdCatalog<
  TBandId extends string
> extends ThresholdCatalog<TBandId> {
  calibrationMode: ThresholdCalibrationMode
  sampleSize: number
}

export interface ReviewThresholdCalibration {
  impactScope: Partial<
    Record<ThresholdSubject, ResolvedThresholdCatalog<ImpactScope>>
  >
  changePressure: Partial<
    Record<ThresholdSubject, ResolvedThresholdCatalog<ChangePressure>>
  >
  externalReliance: Partial<
    Record<ThresholdSubject, ResolvedThresholdCatalog<ExternalReliance>>
  >
  propagationRisk?: ResolvedThresholdCatalog<RiskLevel>
  blastRadius?: ResolvedThresholdCatalog<RiskLevel>
}

const impactScopeCatalogByKind: Record<
  ThresholdSubject,
  ThresholdCatalog<ImpactScope>
> = {
  file: {
    id: 'impact-scope',
    label: 'Impact Scope',
    summary:
      'Readable review-scope band derived from Dependents (Ca) for a single file.',
    sourceMetricLabel: 'Dependents (Ca)',
    scientificStatus: 'heuristic',
    scientificStatusNote:
      'Impact Scope is a product heuristic for review scope based on Dependents (Ca). When enough repository samples exist, its bands can be calibrated repo-relatively; they are not universal scientific cutoffs.',
    whyItExists:
      'It turns raw fan-in into readable review-scope bands so developers can judge coordination and testing breadth faster.',
    scope: 'file',
    calibration: {
      strategy: 'repo-percentile',
      minSampleSize: 5,
      positiveValuesOnly: true,
      rounding: 'integer-ceil',
      bandPercentiles: {
        Broad: 0.85,
        Moderate: 0.5
      }
    },
    bands: [
      {
        id: 'Broad',
        label: 'Broad Impact',
        min: 15,
        description:
          'Many other files depend on this file, so review and verification can spread broadly.'
      },
      {
        id: 'Moderate',
        label: 'Moderate Impact',
        min: 5,
        description:
          'Several nearby files depend on this file, so some coordination is likely.'
      },
      {
        id: 'Local',
        label: 'Local Impact',
        min: 0,
        description:
          'Few or no downstream files depend on this file, so review scope should stay more contained.'
      }
    ]
  },
  module: {
    id: 'impact-scope',
    label: 'Impact Scope',
    summary:
      'Readable review-scope band derived from Dependents (Ca) for a module boundary.',
    sourceMetricLabel: 'Dependents (Ca)',
    scientificStatus: 'heuristic',
    scientificStatusNote:
      'Impact Scope is a product heuristic for review scope based on Dependents (Ca). When enough repository samples exist, its bands can be calibrated repo-relatively; they are not universal scientific cutoffs.',
    whyItExists:
      'It turns raw fan-in into readable review-scope bands so developers can judge coordination and testing breadth faster.',
    scope: 'module',
    calibration: {
      strategy: 'repo-percentile',
      minSampleSize: 5,
      positiveValuesOnly: true,
      rounding: 'integer-ceil',
      bandPercentiles: {
        Broad: 0.85,
        Moderate: 0.5
      }
    },
    bands: [
      {
        id: 'Broad',
        label: 'Broad Impact',
        min: 30,
        description:
          'Many incoming cross-module dependency edges point into this module, so coordination and regression scope can spread widely.'
      },
      {
        id: 'Moderate',
        label: 'Moderate Impact',
        min: 10,
        description:
          'A noticeable set of incoming cross-module dependency edges points into this module, so nearby coordination is still likely.'
      },
      {
        id: 'Local',
        label: 'Local Impact',
        min: 0,
        description:
          'Few incoming cross-module dependency edges point into this module, so impact should stay more localized.'
      }
    ]
  }
}

export const changePressureThresholdCatalog: ThresholdCatalog<ChangePressure> =
  {
    id: 'change-pressure',
    label: 'Change Activity',
    summary:
      'Readable activity band derived from Relative Churn (30d) for recent change pressure.',
    sourceMetricLabel: 'Relative Churn (30d)',
    scientificStatus: 'heuristic',
    scientificStatusNote:
      'Change Activity is a product heuristic based on Relative Churn (30d). When enough repository samples exist, its bands can be calibrated repo-relatively; they are not universal stability thresholds.',
    whyItExists:
      'It turns raw normalized churn into readable activity bands so recently unstable areas stand out without forcing users to read raw percentages first.',
    scope: 'file',
    calibration: {
      strategy: 'repo-percentile',
      minSampleSize: 5,
      positiveValuesOnly: true,
      rounding: 'two-decimals',
      bandPercentiles: {
        High: 0.85,
        Moderate: 0.5
      }
    },
    bands: [
      {
        id: 'High',
        label: 'High Activity',
        min: 0.3,
        description:
          'This area is seeing heavy recent change relative to its current size.'
      },
      {
        id: 'Moderate',
        label: 'Moderate Activity',
        min: 0.1,
        description:
          'This area is still changing noticeably, but not at the highest recent rate.'
      },
      {
        id: 'Low',
        label: 'Low Activity',
        min: 0,
        description:
          'Recent normalized change pressure is comparatively lower in this area.'
      }
    ]
  }

export const externalRelianceThresholdCatalog: ThresholdCatalog<ExternalReliance> =
  {
    id: 'external-reliance',
    label: 'Dependencies',
    summary:
      'Readable coupling band derived from Dependencies (Ce) for outward reliance.',
    sourceMetricLabel: 'Dependencies (Ce)',
    scientificStatus: 'heuristic',
    scientificStatusNote:
      'Dependencies is a readable coupling heuristic based on Ce, not a universal architectural defect cutoff.',
    whyItExists:
      'It turns raw outgoing coupling into a simpler signal so developers can quickly see whether a change relies on many external internals.',
    scope: 'file',
    calibration: {
      strategy: 'repo-percentile',
      minSampleSize: 5,
      positiveValuesOnly: true,
      rounding: 'integer-ceil',
      bandPercentiles: {
        High: 0.85,
        Moderate: 0.5
      }
    },
    bands: [
      {
        id: 'High',
        label: 'Many Dependencies',
        min: 10,
        description:
          'This area relies on many internal dependencies, so changing it in isolation will be harder.'
      },
      {
        id: 'Moderate',
        label: 'Some Dependencies',
        min: 4,
        description:
          'This area has a noticeable amount of outgoing reliance and deserves a quick dependency review.'
      },
      {
        id: 'Low',
        label: 'Few Dependencies',
        min: 0,
        description:
          'This area has fewer outgoing dependencies, so isolated changes are more plausible.'
      }
    ]
  }

export const structuralPositionThresholdCatalog: ThresholdCatalog<StructuralPosition> =
  {
    id: 'structural-position',
    label: 'Architecture Role',
    summary: 'Readable structural-position band derived from Instability (I).',
    sourceMetricLabel: 'Instability (I)',
    scientificStatus: 'heuristic',
    scientificStatusNote:
      'Architecture Role is a readable interpretation of Instability bands, not a direct defect score.',
    whyItExists:
      'It translates Instability into role-oriented language so developers can reason about shared foundations versus outward-facing adapters faster.',
    scope: 'file',
    formula: 'I = Ce / (Ca + Ce)',
    bands: [
      {
        id: 'Outward-Dependent',
        label: 'Dependency-heavy Role',
        min: 0.7,
        description:
          'Outgoing reliance dominates, which is common in UI, route, and adapter layers.'
      },
      {
        id: 'Balanced',
        label: 'Balanced Role',
        min: 0.4,
        description:
          'Incoming and outgoing coupling are both meaningful, so review both dependents and dependencies.'
      },
      {
        id: 'Foundation-like',
        label: 'Foundation Role',
        min: 0,
        description:
          'Incoming reliance dominates, which is common in shared or foundational layers.'
      }
    ]
  }

export const propagationRiskThresholdCatalog: ThresholdCatalog<RiskLevel> = {
  id: 'propagation-risk',
  label: 'Propagation Risk',
  summary:
    'A derived heuristic that estimates how strongly change may spread through dependents.',
  sourceMetricLabel: 'Ca x I',
  scientificStatus: 'heuristic',
  scientificStatusNote:
    'Propagation Risk is a product heuristic for review prioritization, not a universal scientific cutoff.',
  whyItExists:
    'It translates Ca x I into readable priority bands so shared, spread-sensitive areas are easier to triage before a change.',
  scope: 'module',
  formula: 'Propagation Risk = Ca x I',
  calibration: {
    strategy: 'repo-percentile',
    minSampleSize: 5,
    positiveValuesOnly: true,
    rounding: 'half-step',
    bandPercentiles: {
      critical: 0.9,
      high: 0.75,
      medium: 0.5
    }
  },
  bands: [
    {
      id: 'critical',
      label: 'Critical',
      min: 30,
      description:
        'Dependents and outward dependency pressure can spread change impact widely.'
    },
    {
      id: 'high',
      label: 'High',
      min: 15,
      description:
        'Review dependents and outgoing dependency pressure before changing this item.'
    },
    {
      id: 'medium',
      label: 'Medium',
      min: 5,
      description:
        'Changes may travel through part of the dependency graph and deserve review.'
    },
    {
      id: 'low',
      label: 'Low',
      min: 0,
      description:
        'Outward dependency pressure is limited, but Dependents (Ca) may still widen review scope.'
    }
  ]
}

export const blastRadiusThresholdCatalog: ThresholdCatalog<RiskLevel> = {
  id: 'blast-radius',
  label: 'Blast Radius',
  summary:
    'A file-level heuristic that estimates the nearby verification scope after a change.',
  sourceMetricLabel: 'Ca + (Ce x 0.5)',
  scientificStatus: 'heuristic',
  scientificStatusNote:
    'Blast Radius is a product heuristic for local verification scope. When enough repository samples exist, its bands can be calibrated repo-relatively; they are not universal engineering standards.',
  whyItExists:
    'It turns local coupling into a readable verification-scope band so developers can estimate nearby testing effort before editing a file.',
  scope: 'file',
  formula: 'Blast Radius = Ca + (Ce x 0.5)',
  calibration: {
    strategy: 'repo-percentile',
    minSampleSize: 5,
    positiveValuesOnly: true,
    rounding: 'half-step',
    bandPercentiles: {
      critical: 0.9,
      high: 0.7,
      medium: 0.5
    }
  },
  bands: [
    {
      id: 'critical',
      label: 'Critical Blast Radius',
      min: 15,
      description:
        'Editing this file may require verification across many nearby connected files.',
      lowerBoundExclusive: true
    },
    {
      id: 'high',
      label: 'High Blast Radius',
      min: 9,
      description: 'Plan targeted regression checks after editing this file.'
    },
    {
      id: 'medium',
      label: 'Medium Blast Radius',
      min: 4,
      description:
        'Review nearby dependencies before refactoring because impact is not fully local.'
    },
    {
      id: 'low',
      label: 'Low Blast Radius',
      min: 0,
      description: 'Effects should stay more localized after a change.'
    }
  ]
}

export const hotspotStatusThresholdCatalog: ThresholdCatalog<HotspotStatus> = {
  id: 'hotspot-status',
  label: 'Hotspot Status',
  summary:
    'A readable review band built from hotspot score percentiles in the current repository.',
  sourceMetricLabel: 'Hotspot Percentile',
  scientificStatus: 'heuristic',
  scientificStatusNote:
    'Hotspot Status is a repo-relative prioritization heuristic, not proof that an area is defective.',
  whyItExists:
    'It translates repo-relative hotspot percentiles into readable review bands so teams can rank attention without reading raw scores first.',
  scope: 'repo-relative',
  bands: [
    {
      id: 'critical-hotspot',
      label: 'Highest hotspot band',
      graphLabel: 'Highest hotspot band',
      min: 0.85,
      description:
        'This item sits in the highest repo-relative hotspot band and deserves the broadest review attention.'
    },
    {
      id: 'high-review-needed',
      label: 'Elevated hotspot band',
      graphLabel: 'Needs closer review',
      min: 0.6,
      description:
        'This item is above the normal hotspot band, so changes here deserve closer review.'
    },
    {
      id: 'active',
      label: 'Active change band',
      graphLabel: 'Recently active',
      min: 0.3,
      description:
        'This item shows recent change activity, but it is not in the strongest hotspot band.'
    },
    {
      id: 'stable',
      label: 'Lower hotspot band',
      graphLabel: 'Lower hotspot band',
      min: 0,
      description:
        'This item sits in a lower hotspot band relative to the rest of the repository.'
    }
  ]
}

const thresholdCatalogDefinitions = {
  changePressure: changePressureThresholdCatalog,
  externalReliance: externalRelianceThresholdCatalog,
  structuralPosition: structuralPositionThresholdCatalog,
  propagationRisk: propagationRiskThresholdCatalog,
  blastRadius: blastRadiusThresholdCatalog,
  hotspotStatus: hotspotStatusThresholdCatalog
} as const

export type ReviewSignalDefinitionId = keyof typeof thresholdCatalogDefinitions

function formatThresholdNumber(value: number): string {
  if (Number.isInteger(value)) {
    return `${value}`
  }

  return value.toFixed(2).replace(/\.?0+$/, '')
}

function roundCalibratedThreshold(
  value: number,
  rounding: ThresholdCalibrationRounding
): number {
  switch (rounding) {
    case 'integer-ceil':
      return Math.ceil(value)
    case 'half-step':
      return Math.ceil(value * 2) / 2
    default:
      return Number(value.toFixed(2))
  }
}

function getNearestRankValue(values: number[], percentile: number): number {
  if (values.length === 0) {
    return 0
  }

  const clampedPercentile = Math.min(Math.max(percentile, 0), 1)
  const rank = Math.max(1, Math.ceil(values.length * clampedPercentile))
  return values[Math.min(rank - 1, values.length - 1)] ?? 0
}

function toSortedCalibrationSample(
  values: number[],
  positiveValuesOnly: boolean
): number[] {
  return values
    .filter((value) => Number.isFinite(value))
    .filter((value) => (positiveValuesOnly ? value > 0 : true))
    .sort((a, b) => a - b)
}

function buildStaticResolvedCatalog<TBandId extends string>(
  catalog: ThresholdCatalog<TBandId>
): ResolvedThresholdCatalog<TBandId> {
  return {
    ...catalog,
    bands: [...catalog.bands],
    calibrationMode: 'static',
    sampleSize: 0
  }
}

function buildResolvedThresholdCatalog<TBandId extends string>(
  catalog: ThresholdCatalog<TBandId>,
  values: number[]
): ResolvedThresholdCatalog<TBandId> {
  const calibration = catalog.calibration

  if (!calibration) {
    return buildStaticResolvedCatalog(catalog)
  }

  const sample = toSortedCalibrationSample(
    values,
    calibration.positiveValuesOnly ?? false
  )

  if (sample.length < calibration.minSampleSize) {
    return buildStaticResolvedCatalog(catalog)
  }

  const bandMinimums = new Map<TBandId, number>(
    catalog.bands.map((band) => [band.id, band.min])
  )

  for (const [bandId, percentile] of Object.entries(
    calibration.bandPercentiles
  )) {
    if (percentile == null) {
      continue
    }

    const percentileValue = percentile as number

    bandMinimums.set(
      bandId as TBandId,
      roundCalibratedThreshold(
        getNearestRankValue(sample, percentileValue),
        calibration.rounding
      )
    )
  }

  const resolvedBands = catalog.bands.map((band) => ({
    ...band,
    min: bandMinimums.get(band.id) ?? band.min
  }))

  if (!hasStrictlyDescendingBandMinimums(resolvedBands)) {
    return buildStaticResolvedCatalog(catalog)
  }

  return {
    ...catalog,
    bands: resolvedBands,
    calibrationMode: 'repo-relative',
    sampleSize: sample.length
  }
}

function hasStrictlyDescendingBandMinimums<TBandId extends string>(
  bands: readonly ThresholdBand<TBandId>[]
): boolean {
  for (let index = 1; index < bands.length; index += 1) {
    const previousBand = bands[index - 1]
    const currentBand = bands[index]

    if (!previousBand || !currentBand) {
      continue
    }

    if (currentBand.min >= previousBand.min) {
      return false
    }
  }

  return true
}

function getResolvedImpactScopeCatalog(
  kind: ThresholdSubject,
  calibration?: ReviewThresholdCalibration
): ResolvedThresholdCatalog<ImpactScope> {
  return (
    calibration?.impactScope[kind] ??
    buildStaticResolvedCatalog(impactScopeCatalogByKind[kind])
  )
}

function getResolvedChangePressureCatalog(
  kind: ThresholdSubject,
  calibration?: ReviewThresholdCalibration
): ResolvedThresholdCatalog<ChangePressure> {
  return (
    calibration?.changePressure[kind] ??
    buildStaticResolvedCatalog(changePressureThresholdCatalog)
  )
}

function getResolvedExternalRelianceCatalog(
  kind: ThresholdSubject,
  calibration?: ReviewThresholdCalibration
): ResolvedThresholdCatalog<ExternalReliance> {
  return (
    calibration?.externalReliance[kind] ??
    buildStaticResolvedCatalog(externalRelianceThresholdCatalog)
  )
}

function getResolvedPropagationRiskCatalog(
  calibration?: ReviewThresholdCalibration
): ResolvedThresholdCatalog<RiskLevel> {
  return (
    calibration?.propagationRisk ??
    buildStaticResolvedCatalog(propagationRiskThresholdCatalog)
  )
}

function getResolvedBlastRadiusCatalog(
  calibration?: ReviewThresholdCalibration
): ResolvedThresholdCatalog<RiskLevel> {
  return (
    calibration?.blastRadius ??
    buildStaticResolvedCatalog(blastRadiusThresholdCatalog)
  )
}

export function resolveThresholdBand<TBandId extends string>(
  value: number,
  bands: readonly ThresholdBand<TBandId>[]
): ThresholdBand<TBandId> {
  const matchedBand = bands.find((band) =>
    band.lowerBoundExclusive ? value > band.min : value >= band.min
  )
  const fallbackBand = bands.at(-1)

  if (matchedBand) {
    return matchedBand
  }

  if (fallbackBand) {
    return fallbackBand
  }

  throw new Error('Threshold catalog must define at least one band')
}

export function getThresholdBandById<TBandId extends string>(
  bands: readonly ThresholdBand<TBandId>[],
  bandId: TBandId
): ThresholdBand<TBandId> | undefined {
  return bands.find((band) => band.id === bandId)
}

function getRequiredBandById<TBandId extends string>(
  bands: readonly ThresholdBand<TBandId>[],
  bandId: TBandId
): ThresholdBand<TBandId> {
  const band = getThresholdBandById(bands, bandId)

  if (!band) {
    throw new Error(`Band "${bandId}" is not defined in the threshold catalog`)
  }

  return band
}

export function formatThresholdBandRange<TBandId extends string>(
  bands: readonly ThresholdBand<TBandId>[],
  bandId: TBandId
): string {
  const index = bands.findIndex((band) => band.id === bandId)

  if (index === -1) {
    return ''
  }

  const band = bands[index]
  const higherBand = index > 0 ? bands[index - 1] : undefined

  if (!band) {
    return ''
  }

  if (!higherBand) {
    const comparator = band.lowerBoundExclusive ? '>' : '>='
    return `${comparator}${formatThresholdNumber(band.min)}`
  }

  const upperComparator = higherBand.lowerBoundExclusive ? '<=' : '<'

  if (band.min <= 0 && !band.lowerBoundExclusive) {
    return `${upperComparator}${formatThresholdNumber(higherBand.min)}`
  }

  const lowerText = band.lowerBoundExclusive
    ? `>${formatThresholdNumber(band.min)}`
    : formatThresholdNumber(band.min)

  return `${lowerText} to ${upperComparator}${formatThresholdNumber(higherBand.min)}`
}

export function formatReviewSignalBandRange(
  signalId:
    | 'changePressure'
    | 'externalReliance'
    | 'structuralPosition'
    | 'propagationRisk'
    | 'blastRadius'
    | 'hotspotStatus',
  bandId: string,
  calibration?: ReviewThresholdCalibration
): string
export function formatReviewSignalBandRange(
  signalId: 'impactScope',
  bandId: string,
  context: ThresholdSubject,
  calibration?: ReviewThresholdCalibration
): string
export function formatReviewSignalBandRange(
  signalId: ReviewSignalDefinitionId | 'impactScope',
  bandId: string,
  context?: ThresholdSubject | ReviewThresholdCalibration,
  calibration?: ReviewThresholdCalibration
): string {
  if (signalId === 'impactScope') {
    const thresholdContext = typeof context === 'string' ? context : 'file'
    const thresholdCalibration =
      typeof context === 'string' ? calibration : context

    return formatThresholdBandRange(
      getResolvedImpactScopeCatalog(thresholdContext, thresholdCalibration)
        .bands,
      bandId as ImpactScope
    )
  }

  const thresholdCalibration =
    typeof context === 'string' ? calibration : context

  if (signalId === 'changePressure') {
    return formatThresholdBandRange(
      getResolvedChangePressureCatalog('file', thresholdCalibration).bands,
      bandId as ChangePressure
    )
  }

  if (signalId === 'externalReliance') {
    return formatThresholdBandRange(
      getResolvedExternalRelianceCatalog('file', thresholdCalibration).bands,
      bandId as ExternalReliance
    )
  }

  if (signalId === 'propagationRisk') {
    return formatThresholdBandRange(
      getResolvedPropagationRiskCatalog(thresholdCalibration).bands,
      bandId as RiskLevel
    )
  }

  if (signalId === 'blastRadius') {
    return formatThresholdBandRange(
      getResolvedBlastRadiusCatalog(thresholdCalibration).bands,
      bandId as RiskLevel
    )
  }

  return formatThresholdBandRange(
    getReviewSignalDefinition(signalId)
      .bands as readonly ThresholdBand<string>[],
    bandId
  )
}

export function getImpactScopeThresholdCatalog(
  kind: ThresholdSubject
): ThresholdCatalog<ImpactScope> {
  return impactScopeCatalogByKind[kind]
}

interface FileReviewThresholdCalibrationInput {
  impactScopeValues: number[]
  changePressureValues: number[]
  externalRelianceValues?: number[]
  blastRadiusValues?: number[]
}

interface ModuleReviewThresholdCalibrationInput {
  impactScopeValues: number[]
  changePressureValues: number[]
  externalRelianceValues?: number[]
  propagationRiskValues?: number[]
}

export function createFileReviewThresholdCalibration(
  input: FileReviewThresholdCalibrationInput
): ReviewThresholdCalibration {
  const externalRelianceValues = input.externalRelianceValues ?? []
  const blastRadiusValues = input.blastRadiusValues ?? []

  return {
    impactScope: {
      file: buildResolvedThresholdCatalog(
        impactScopeCatalogByKind.file,
        input.impactScopeValues
      )
    },
    changePressure: {
      file: buildResolvedThresholdCatalog(
        changePressureThresholdCatalog,
        input.changePressureValues
      )
    },
    externalReliance: {
      file: buildResolvedThresholdCatalog(
        externalRelianceThresholdCatalog,
        externalRelianceValues
      )
    },
    blastRadius: buildResolvedThresholdCatalog(
      blastRadiusThresholdCatalog,
      blastRadiusValues
    )
  }
}

export function createModuleReviewThresholdCalibration(
  input: ModuleReviewThresholdCalibrationInput
): ReviewThresholdCalibration {
  const externalRelianceValues = input.externalRelianceValues ?? []
  const propagationRiskValues = input.propagationRiskValues ?? []

  return {
    impactScope: {
      module: buildResolvedThresholdCatalog(
        impactScopeCatalogByKind.module,
        input.impactScopeValues
      )
    },
    changePressure: {
      module: buildResolvedThresholdCatalog(
        changePressureThresholdCatalog,
        input.changePressureValues
      )
    },
    externalReliance: {
      module: buildResolvedThresholdCatalog(
        externalRelianceThresholdCatalog,
        externalRelianceValues
      )
    },
    propagationRisk: buildResolvedThresholdCatalog(
      propagationRiskThresholdCatalog,
      propagationRiskValues
    )
  }
}

export function getImpactScopeThresholds(kind: ThresholdSubject): {
  broad: number
  moderate: number
}
export function getImpactScopeThresholds(
  kind: ThresholdSubject,
  calibration?: ReviewThresholdCalibration
): {
  broad: number
  moderate: number
} {
  const catalog = getResolvedImpactScopeCatalog(kind, calibration)

  return {
    broad: getRequiredBandById(catalog.bands, 'Broad').min,
    moderate: getRequiredBandById(catalog.bands, 'Moderate').min
  }
}

export function resolveImpactScope(
  ca: number,
  kind: ThresholdSubject,
  calibration?: ReviewThresholdCalibration
): ImpactScope {
  return resolveThresholdBand(
    ca,
    getResolvedImpactScopeCatalog(kind, calibration).bands
  ).id
}

export function resolveChangePressure(
  relativeChurn30d: number,
  calibration?: ReviewThresholdCalibration,
  kind: ThresholdSubject = 'file'
): ChangePressure {
  return resolveThresholdBand(
    relativeChurn30d,
    getResolvedChangePressureCatalog(kind, calibration).bands
  ).id
}

export function resolveExternalReliance(
  ce: number,
  calibration?: ReviewThresholdCalibration,
  kind: ThresholdSubject = 'file'
): ExternalReliance {
  return resolveThresholdBand(
    ce,
    getResolvedExternalRelianceCatalog(kind, calibration).bands
  ).id
}

export function resolveStructuralPosition(
  instability: number
): StructuralPosition {
  return resolveThresholdBand(
    instability,
    structuralPositionThresholdCatalog.bands
  ).id
}

export function resolvePropagationRiskLevel(
  score: number,
  calibration?: ReviewThresholdCalibration
): RiskLevel {
  return resolveThresholdBand(
    score,
    getResolvedPropagationRiskCatalog(calibration).bands
  ).id
}

export function resolveBlastRadiusLevel(
  score: number,
  hasCycle: boolean,
  calibration?: ReviewThresholdCalibration
): RiskLevel {
  if (hasCycle) {
    return 'critical'
  }

  return resolveThresholdBand(
    score,
    getResolvedBlastRadiusCatalog(calibration).bands
  ).id
}

export function getStructuralPositionBands() {
  return structuralPositionThresholdCatalog.bands
}

export function getPropagationRiskThresholds(
  calibration?: ReviewThresholdCalibration
): RiskThresholds {
  const catalog = getResolvedPropagationRiskCatalog(calibration)

  return {
    CRITICAL: getRequiredBandById(catalog.bands, 'critical').min,
    HIGH: getRequiredBandById(catalog.bands, 'high').min,
    MEDIUM: getRequiredBandById(catalog.bands, 'medium').min
  }
}

export function getReviewSignalDefinition<
  TSignal extends ReviewSignalDefinitionId
>(signalId: TSignal): (typeof thresholdCatalogDefinitions)[TSignal] {
  return thresholdCatalogDefinitions[signalId]
}

export function getHotspotStatusLabel(status: HotspotStatus): string {
  return getRequiredBandById(hotspotStatusThresholdCatalog.bands, status).label
}

export function getHotspotStatusPriority(status: HotspotStatus): number {
  const bandIndex = hotspotStatusThresholdCatalog.bands.findIndex(
    (band) => band.id === status
  )

  if (bandIndex === -1) {
    return 0
  }

  return hotspotStatusThresholdCatalog.bands.length - bandIndex
}

export function isActionableHotspotStatus(status: HotspotStatus): boolean {
  return status === 'critical-hotspot' || status === 'high-review-needed'
}

export function getGraphHotspotStatusLabel(status: HotspotStatus): string {
  const band = getRequiredBandById(hotspotStatusThresholdCatalog.bands, status)
  return band.graphLabel ?? band.label
}

export function getHotspotStatusDescription(status: HotspotStatus): string {
  return getRequiredBandById(hotspotStatusThresholdCatalog.bands, status)
    .description
}

export function getPropagationRiskBandLabel(level: RiskLevel): string {
  return getRequiredBandById(propagationRiskThresholdCatalog.bands, level).label
}

export function getPropagationRiskBandDescription(level: RiskLevel): string {
  return getRequiredBandById(propagationRiskThresholdCatalog.bands, level)
    .description
}

export function getBlastRadiusBandLabel(level: RiskLevel): string {
  return getRequiredBandById(blastRadiusThresholdCatalog.bands, level).label
}

export function getBlastRadiusBandDescription(level: RiskLevel): string {
  return getRequiredBandById(blastRadiusThresholdCatalog.bands, level)
    .description
}

export function getImpactScopeBandLabel(impactScope: ImpactScope): string {
  return getRequiredBandById(impactScopeCatalogByKind.file.bands, impactScope)
    .label
}

export function getChangePressureBandLabel(
  changePressure: ChangePressure
): string {
  return getRequiredBandById(
    changePressureThresholdCatalog.bands,
    changePressure
  ).label
}

export function getExternalRelianceBandLabel(
  externalReliance: ExternalReliance
): string {
  return getRequiredBandById(
    externalRelianceThresholdCatalog.bands,
    externalReliance
  ).label
}

export function getStructuralPositionBandLabel(
  structuralPosition: StructuralPosition
): string {
  return getRequiredBandById(
    structuralPositionThresholdCatalog.bands,
    structuralPosition
  ).label
}

export function getAssessmentMethodItemsFromCatalog(): string[] {
  return [
    `${changePressureThresholdCatalog.label} uses ${changePressureThresholdCatalog.sourceMetricLabel}.`,
    `${impactScopeCatalogByKind.file.label} uses ${impactScopeCatalogByKind.file.sourceMetricLabel}.`,
    `${externalRelianceThresholdCatalog.label} uses Ce.`,
    `${structuralPositionThresholdCatalog.label} uses ${structuralPositionThresholdCatalog.sourceMetricLabel}.`,
    'Decision labels are product heuristics built from repository signals, not universal scientific thresholds.'
  ]
}

export const PROPAGATION_RISK_THRESHOLDS: RiskThresholds = {
  CRITICAL: getRequiredBandById(
    propagationRiskThresholdCatalog.bands,
    'critical'
  ).min,
  HIGH: getRequiredBandById(propagationRiskThresholdCatalog.bands, 'high').min,
  MEDIUM: getRequiredBandById(propagationRiskThresholdCatalog.bands, 'medium')
    .min
}

export const BLAST_RADIUS_THRESHOLDS = {
  CRITICAL: getRequiredBandById(blastRadiusThresholdCatalog.bands, 'critical')
    .min,
  HIGH: getRequiredBandById(blastRadiusThresholdCatalog.bands, 'high').min,
  MEDIUM: getRequiredBandById(blastRadiusThresholdCatalog.bands, 'medium').min,
  LOW: getRequiredBandById(blastRadiusThresholdCatalog.bands, 'low').min
} as const

export const HOTSPOT_STATUS_THRESHOLDS = {
  CRITICAL: getRequiredBandById(
    hotspotStatusThresholdCatalog.bands,
    'critical-hotspot'
  ).min,
  HIGH: getRequiredBandById(
    hotspotStatusThresholdCatalog.bands,
    'high-review-needed'
  ).min,
  ACTIVE: getRequiredBandById(hotspotStatusThresholdCatalog.bands, 'active').min
} as const
