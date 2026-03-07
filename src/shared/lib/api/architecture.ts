import type {
  FileArchitectureMetrics,
  FileContentResponse,
  FolderArchitectureMetrics,
  FolderDetailResponse
} from '@/features/architecture/types/architecture'

import { api } from './client'
import { unwrapApiResponse } from './types'
import type { ApiSuccessResponse } from './types'

export const architectureApi = {
  getFolders: async (): Promise<{ folders: FolderArchitectureMetrics[] }> => {
    const response = await api.get<
      ApiSuccessResponse<{ folders: FolderArchitectureMetrics[] }>
    >('/api/architecture/folders')
    return unwrapApiResponse(response.data)
  },

  getFiles: async (): Promise<{ files: FileArchitectureMetrics[] }> => {
    const response = await api.get<
      ApiSuccessResponse<{ files: FileArchitectureMetrics[] }>
    >('/api/architecture/files')
    return unwrapApiResponse(response.data)
  },

  getFileMetrics: async (
    filePath: string
  ): Promise<FileArchitectureMetrics> => {
    const encoded = encodeURIComponent(filePath)
    const response = await api.get<ApiSuccessResponse<FileArchitectureMetrics>>(
      `/api/architecture/file?path=${encoded}`
    )
    return unwrapApiResponse(response.data)
  },

  getFolderDetail: async (
    folderPath: string
  ): Promise<FolderDetailResponse> => {
    const encoded = encodeURIComponent(folderPath)
    const response = await api.get<ApiSuccessResponse<FolderDetailResponse>>(
      `/api/architecture/folder?path=${encoded}`
    )
    return unwrapApiResponse(response.data)
  },

  getFileContent: async (filePath: string): Promise<FileContentResponse> => {
    const encoded = encodeURIComponent(filePath)
    const response = await api.get<ApiSuccessResponse<FileContentResponse>>(
      `/api/file/content?path=${encoded}`
    )
    return unwrapApiResponse(response.data)
  }
}
