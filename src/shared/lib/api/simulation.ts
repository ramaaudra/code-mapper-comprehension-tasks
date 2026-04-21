import { api } from './client'
import { normalizeSimulationResponse } from './simulation-normalization'
import { unwrapApiResponse } from './types'

import type { ApiSuccessResponse, SimulationResponse } from './types'
import type { DependencyInfo } from '@/shared/types/analysis'

export async function simulateRemoval(payload: {
  fileToRemove: string
  dependencyMap?: Record<string, DependencyInfo[]>
}): Promise<SimulationResponse> {
  const { data } = await api.post<ApiSuccessResponse<SimulationResponse>>(
    '/api/simulate-removal',
    payload
  )
  return normalizeSimulationResponse(unwrapApiResponse(data))
}
