import { parkingReserveApi } from '@/api/parking-reserve.api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface UseDeleteBicycleParkingReserveParams {
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

export function useDeleteBicycleParkingReserve({
  onSuccess,
  onError,
}: UseDeleteBicycleParkingReserveParams) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['delete-bicycle-parking-reserve'],
    mutationFn: (id: number) => parkingReserveApi.deleteBicycle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parking-status'] })
      onSuccess?.()
    },
    onError,
  })
}
