import { pricingApi } from '@/api/pricing.api'
import type { RequestTypeFilterParams } from '@/types/pricing'
import { useQuery } from '@tanstack/react-query'

export function useGetRequestTypes(params?: RequestTypeFilterParams) {
  return useQuery({
    queryKey: ['request-types', params],
    queryFn: async () => {
      const response = await pricingApi.getRequestTypes(params)
      return response.data ?? []
    },
    staleTime: 10 * 60 * 1000,
  })
}
