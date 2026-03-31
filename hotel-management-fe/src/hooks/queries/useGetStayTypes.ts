import { stayTypeApi } from '@/api/stay-type.api'
import type { StayType } from '@/types/stay-type'
import { useQuery } from '@tanstack/react-query'

interface UseGetStayTypesParams {
  onSuccess?: (stayTypes: StayType[]) => void
  onError?: (error: unknown) => void
}

export function useGetStayTypes({ onSuccess, onError }: UseGetStayTypesParams = {}) {
  return useQuery({
    queryKey: ['stay-types'],
    queryFn: async () => {
      const response = await stayTypeApi.getStayTypes()
      const data = response.data as unknown
      const stayTypes = Array.isArray(data) ? (data as StayType[]) : []
      onSuccess?.(stayTypes)
      return stayTypes
    },
    staleTime: 5 * 60 * 1000,
  })
}
