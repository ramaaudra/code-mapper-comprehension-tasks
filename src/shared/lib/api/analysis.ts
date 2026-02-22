import type { AnalysisData } from '@/shared/types/analysis'

import { api } from './client'

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
  const { data } = await api.post<{ success: boolean; data: AnalysisData }>(
    '/api/reanalyze'
  )
  return data.data
}

export async function fetchAnalysisData() {
  const { data } = await api.get('/api/data')
  return data
}
