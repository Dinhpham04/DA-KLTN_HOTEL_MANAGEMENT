import { facilityApi } from '@/api/facility.api'
import type {
  Facility,
  FacilityFilterParams,
  PaginatedFacilityResponse,
} from '@/types/facility'
import { useQuery } from '@tanstack/react-query'

interface UseGetFacilitiesParams {
  params?: FacilityFilterParams
  onError?: (error: unknown) => void
}

/**
 * Axios interceptor already unwraps the ApiEnvelope. Two possible shapes:
 *  - Plain list  → response.data = Facility[]
 *  - Paginated   → response.data = { data: Facility[], meta }
 */
function normalizeFacilitiesResponse(payload: unknown): PaginatedFacilityResponse {
  if (Array.isArray(payload)) {
    return {
      data: payload as Facility[],
      meta: { total: payload.length, page: 1, limit: payload.length || 1, totalPages: 1 },
    }
  }

  const obj = payload as Record<string, unknown>
  if (Array.isArray(obj?.data)) {
    return payload as PaginatedFacilityResponse
  }

  return { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } }
}

export function useGetFacilities({ params, onError }: UseGetFacilitiesParams = {}) {
  return useQuery({
    queryKey: ['facilities', params],
    queryFn: async () => {
      try {
        const response = await facilityApi.getFacilities(params)
        return normalizeFacilitiesResponse(response.data)
      } catch (error) {
        onError?.(error)
        throw error
      }
    },
    staleTime: 0,
  })
}
