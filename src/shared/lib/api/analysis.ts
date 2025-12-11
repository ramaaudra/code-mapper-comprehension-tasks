import { api } from './client'

export async function fetchAnalysisData() {
  const { data } = await api.get('/api/data')
  return data
}
