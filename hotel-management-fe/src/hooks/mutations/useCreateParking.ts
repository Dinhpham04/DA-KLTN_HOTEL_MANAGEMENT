import { parkingApi } from '@/api/parking.api'
import type { CreateParkingBody } from '@/types/parking'
import { useMutation } from '@tanstack/react-query'

interface UseCreateParkingParams {
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

export function useCreateParking({ onSuccess, onError }: UseCreateParkingParams) {
  return useMutation({
    mutationKey: ['create-parking'],
    mutationFn: (data: CreateParkingBody) => parkingApi.createParking(data),
    onSuccess,
    onError,
  })
}
