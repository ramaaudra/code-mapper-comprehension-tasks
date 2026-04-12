import { normalizeFileRiskProfile } from '@/shared/lib/utils/risk'

import type { AnalysisData } from '@/shared/types/analysis'
import type { ApiFileRiskProfile } from '@/shared/types/risk'

export interface AnalysisDataWithLegacyRisk extends Omit<
  AnalysisData,
  'riskAnalysis'
> {
  riskAnalysis?: ApiFileRiskProfile[]
}

export function normalizeAnalysisData(
  analysisData: AnalysisDataWithLegacyRisk | null | undefined
): AnalysisData | null {
  if (!analysisData) {
    return null
  }

  if (!analysisData.riskAnalysis) {
    const { riskAnalysis: _riskAnalysis, ...rest } = analysisData
    return rest
  }

  return {
    ...analysisData,
    riskAnalysis: analysisData.riskAnalysis.map((profile) =>
      normalizeFileRiskProfile(profile)
    )
  }
}
