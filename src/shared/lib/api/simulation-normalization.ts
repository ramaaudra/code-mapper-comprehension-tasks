import type { SimulationResponse } from './types'

function normalizeStringList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter((entry): entry is string => typeof entry === 'string')
}

export function normalizeSimulationResponse(
  response: Partial<SimulationResponse> | null | undefined
): SimulationResponse {
  return {
    brokenFiles: normalizeStringList(response?.brokenFiles),
    newOrphans: normalizeStringList(response?.newOrphans)
  }
}
