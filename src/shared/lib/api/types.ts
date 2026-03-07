export interface ApiErrorResponse {
  error: string
}

export interface ApiSuccessResponse<T> {
  success: true
  data: T
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
