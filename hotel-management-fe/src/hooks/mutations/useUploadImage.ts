import { type UploadResponse, uploadApi } from '@/api/upload.api'
import { useMutation } from '@tanstack/react-query'

interface UseUploadImageParams {
  onSuccess?: (data: UploadResponse) => void
  onError?: (error: unknown) => void
}

interface UploadImageMutationParams {
  file: File
  subfolder?: string
}

export function useUploadImage({ onSuccess, onError }: UseUploadImageParams = {}) {
  return useMutation({
    mutationKey: ['upload-image'],
    mutationFn: async ({ file, subfolder }: UploadImageMutationParams) => {
      const response = await uploadApi.uploadImage(file, subfolder)
      return response.data
    },
    onSuccess,
    onError,
  })
}
