import type { DependencyInfo } from '@/shared/types/analysis'

import { api } from './client'
import { unwrapApiResponse } from './types'
import type { ApiSuccessResponse, SimulationResponse } from './types'

export async function simulateRemoval(payload: {
  fileToRemove: string
  dependencyMap?: Record<string, DependencyInfo[]>
}): Promise<SimulationResponse> {
  const { data } = await api.post<ApiSuccessResponse<SimulationResponse>>(
    '/api/simulate-removal',
    payload
  )
  return unwrapApiResponse(data)
}
