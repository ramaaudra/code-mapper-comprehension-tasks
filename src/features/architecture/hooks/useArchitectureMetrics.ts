import { useQuery } from '@tanstack/react-query'

import { architectureApi } from '@/shared/lib/api'

export function useArchitectureFolders() {
  return useQuery({
    queryKey: ['architecture', 'folders'],
    queryFn: () => architectureApi.getFolders(),
    staleTime: 5 * 60 * 1000 // 5 menit
  })
}

export function useArchitectureFiles() {
  return useQuery({
    queryKey: ['architecture', 'files'],
    queryFn: () => architectureApi.getFiles(),
    staleTime: 5 * 60 * 1000
  })
}

export function useFileArchitectureMetrics(filePath: string | null) {
  return useQuery({
    queryKey: ['architecture', 'file', filePath],
    queryFn: () => architectureApi.getFileMetrics(filePath!),
    enabled: !!filePath,
    staleTime: 5 * 60 * 1000
  })
}

export function useFolderDetail(folderPath: string | null) {
  return useQuery({
    queryKey: ['architecture', 'folder', folderPath],
    queryFn: () => architectureApi.getFolderDetail(folderPath!),
    enabled: !!folderPath,
    staleTime: 5 * 60 * 1000
  })
}
