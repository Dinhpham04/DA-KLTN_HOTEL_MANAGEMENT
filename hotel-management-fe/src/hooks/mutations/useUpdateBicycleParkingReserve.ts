import {
  type UpdateBicycleParkingReservePayload,
  parkingReserveApi,
} from '@/api/parking-reserve.api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface UseUpdateBicycleParkingReserveParams {
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

export function useUpdateBicycleParkingReserve({
  onSuccess,
  onError,
}: UseUpdateBicycleParkingReserveParams) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['update-bicycle-parking-reserve'],
    mutationFn: ({ id, data }: { id: number; data: UpdateBicycleParkingReservePayload }) =>
      parkingReserveApi.updateBicycle(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parking-status'] })
      onSuccess?.()
    },
    onError,
  })
}
