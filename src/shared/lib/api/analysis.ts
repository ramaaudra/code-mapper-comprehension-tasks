import type { AnalysisData } from '@/shared/types/analysis'

import { api } from './client'
import type { ApiSuccessResponse } from './types'

export interface ChangesStatus {
  hasChanges: boolean
  lastChangeAt: string | null
  totalChanges: number
}

export async function fetchChangesStatus(): Promise<ChangesStatus> {
  const { data } = await api.get<{ success: boolean; data: ChangesStatus }>(
    '/api/changes-status'
  )
  return data.data
}

export async function reanalyzeProject(): Promise<AnalysisData> {
  const { data } =
    await api.post<ApiSuccessResponse<AnalysisData>>('/api/reanalyze')
  return data.data
}

export async function fetchAnalysisData(): Promise<AnalysisData> {
  const { data } = await api.get<AnalysisData>('/api/data')
  return data
}
