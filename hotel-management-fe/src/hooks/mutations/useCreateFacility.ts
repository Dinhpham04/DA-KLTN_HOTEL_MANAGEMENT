import { useMutation } from '@tanstack/react-query'
import { facilityApi } from '@/api/facility.api'
import type { CreateFacilityBody } from '@/types/facility'

interface UseCreateFacilityParams {
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

export function useCreateFacility({ onSuccess, onError }: UseCreateFacilityParams) {
  return useMutation({
    mutationKey: ['create-facility'],
    mutationFn: (data: CreateFacilityBody) => facilityApi.createFacility(data),
    onSuccess,
    onError,
  })
}
