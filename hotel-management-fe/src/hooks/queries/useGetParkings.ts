import { parkingApi } from '@/api/parking.api'
import type { ParkingFilterParams } from '@/types/parking'
import { useQuery } from '@tanstack/react-query'

interface UseGetParkingsParams {
  params?: ParkingFilterParams
  enabled?: boolean
}

export function useGetParkings({ params, enabled = true }: UseGetParkingsParams = {}) {
  return useQuery({
    queryKey: ['parkings', params],
    queryFn: async () => {
      const response = await parkingApi.getParkings(params)
      // Axios interceptor unwraps envelope → response.data = { parkings: Parking[] }
      return response.data.parkings ?? []
    },
    enabled,
  })
}
