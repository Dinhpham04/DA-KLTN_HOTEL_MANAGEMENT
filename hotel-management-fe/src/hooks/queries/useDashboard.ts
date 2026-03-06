import { dashboardApi } from '@/api/dashboard.api'
import type { DashboardStats } from '@/types'
import { useQuery } from '@tanstack/react-query'

const DASHBOARD_DEFAULT_STATS: DashboardStats = {
  totalRooms: 0,
  occupiedRooms: 0,
  availableRooms: 0,
  todayCheckIns: 0,
  todayCheckOuts: 0,
  pendingCleanings: 0,
  monthlyRevenue: 0,
  occupancyRate: 0,
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      try {
        const response = await dashboardApi.getStats()
        return response.data
      } catch {
        // Base phase: backend may not expose dashboard module yet.
        return DASHBOARD_DEFAULT_STATS
      }
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 5, // refresh every 5 minutes
  })
}
