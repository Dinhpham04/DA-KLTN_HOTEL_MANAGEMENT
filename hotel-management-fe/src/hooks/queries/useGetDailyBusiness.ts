import { dashboardHeaderApi } from '@/api/dashboard-header.api'
import type { DailyBusinessResponse } from '@/types/dashboard-header'
import { useQuery } from '@tanstack/react-query'

interface UseGetDailyBusinessParams {
  date?: string
  enabled?: boolean
}

export function useGetDailyBusiness({ date, enabled = true }: UseGetDailyBusinessParams) {
  return useQuery<DailyBusinessResponse>({
    queryKey: ['daily-business-report', date],
    enabled,
    queryFn: async () => {
      const response = await dashboardHeaderApi.getDailyBusiness(date)
      return response.data
    },
  })
}
