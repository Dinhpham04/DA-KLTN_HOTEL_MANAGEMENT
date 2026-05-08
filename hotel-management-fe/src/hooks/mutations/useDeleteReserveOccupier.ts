import { useMutation } from '@tanstack/react-query'
import { occupierApi } from '@/api/occupier.api'

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
