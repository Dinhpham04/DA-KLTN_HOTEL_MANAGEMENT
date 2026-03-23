import apiClient from '@/lib/axios'
import type { DashboardStats } from '@/types'

export const dashboardApi = {
  getStats: () => apiClient.get<DashboardStats>('/dashboard/stats'),
}
