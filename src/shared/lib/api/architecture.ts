import type {
  FileArchitectureMetrics,
  FolderArchitectureMetrics,
  FolderDetailResponse
} from '@/features/architecture/types/architecture'

import { api } from './client'

export const architectureApi = {
  getFolders: async (): Promise<{ folders: FolderArchitectureMetrics[] }> => {
    const response = await api.get('/api/architecture/folders')
    return response.data
  },

  getFiles: async (): Promise<{ files: FileArchitectureMetrics[] }> => {
    const response = await api.get('/api/architecture/files')
    return response.data
  },

  getFileMetrics: async (
    filePath: string
  ): Promise<FileArchitectureMetrics> => {
    const encoded = encodeURIComponent(filePath)
    const response = await api.get(`/api/architecture/file?path=${encoded}`)
    return response.data
  },

  getFolderDetail: async (
    folderPath: string
  ): Promise<FolderDetailResponse> => {
    const encoded = encodeURIComponent(folderPath)
    const response = await api.get(`/api/architecture/folder?path=${encoded}`)
    return response.data
  }
}
