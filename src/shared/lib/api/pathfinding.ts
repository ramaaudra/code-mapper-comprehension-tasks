import { api } from './client'
import type { AllPathfindingResponse, PathfindingResponse } from './types'

export async function findDependencyPath(payload: {
  startNode: string
  endNode: string
}): Promise<string[] | null> {
  const { data } = await api.post<PathfindingResponse>('/find-path', payload)
  return data.path
}

export async function findAllDependencyPaths(payload: {
  startNode: string
  endNode: string
  maxDepth?: number
}): Promise<string[][]> {
  const { data } = await api.post<AllPathfindingResponse>(
    '/find-all-paths',
    payload
  )
  return data.paths
}
