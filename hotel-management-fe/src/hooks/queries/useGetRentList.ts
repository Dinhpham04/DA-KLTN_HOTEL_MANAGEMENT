import { rentApi } from '@/api/rent.api'
import type { RentFilterParams } from '@/types/rent'
import { useQuery } from '@tanstack/react-query'

interface UseGetRentListParams {
  params?: RentFilterParams
  enabled?: boolean
}

export function useGetRentList({ params, enabled = true }: UseGetRentListParams = {}) {
  return useQuery({
    queryKey: ['rent-list', params],
    queryFn: async () => {
      const response = await rentApi.getRentList(params)
      // Axios interceptor already unwraps the ApiEnvelope.
      // Backend returns { rents: RentGroup[] } under the data key.
      const data = response.data
      return data?.rents ?? []
    },
    enabled,
  })
}
