import { useMemo } from 'react'

import { useAnalysisData } from '@/shared/hooks/useAnalysisData'
import { createModuleReviewThresholdCalibration } from '@/shared/lib/metric-thresholds'
import { createFileReviewThresholdCalibrationFromAnalysisData } from '@/shared/lib/utils/file-review-story'
import { calculateRiskScore } from '@/shared/lib/utils/risk'

import { useArchitectureFolders } from './useArchitectureMetrics'

import type { ReviewThresholdCalibration } from '@/shared/lib/metric-thresholds'
import type { AnalysisData } from '@/shared/types/analysis'

export function useFileReviewThresholdCalibration(
  analysisDataOverride?: AnalysisData | null
): ReviewThresholdCalibration | undefined {
  const { analysisData } = useAnalysisData()
  const sourceAnalysisData = analysisDataOverride ?? analysisData

  return useMemo(() => {
    if (!sourceAnalysisData) {
      return undefined
    }

    return createFileReviewThresholdCalibrationFromAnalysisData(
      sourceAnalysisData
    )
  }, [sourceAnalysisData])
}

export function useModuleReviewThresholdCalibration():
  | ReviewThresholdCalibration
  | undefined {
  const { data: architectureFoldersData } = useArchitectureFolders()

  return useMemo(() => {
    if (!architectureFoldersData?.folders) {
      return undefined
    }

    return createModuleReviewThresholdCalibration({
      impactScopeValues: architectureFoldersData.folders.map(
        (folder) => folder.ca
      ),
      changePressureValues: architectureFoldersData.folders.map(
        (folder) => folder.evolution.churn30d.relativeChurn
      ),
      externalRelianceValues: architectureFoldersData.folders.map(
        (folder) => folder.ce
      ),
      propagationRiskValues: architectureFoldersData.folders.map((folder) =>
        calculateRiskScore(folder.ca, folder.instability)
      )
    })
  }, [architectureFoldersData?.folders])
}
