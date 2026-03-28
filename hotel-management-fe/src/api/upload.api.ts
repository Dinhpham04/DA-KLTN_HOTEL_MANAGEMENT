import apiClient from '@/lib/axios'

export interface UploadResponse {
  url: string
  publicId: string
  originalName: string
  size: number
  mimeType: string
}

export const uploadApi = {
  uploadImage: (file: File, subfolder?: string) => {
    const formData = new FormData()
    formData.append('file', file)

    const params = subfolder ? `?subfolder=${encodeURIComponent(subfolder)}` : ''

    return apiClient.post<UploadResponse>(`/upload/image${params}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}
