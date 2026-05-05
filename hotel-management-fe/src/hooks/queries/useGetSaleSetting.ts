import { dashboardHeaderApi } from '@/api/dashboard-header.api'
import type { SaleSettingResponse } from '@/types/dashboard-header'
import { useQuery } from '@tanstack/react-query'

export function useGetSaleSetting() {
  return useQuery<SaleSettingResponse>({
    queryKey: ['sale-setting'],
    queryFn: async () => {
      const response = await dashboardHeaderApi.getSaleSetting()
      return response.data
    },
  })
}
