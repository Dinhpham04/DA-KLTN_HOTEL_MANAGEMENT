import { facilityApi } from '@/api/facility.api'
import type { FacilityFilterParams, PaginatedFacilityResponse } from '@/types/facility'
import { useQuery } from '@tanstack/react-query'

interface UseGetFacilitiesParams {
  params?: FacilityFilterParams
}

export function useGetFacilities({ params }: UseGetFacilitiesParams = {}) {
  return useQuery({
    queryKey: ['facilities', params],
    queryFn: async () => {
      const response = await facilityApi.getFacilities(params)
      return response.data as PaginatedFacilityResponse
    },
    staleTime: 0,
  })
}
