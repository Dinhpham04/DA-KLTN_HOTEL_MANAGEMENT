import { occupierApi } from '@/api/occupier.api'
import { useMutation } from '@tanstack/react-query'

interface UseDeleteReserveOccupierParams {
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

export function useDeleteReserveOccupier({
  onSuccess,
  onError,
}: UseDeleteReserveOccupierParams = {}) {
  return useMutation({
    mutationFn: (id: number) => occupierApi.delete(id),
    onSuccess,
    onError,
  })
}
