import { requestDetailApi } from '@/api/request-detail.api'
import { useQuery } from '@tanstack/react-query'

export function useGetRequestDetails(reserveId: number | undefined) {
  return useQuery({
    queryKey: ['request-details', reserveId],
    queryFn: async () => {
      const res = await requestDetailApi.getByReserveId({ reserveId })
      return res.data
    },
    enabled: !!reserveId,
  })
}
