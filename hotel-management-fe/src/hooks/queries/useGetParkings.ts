import { parkingApi } from '@/api/parking.api'
import type { Parking, ParkingFilterParams } from '@/types/parking'
import { useQuery } from '@tanstack/react-query'

interface UseGetParkingsParams {
  params?: ParkingFilterParams
  enabled?: boolean
  onSuccess?: (parkings: Parking[]) => void
  onError?: (error: unknown) => void
}

export function useGetParkings({
  params,
  enabled = true,
  onSuccess,
  onError,
}: UseGetParkingsParams = {}) {
  return useQuery({
    queryKey: ['parkings', params],
    queryFn: async () => {
      const response = await parkingApi.getParkings(params)
      const data = response.data as unknown
      const parkings = Array.isArray(data) ? (data as Parking[]) : []
      onSuccess?.(parkings)
      return parkings
    },
    enabled,
  })
}
