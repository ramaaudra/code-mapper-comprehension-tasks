import { useMutation, useQueryClient } from '@tanstack/react-query'

import { simulateRemoval } from '@/shared/lib/api/simulation'

interface SimulatePayload {
  fileToRemove: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dependencyMap?: Record<string, any>
}

export interface SimulationResult {
  brokenFiles: string[]
  newOrphans: string[]
}

export function useSimulation() {
  const queryClient = useQueryClient()

  const mutation = useMutation<SimulationResult, Error, SimulatePayload>({
    mutationFn: async (payload) => {
      const result = await simulateRemoval(payload)
      return result as SimulationResult
    },
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
