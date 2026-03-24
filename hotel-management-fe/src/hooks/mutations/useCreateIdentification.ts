import { identificationApi } from '@/api/identification.api'
import type { CreateIdentificationBody } from '@/types/identification'
import { useMutation } from '@tanstack/react-query'

interface UseCreateIdentificationParams {
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

interface CreateIdentificationMutationParams {
  clientId: number
  data: CreateIdentificationBody
}

export function useCreateIdentification({ onSuccess, onError }: UseCreateIdentificationParams) {
  return useMutation({
    mutationKey: ['create-identification'],
    mutationFn: ({ clientId, data }: CreateIdentificationMutationParams) =>
      identificationApi.create(clientId, data),
    onSuccess,
    onError,
  })
}
