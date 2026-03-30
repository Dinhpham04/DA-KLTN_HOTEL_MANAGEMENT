import { bicycleParkingApi } from '@/api/bicycle-parking.api'
import type { UpdateBicycleParkingOrderBody } from '@/types/bicycle-parking'
import { useMutation } from '@tanstack/react-query'

interface UseUpdateBicycleParkingOrderParams {
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

export function useUpdateBicycleParkingOrder({
  onSuccess,
  onError,
}: UseUpdateBicycleParkingOrderParams) {
  return useMutation({
    mutationKey: ['update-bicycle-parking-order'],
    mutationFn: (data: UpdateBicycleParkingOrderBody) =>
      bicycleParkingApi.updateBicycleParkingOrder(data),
    onSuccess,
    onError,
  })
}
