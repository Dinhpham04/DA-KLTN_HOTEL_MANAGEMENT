import { bicycleParkingApi } from '@/api/bicycle-parking.api'
import type { BicycleParking, BicycleParkingFilterParams } from '@/types/bicycle-parking'
import { useQuery } from '@tanstack/react-query'

interface UseGetBicycleParkingsParams {
  params?: BicycleParkingFilterParams
  enabled?: boolean
  onSuccess?: (bicycleParkings: BicycleParking[]) => void
  onError?: (error: unknown) => void
}

export function useGetBicycleParkings({
  params,
  enabled = true,
  onSuccess,
  onError,
}: UseGetBicycleParkingsParams = {}) {
  return useQuery({
    queryKey: ['bicycle-parkings', params],
    queryFn: async () => {
      const response = await bicycleParkingApi.getBicycleParkings(params)
      const data = response.data as unknown
      const bicycleParkings = Array.isArray(data) ? (data as BicycleParking[]) : []
      onSuccess?.(bicycleParkings)
      return bicycleParkings
    },
    enabled,
  })
}
