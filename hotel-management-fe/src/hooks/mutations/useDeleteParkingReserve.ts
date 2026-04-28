import { parkingReserveApi } from '@/api/parking-reserve.api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface UseDeleteParkingReserveParams {
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

export function useDeleteParkingReserve({ onSuccess, onError }: UseDeleteParkingReserveParams) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['delete-parking-reserve'],
    mutationFn: (id: number) => parkingReserveApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parking-status'] })
      onSuccess?.()
    },
    onError,
  })
}
