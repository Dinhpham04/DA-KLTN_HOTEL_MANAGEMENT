import { parkingApi } from '@/api/parking.api'
import type { UpdateParkingOrderBody } from '@/types/parking'
import { useMutation } from '@tanstack/react-query'

interface UseUpdateParkingOrderParams {
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

export function useUpdateParkingOrder({ onSuccess, onError }: UseUpdateParkingOrderParams) {
  return useMutation({
    mutationKey: ['update-parking-order'],
    mutationFn: (data: UpdateParkingOrderBody) => parkingApi.updateParkingOrder(data),
    onSuccess,
    onError,
  })
}
