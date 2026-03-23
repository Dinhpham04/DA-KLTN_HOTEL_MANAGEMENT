import { facilityApi } from '@/api/facility.api'
import type { UpdateFacilityBody } from '@/types/facility'
import { useMutation } from '@tanstack/react-query'

interface UseUpdateFacilityParams {
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

export function useUpdateFacility({ onSuccess, onError }: UseUpdateFacilityParams) {
  return useMutation({
    mutationKey: ['update-facility'],
    mutationFn: (data: UpdateFacilityBody) => facilityApi.updateFacility(data),
    onSuccess,
    onError,
  })
}
