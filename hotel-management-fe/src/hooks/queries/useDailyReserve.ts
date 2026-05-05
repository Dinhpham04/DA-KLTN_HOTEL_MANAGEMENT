import { dailyReserveApi } from '@/api/daily-reserve.api'
import type { DailyReserveFilterParams, DailyReserveResponse } from '@/types/daily-reserve'
import { useQuery } from '@tanstack/react-query'

export const DAILY_RESERVE_KEYS = {
  all: ['daily-reserve'] as const,
  list: (params?: DailyReserveFilterParams) => [...DAILY_RESERVE_KEYS.all, params] as const,
}

export function useDailyReserve(params?: DailyReserveFilterParams) {
  return useQuery({
    queryKey: DAILY_RESERVE_KEYS.list(params),
    queryFn: async () => {
      const response = await dailyReserveApi.getList(params)
      return response.data as DailyReserveResponse
    },
  })
}
