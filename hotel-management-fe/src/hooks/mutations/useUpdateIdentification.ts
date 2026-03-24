import { identificationApi } from '@/api/identification.api'
import type { UpdateIdentificationBody } from '@/types/identification'
import { useMutation } from '@tanstack/react-query'

interface UseUpdateIdentificationParams {
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

export function useUpdateIdentification({ onSuccess, onError }: UseUpdateIdentificationParams) {
  return useMutation({
    mutationKey: ['update-identification'],
    mutationFn: (data: UpdateIdentificationBody) => identificationApi.update(data),
    onSuccess,
    onError,
  })
}
