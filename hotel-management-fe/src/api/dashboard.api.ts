import type { DashboardStats } from '@/types'
import apiClient from '@/lib/axios'

export const dashboardApi = {
  getStats: () => apiClient.get<DashboardStats>('/dashboard/stats'),
}
