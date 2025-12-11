import { api } from './client'

export async function findDependencyPath(payload: {
  startNode: string
  endNode: string
}) {
  const { data } = await api.post('/find-path', payload)
  return data.path
}

export async function findAllDependencyPaths(payload: {
  startNode: string
  endNode: string
  maxDepth?: number
}) {
  const { data } = await api.post('/find-all-paths', payload)
  return data.paths
}
