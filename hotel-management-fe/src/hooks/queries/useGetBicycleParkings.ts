import { bicycleParkingApi } from '@/api/bicycle-parking.api'
import type {
  BicycleParkingFilterParams,
  BicycleParkingListResponse,
} from '@/types/bicycle-parking'
import { useQuery } from '@tanstack/react-query'

interface UseGetBicycleParkingsParams {
  params?: BicycleParkingFilterParams
  enabled?: boolean
}

export function useGetBicycleParkings({
  params,
  enabled = true,
}: UseGetBicycleParkingsParams = {}) {
  return useQuery({
    queryKey: ['bicycle-parkings', params],
    queryFn: async () => {
      const response = await bicycleParkingApi.getBicycleParkings(params)
      // Axios interceptor unwraps envelope → response.data = { bicycleParkings: BicycleParking[] }
      return response.data.bicycleParkings ?? []
    },
    enabled,
  })
}
