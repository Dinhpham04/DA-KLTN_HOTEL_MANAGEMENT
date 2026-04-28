import { type CreateParkingReservePayload, parkingReserveApi } from '@/api/parking-reserve.api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface UseCreateParkingReserveParams {
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

export function useCreateParkingReserve({ onSuccess, onError }: UseCreateParkingReserveParams) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['create-parking-reserve'],
    mutationFn: (data: CreateParkingReservePayload) => parkingReserveApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parking-status'] })
      onSuccess?.()
    },
    onError,
  })
}
