import { useQuery } from '@tanstack/react-query'
import { useContext } from 'react'

import { DataContext } from '@/shared/context/DataContext'
import { architectureApi } from '@/shared/lib/api'

export function useArchitectureFolders() {
  const context = useContext(DataContext)

  // Always call useQuery unconditionally
  const liveQuery = useQuery({
    queryKey: ['architecture', 'folders'],
    queryFn: () => architectureApi.getFolders(),
    staleTime: 5 * 60 * 1000,
    enabled: !context?.architectureData // Only fetch in live mode
  })

  // Report mode: data dari context
  if (context?.architectureData) {
    return {
      data: { folders: context.architectureData.folders },
      isLoading: false,
      isError: false,
      error: null,
      isSuccess: true
    }
  }

  // Live mode: fetch via React Query
  return liveQuery
}

export function useArchitectureFiles() {
  const context = useContext(DataContext)

  const liveQuery = useQuery({
    queryKey: ['architecture', 'files'],
    queryFn: () => architectureApi.getFiles(),
    staleTime: 5 * 60 * 1000,
    enabled: !context?.architectureData
  })

  // Report mode
  if (context?.architectureData) {
    return {
      data: { files: context.architectureData.files },
      isLoading: false,
      isError: false,
      error: null,
      isSuccess: true
    }
  }

  // Live mode
  return liveQuery
}

export function useFileArchitectureMetrics(filePath: string | null) {
  const context = useContext(DataContext)

  // Report mode: cari file di context
  const reportData =
    context?.architectureData && filePath
      ? context.architectureData.files.find(
          (f) => f.filePath === filePath || f.filePath.endsWith('/' + filePath)
        )
      : null

  const liveQuery = useQuery({
    queryKey: ['architecture', 'file', filePath],
    queryFn: () => architectureApi.getFileMetrics(filePath ?? ''),
    enabled: !!filePath && !reportData,
    staleTime: 5 * 60 * 1000
  })

  if (reportData) {
    return {
      data: reportData,
      isLoading: false,
      isError: false,
      error: null,
      isSuccess: true
    }
  }

  // Live mode atau file tidak ditemukan di context
  return liveQuery
}

export function useFolderDetail(folderPath: string | null) {
  const context = useContext(DataContext)

  // Report mode: cari folder dan files-nya di context
  const reportFolder =
    context?.architectureData && folderPath
      ? context.architectureData.folders.find(
          (f) => f.folderPath === folderPath
        )
      : null
  const reportFiles =
    context?.architectureData && folderPath
      ? context.architectureData.files.filter((f) => f.moduleKey === folderPath)
      : []

  const liveQuery = useQuery({
    queryKey: ['architecture', 'folder', folderPath],
    queryFn: () => architectureApi.getFolderDetail(folderPath ?? ''),
    enabled: !!folderPath && !reportFolder,
    staleTime: 5 * 60 * 1000
  })

  if (reportFolder) {
    return {
      data: { folder: reportFolder, files: reportFiles },
      isLoading: false,
      isError: false,
      error: null,
      isSuccess: true
    }
  }

  // Live mode
  return liveQuery
}
