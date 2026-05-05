import apiClient from '@/lib/axios'
import type {
  DailyReserveFilterParams,
  UpdateAllDailyReserveBody,
  UpdateDailyReserveBody,
} from '@/types/daily-reserve'

export const dailyReserveApi = {
  getList: (params?: DailyReserveFilterParams) =>
    apiClient.get<unknown>('/daily-reserve', { params }),

  update: ({ reserveId, ...data }: UpdateDailyReserveBody) =>
    apiClient.put(`/daily-reserve/${reserveId}`, data),

  updateAll: (data: UpdateAllDailyReserveBody) => apiClient.put('/daily-reserves', data),
}
