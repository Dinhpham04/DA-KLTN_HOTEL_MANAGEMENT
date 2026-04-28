import {
  type CreateBicycleParkingReservePayload,
  parkingReserveApi,
} from '@/api/parking-reserve.api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface UseCreateBicycleParkingReserveParams {
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

export function useCreateBicycleParkingReserve({
  onSuccess,
  onError,
}: UseCreateBicycleParkingReserveParams) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['create-bicycle-parking-reserve'],
    mutationFn: (data: CreateBicycleParkingReservePayload) => parkingReserveApi.createBicycle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parking-status'] })
      onSuccess?.()
    },
    onError,
  })
}
