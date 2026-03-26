import { createFileReviewThresholdCalibration } from '@/shared/lib/metric-thresholds'

import {
  createDecisionAssessment,
  getReviewPriorityTone
} from './decision-assessment'
import { isEvolutionaryMetricsAvailable } from './evolution'
import { normalizePath } from './file-status'

import type { DecisionAssessment, ReviewPriority } from './decision-assessment'
import type { ReviewThresholdCalibration } from '@/shared/lib/metric-thresholds'
import type {
  AnalysisData,
  AnalysisNode,
  FileEvolutionMetrics
} from '@/shared/types/analysis'
import type { FileRiskProfile } from '@/shared/types/risk'

export type FileReviewStoryTone = 'info' | 'warning' | 'danger' | 'success'

export interface FileReviewStory {
  path: string
  assessment: DecisionAssessment
  graphBadgeLabel: string | null
  badgeTone: FileReviewStoryTone
  shortReason: string
  showGraphBadge: boolean
  showTreeIndicator: boolean
  alwaysShowTreeIndicator: boolean
}

interface CreateFileReviewStoryInput {
  filePath: string
  riskProfile: FileRiskProfile
  evolutionMetrics?: FileEvolutionMetrics | null
  changeHistoryAvailable?: boolean
  hasCycle?: boolean
  isOrphan?: boolean
  thresholdCalibration?: ReviewThresholdCalibration
}

function mapDecisionToneToStoryTone(
  priority: ReviewPriority
): FileReviewStoryTone {
  const tone = getReviewPriorityTone(priority)

  switch (tone) {
    case 'danger':
      return 'danger'
    case 'warning':
      return 'warning'
    case 'success':
      return 'success'
    default:
      return 'info'
  }
}

function createGraphBadgeLabel(assessment: DecisionAssessment): string | null {
  if (
    assessment.title === 'Circular Dependency' ||
    assessment.title === 'Possibly Unreachable'
  ) {
    return null
  }

  if (assessment.reviewPriority === 'Low Review Priority') {
    return null
  }

  switch (assessment.title) {
    case 'Critical Hotspot':
      return 'Critical Hotspot'
    case 'Active but Local':
      return 'Active Area'
    case 'Shared Foundation':
      return 'Shared Change'
    default:
      return 'Local Change'
  }
}

function buildNodeAliasMap(nodes: AnalysisNode[]): Map<string, string> {
  const aliases = new Map<string, string>()

  nodes.forEach((node) => {
    if (!node?.id) {
      return
    }

    const normalizedId = normalizePath(node.id)
    const normalizedLabel =
      typeof node.label === 'string' ? normalizePath(node.label) : null

    if (normalizedLabel) {
      aliases.set(normalizedId, normalizedLabel)
    }
  })

  return aliases
}

export function createFileReviewThresholdCalibrationFromAnalysisData(
  analysisData: AnalysisData | null | undefined
): ReviewThresholdCalibration | undefined {
  if (!analysisData) {
    return undefined
  }

  const riskAnalysis = analysisData.riskAnalysis ?? []

  return createFileReviewThresholdCalibration({
    impactScopeValues: riskAnalysis.map((profile) => profile.factors.ca),
    changePressureValues: Object.values(
      analysisData.evolutionaryMetrics.files
    ).map((file) => file.churn30d.relativeChurn),
    externalRelianceValues: riskAnalysis.map((profile) => profile.factors.ce),
    blastRadiusValues: riskAnalysis.map(
      (profile) => profile.factors.ca + profile.factors.ce * 0.5
    )
  })
}

export function createFileReviewStory(
  input: CreateFileReviewStoryInput
): FileReviewStory {
  const {
    filePath,
    riskProfile,
    evolutionMetrics,
    changeHistoryAvailable = true,
    hasCycle = false,
    isOrphan = false,
    thresholdCalibration
  } = input

  const assessment = createDecisionAssessment({
    kind: 'file',
    hasCycle,
    isOrphan,
    ca: riskProfile.factors.ca,
    ce: riskProfile.factors.ce,
    instability: riskProfile.factors.instability,
    relativeChurn30d: evolutionMetrics?.churn30d.relativeChurn ?? 0,
    changeHistoryAvailable,
    thresholdCalibration
  })
  const graphBadgeLabel = createGraphBadgeLabel(assessment)
  const badgeTone = mapDecisionToneToStoryTone(assessment.reviewPriority)
  const showTreeIndicator =
    !hasCycle &&
    !isOrphan &&
    assessment.reviewPriority !== 'Low Review Priority'
  const alwaysShowTreeIndicator =
    showTreeIndicator &&
    (assessment.reviewPriority === 'Critical Review Priority' ||
      assessment.reviewPriority === 'High Review Priority')

  return {
    path: normalizePath(filePath),
    assessment,
    graphBadgeLabel,
    badgeTone,
    shortReason: assessment.topDrivers[0] ?? assessment.summary,
    showGraphBadge: graphBadgeLabel != null,
    showTreeIndicator,
    alwaysShowTreeIndicator
  }
}

export function buildFileReviewStoryMap(
  analysisData: AnalysisData | null | undefined
): Map<string, FileReviewStory> {
  if (!analysisData?.riskAnalysis?.length) {
    return new Map<string, FileReviewStory>()
  }

  const storyMap = new Map<string, FileReviewStory>()
  const thresholdCalibration =
    createFileReviewThresholdCalibrationFromAnalysisData(analysisData)
  const changeHistoryAvailable = isEvolutionaryMetricsAvailable(
    analysisData.evolutionaryMetrics.summary
  )
  const aliases = buildNodeAliasMap(analysisData.nodes)
  const filesInCycle = new Set(
    analysisData.issues.circularDependencies.flatMap((dependency) =>
      dependency.files.map((file) => normalizePath(file))
    )
  )
  const orphanFiles = new Set(
    analysisData.issues.orphans.map((file) => normalizePath(file))
  )

  analysisData.riskAnalysis.forEach((riskProfile) => {
    const normalizedPath = normalizePath(riskProfile.file)
    const evolutionMetrics =
      analysisData.evolutionaryMetrics.files[riskProfile.file] ??
      analysisData.evolutionaryMetrics.files[normalizedPath] ??
      null
    const story = createFileReviewStory({
      filePath: normalizedPath,
      riskProfile,
      evolutionMetrics,
      changeHistoryAvailable,
      hasCycle: filesInCycle.has(normalizedPath),
      isOrphan: orphanFiles.has(normalizedPath),
      thresholdCalibration
    })

    storyMap.set(normalizedPath, story)

    const alias = aliases.get(normalizedPath)
    if (alias) {
      storyMap.set(alias, story)
    }
  })

  return storyMap
}
