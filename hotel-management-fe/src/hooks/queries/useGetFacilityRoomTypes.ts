import { facilityRoomTypeApi } from '@/api/facility-room-type.api'
import type { FacilityRoomTypeMatrixResponse } from '@/types/facility-room-type'
import { useQuery } from '@tanstack/react-query'

interface UseGetFacilityRoomTypesParams {
  onSuccess?: (data: FacilityRoomTypeMatrixResponse) => void
  onError?: (error: unknown) => void
}

function normalizeResponse(payload: unknown): FacilityRoomTypeMatrixResponse {
  if (typeof payload === 'object' && payload !== null) {
    const obj = payload as Record<string, unknown>

    // Handle { data: { facilities: [...] } } wrapper
    if (typeof obj.data === 'object' && obj.data !== null) {
      const nested = obj.data as Record<string, unknown>
      if (Array.isArray(nested.facilities)) {
        return { facilities: nested.facilities as FacilityRoomTypeMatrixResponse['facilities'] }
      }
    }

    // Handle direct { facilities: [...] }
    if (Array.isArray(obj.facilities)) {
      return { facilities: obj.facilities as FacilityRoomTypeMatrixResponse['facilities'] }
    }
  }

  return { facilities: [] }
}

export function useGetFacilityRoomTypes({
  onSuccess,
  onError,
}: UseGetFacilityRoomTypesParams = {}) {
  return useQuery({
    queryKey: ['facility-room-types'],
    queryFn: async () => {
      try {
        const response = await facilityRoomTypeApi.getMatrix()
        const normalized = normalizeResponse(response.data)
        onSuccess?.(normalized)
        return normalized
      } catch (error) {
        onError?.(error)
        throw error
      }
    },
  })
}
