import { clientApi } from '@/api/client.api'
import { useMutation } from '@tanstack/react-query'

interface UseDeleteClientParams {
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

export function useDeleteClient({ onSuccess, onError }: UseDeleteClientParams) {
  return useMutation({
    mutationKey: ['delete-client'],
    mutationFn: (clientId: number) => clientApi.deleteClient(clientId),
    onSuccess,
    onError,
  })
}
