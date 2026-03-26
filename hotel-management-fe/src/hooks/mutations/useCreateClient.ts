import { clientApi } from '@/api/client.api'
import type { CreateClientBody } from '@/types/client'
import { useMutation } from '@tanstack/react-query'

interface UseCreateClientParams {
  onSuccess?: (data: unknown) => void
  onError?: (error: unknown) => void
}

export function useCreateClient({ onSuccess, onError }: UseCreateClientParams) {
  return useMutation({
    mutationKey: ['create-client'],
    mutationFn: (data: CreateClientBody) => clientApi.createClient(data),
    onSuccess: (data) => onSuccess?.(data),
    onError,
  })
}
