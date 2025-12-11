import { api } from './client'

export async function simulateRemoval(payload: {
  fileToRemove: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dependencyMap?: Record<string, any>
}) {
  const { data } = await api.post('/api/simulate-removal', payload)
  return data
}
