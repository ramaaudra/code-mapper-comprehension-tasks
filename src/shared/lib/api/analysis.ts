import { api } from './client'
import type { AnalysisData } from '@/shared/types/analysis'

export interface ChangesStatus {
  hasChanges: boolean
  lastChangeAt: string | null
  totalChanges: number
}

export async function fetchChangesStatus(): Promise<ChangesStatus> {
  const { data } = await api.get('/api/changes-status')
  return data
}

export async function reanalyzeProject(): Promise<AnalysisData> {
  const { data } = await api.post('/api/reanalyze')
  return data
}

export async function fetchAnalysisData() {
  const { data } = await api.get('/api/data')
  return data
}
