export interface ApiErrorResponse {
  success: false
  error: string
}

export interface ApiSuccessResponse<T> {
  success: true
  data: T
  message?: string
}

export function unwrapApiResponse<T>(response: ApiSuccessResponse<T>): T {
  return response.data
}

export interface PathfindingResponse {
  path: string[] | null
  found: boolean
  length: number
}

export interface AllPathfindingResponse {
  paths: string[][]
  count: number
}

export interface SimulationResponse {
  brokenFiles: string[]
  newOrphans: string[]
}
