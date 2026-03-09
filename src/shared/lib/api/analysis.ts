import { api } from './client'
import { unwrapApiResponse } from './types'

import type { ApiSuccessResponse } from './types'
import type { AnalysisData } from '@/shared/types/analysis'

export interface ChangesStatus {
  hasChanges: boolean
  lastChangeAt: string | null
  totalChanges: number
}

export async function fetchChangesStatus(): Promise<ChangesStatus> {
  const { data } = await api.get<ApiSuccessResponse<ChangesStatus>>(
    '/api/changes-status'
  )
  return unwrapApiResponse(data)
}

export async function reanalyzeProject(): Promise<AnalysisData> {
  const { data } =
    await api.post<ApiSuccessResponse<AnalysisData>>('/api/reanalyze')
  return unwrapApiResponse(data)
}

export async function fetchAnalysisData(): Promise<AnalysisData> {
  const { data } = await api.get<ApiSuccessResponse<AnalysisData>>('/api/data')
  return unwrapApiResponse(data)
}
