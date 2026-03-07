import type { DependencyInfo } from '@/shared/types/analysis'

import { api } from './client'
import type { SimulationResponse } from './types'

export async function simulateRemoval(payload: {
  fileToRemove: string
  dependencyMap?: Record<string, DependencyInfo[]>
}): Promise<SimulationResponse> {
  const { data } = await api.post<SimulationResponse>(
    '/api/simulate-removal',
    payload
  )
  return data
}
