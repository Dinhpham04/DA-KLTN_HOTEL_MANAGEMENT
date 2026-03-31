import { bicycleParkingApi } from '@/api/bicycle-parking.api'
import type { CreateBicycleParkingBody } from '@/types/bicycle-parking'
import { useMutation } from '@tanstack/react-query'

interface UseCreateBicycleParkingParams {
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

export function useCreateBicycleParking({ onSuccess, onError }: UseCreateBicycleParkingParams) {
  return useMutation({
    mutationKey: ['create-bicycle-parking'],
    mutationFn: (data: CreateBicycleParkingBody) => bicycleParkingApi.createBicycleParking(data),
    onSuccess,
    onError,
  })
}
