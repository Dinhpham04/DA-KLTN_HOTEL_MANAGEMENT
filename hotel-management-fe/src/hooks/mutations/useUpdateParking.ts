import { parkingApi } from '@/api/parking.api'
import type { UpdateParkingBody } from '@/types/parking'
import { useMutation } from '@tanstack/react-query'

interface UseUpdateParkingParams {
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

export function useUpdateParking({ onSuccess, onError }: UseUpdateParkingParams) {
  return useMutation({
    mutationKey: ['update-parking'],
    mutationFn: (data: UpdateParkingBody) => parkingApi.updateParking(data),
    onSuccess,
    onError,
  })
}
