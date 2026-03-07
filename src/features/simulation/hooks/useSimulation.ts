import { useMutation, useQueryClient } from '@tanstack/react-query'

import { simulateRemoval } from '@/shared/lib/api/simulation'
import type { SimulationResponse } from '@/shared/lib/api/types'
import type { DependencyInfo } from '@/shared/types/analysis'

interface SimulatePayload {
  fileToRemove: string
  dependencyMap?: Record<string, DependencyInfo[]>
}

export type SimulationResult = SimulationResponse

export function useSimulation() {
  const queryClient = useQueryClient()

  const mutation = useMutation<SimulationResult, Error, SimulatePayload>({
    mutationFn: simulateRemoval,
    onSuccess: () => {
      // Invalidate analysis data to trigger refetch after simulation
      queryClient.invalidateQueries({ queryKey: ['analysis'] })
    }
  })

  return {
    simulate: mutation.mutate,
    isSimulating: mutation.isPending,
    result: mutation.data || null,
    error: mutation.error,
    reset: mutation.reset
  }
}
