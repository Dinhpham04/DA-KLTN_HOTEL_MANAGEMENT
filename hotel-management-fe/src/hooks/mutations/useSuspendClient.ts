import { clientApi } from '@/api/client.api'
import { useMutation } from '@tanstack/react-query'

interface UseSuspendClientParams {
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

export function useSuspendClient({ onSuccess, onError }: UseSuspendClientParams) {
  return useMutation({
    mutationKey: ['suspend-client'],
    mutationFn: (clientId: number) => clientApi.suspendClient(clientId),
    onSuccess,
    onError,
  })
}

export function useReactivateClient({ onSuccess, onError }: UseSuspendClientParams) {
  return useMutation({
    mutationKey: ['reactivate-client'],
    mutationFn: (clientId: number) => clientApi.reactivateClient(clientId),
    onSuccess,
    onError,
  })
}
