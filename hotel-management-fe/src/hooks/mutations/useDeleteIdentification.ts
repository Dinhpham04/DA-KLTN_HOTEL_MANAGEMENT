import { identificationApi } from '@/api/identification.api'
import { useMutation } from '@tanstack/react-query'

interface UseDeleteIdentificationParams {
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

export function useDeleteIdentification({ onSuccess, onError }: UseDeleteIdentificationParams) {
  return useMutation({
    mutationKey: ['delete-identification'],
    mutationFn: (identificationId: number) => identificationApi.delete(identificationId),
    onSuccess,
    onError,
  })
}
