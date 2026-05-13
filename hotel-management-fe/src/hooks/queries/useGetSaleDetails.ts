import { saleDetailApi } from '@/api/sale-detail.api'
import { useQuery } from '@tanstack/react-query'

export function useGetSaleDetails(reserveId: number | undefined) {
  return useQuery({
    queryKey: ['sale-details', reserveId],
    queryFn: async () => {
      const res = await saleDetailApi.getByReserveId({ reserveId })
      return res.data
    },
    enabled: !!reserveId,
  })
}
