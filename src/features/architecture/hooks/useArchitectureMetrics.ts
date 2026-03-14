import { useQuery } from '@tanstack/react-query'
import { useContext } from 'react'

import { DataContext } from '@/shared/context/DataContext'
import { architectureApi } from '@/shared/lib/api'

import { shouldFetchFileArchitectureMetrics } from '../lib/architecture-metrics-source'

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
  const architectureData = context?.architectureData ?? null
  const hasStaticArchitectureData = architectureData != null

  // Report mode: cari file di context
  const reportData =
    hasStaticArchitectureData && filePath
      ? architectureData.files.find(
          (f) => f.filePath === filePath || f.filePath.endsWith('/' + filePath)
        )
      : null

  const liveQuery = useQuery({
    queryKey: ['architecture', 'file', filePath],
    queryFn: () => architectureApi.getFileMetrics(filePath ?? ''),
    enabled: shouldFetchFileArchitectureMetrics({
      hasFilePath: !!filePath,
      hasStaticArchitectureData
    }),
    staleTime: 5 * 60 * 1000
  })

  if (hasStaticArchitectureData) {
    return {
      data: reportData ?? undefined,
      isLoading: false,
      isError: false,
      error: null,
      isSuccess: reportData != null
    }
  }

  // Live mode
  return liveQuery
}

export function useFolderDetail(folderPath: string | null) {
  const context = useContext(DataContext)
  const architectureData = context?.architectureData ?? null
  const hasStaticArchitectureData = architectureData != null

  // Report mode: look up the folder and its files from report context
  const reportFolder =
    hasStaticArchitectureData && folderPath
      ? architectureData.folders.find((f) => f.folderPath === folderPath)
      : null
  const reportFiles =
    hasStaticArchitectureData && folderPath
      ? architectureData.files.filter((f) => f.moduleKey === folderPath)
      : []

  const liveQuery = useQuery({
    queryKey: ['architecture', 'folder', folderPath],
    queryFn: () => architectureApi.getFolderDetail(folderPath ?? ''),
    enabled: !!folderPath && !hasStaticArchitectureData,
    staleTime: 5 * 60 * 1000
  })

  if (hasStaticArchitectureData) {
    return {
      data: reportFolder
        ? { folder: reportFolder, files: reportFiles }
        : undefined,
      isLoading: false,
      isError: false,
      error: null,
      isSuccess: reportFolder != null
    }
  }

  // Live mode
  return liveQuery
}
