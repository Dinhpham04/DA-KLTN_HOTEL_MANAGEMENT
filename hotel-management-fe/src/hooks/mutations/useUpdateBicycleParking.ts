import { bicycleParkingApi } from '@/api/bicycle-parking.api'
import type { UpdateBicycleParkingBody } from '@/types/bicycle-parking'
import { useMutation } from '@tanstack/react-query'

interface UseUpdateBicycleParkingParams {
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

export function useUpdateBicycleParking({ onSuccess, onError }: UseUpdateBicycleParkingParams) {
  return useMutation({
    mutationKey: ['update-bicycle-parking'],
    mutationFn: (data: UpdateBicycleParkingBody) => bicycleParkingApi.updateBicycleParking(data),
    onSuccess,
    onError,
  })
}
