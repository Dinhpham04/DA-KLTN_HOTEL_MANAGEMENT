import { clientApi } from '@/api/client.api'
import type { UpdateClientBody } from '@/types/client'
import { useMutation } from '@tanstack/react-query'

interface UseUpdateClientParams {
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

export function useUpdateClient({ onSuccess, onError }: UseUpdateClientParams) {
  return useMutation({
    mutationKey: ['update-client'],
    mutationFn: (data: UpdateClientBody) => clientApi.updateClient(data),
    onSuccess,
    onError,
  })
}
