import { useMutation } from '@tanstack/react-query'
import { occupierApi } from '@/api/occupier.api'
import type { UpdateReserveOccupierBody } from '@/types/occupier'

interface UseUpdateReserveOccupierParams {
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

export function useUpdateReserveOccupier({
  onSuccess,
  onError,
}: UseUpdateReserveOccupierParams = {}) {
  return useMutation({
    mutationFn: (payload: { id: number; data: UpdateReserveOccupierBody }) =>
      occupierApi.update(payload.id, payload.data),
    onSuccess,
    onError,
  })
}
