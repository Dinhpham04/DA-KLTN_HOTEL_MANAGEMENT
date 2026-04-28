import { type UpdateParkingReservePayload, parkingReserveApi } from '@/api/parking-reserve.api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface UseUpdateParkingReserveParams {
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

export function useUpdateParkingReserve({ onSuccess, onError }: UseUpdateParkingReserveParams) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['update-parking-reserve'],
    mutationFn: ({ id, data }: { id: number; data: UpdateParkingReservePayload }) =>
      parkingReserveApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parking-status'] })
      onSuccess?.()
    },
    onError,
  })
}
