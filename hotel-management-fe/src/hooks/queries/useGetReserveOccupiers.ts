import { useQuery } from '@tanstack/react-query'
import { occupierApi } from '@/api/occupier.api'

interface UseGetReserveOccupiersParams {
  reserveId?: number
}

export function useGetReserveOccupiers({ reserveId }: UseGetReserveOccupiersParams) {
  return useQuery({
    queryKey: ['reserve-occupiers', reserveId],
    queryFn: async () => {
      const response = await occupierApi.getByReserveId({ reserveId })
      return response.data
    },
    enabled: !!reserveId,
  })
}
