import { api } from './client'
import { unwrapApiResponse } from './types'
import type {
  AllPathfindingResponse,
  ApiSuccessResponse,
  PathfindingResponse
} from './types'

export async function findDependencyPath(payload: {
  startNode: string
  endNode: string
}): Promise<string[] | null> {
  const { data } = await api.post<ApiSuccessResponse<PathfindingResponse>>(
    '/find-path',
    payload
  )
  return unwrapApiResponse(data).path
}

export async function findAllDependencyPaths(payload: {
  startNode: string
  endNode: string
  maxDepth?: number
}): Promise<string[][]> {
  const { data } = await api.post<ApiSuccessResponse<AllPathfindingResponse>>(
    '/find-all-paths',
    payload
  )
  return unwrapApiResponse(data).paths
}
