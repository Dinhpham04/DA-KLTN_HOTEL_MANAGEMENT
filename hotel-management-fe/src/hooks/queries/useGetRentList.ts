import { rentApi } from '@/api/rent.api'
import type { RentGroup, RentFilterParams } from '@/types/rent'
import { useQuery } from '@tanstack/react-query'

interface UseGetRentListParams {
  params?: RentFilterParams
  enabled?: boolean
  onSuccess?: (rents: RentGroup[]) => void
  onError?: (error: unknown) => void
}

export function useGetRentList({
  params,
  enabled = true,
  onSuccess,
  onError,
}: UseGetRentListParams = {}) {
  return useQuery({
    queryKey: ['rent-list', params],
    queryFn: async () => {
      const response = await rentApi.getRentList(params)
      const data = response.data as unknown
      let rents: RentGroup[] = []
      if (data && typeof data === 'object' && 'rents' in data) {
        rents = (data as { rents: RentGroup[] }).rents
      } else if (Array.isArray(data)) {
        rents = data as RentGroup[]
      }
      onSuccess?.(rents)
      return rents
    },
    enabled,
  })
}
