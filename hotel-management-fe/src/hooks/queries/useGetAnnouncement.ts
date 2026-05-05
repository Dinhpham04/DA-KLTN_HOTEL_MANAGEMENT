import { dashboardHeaderApi } from '@/api/dashboard-header.api'
import type { AnnouncementFilterParams, AnnouncementListResponse } from '@/types/dashboard-header'
import { useQuery } from '@tanstack/react-query'

interface UseGetAnnouncementParams extends AnnouncementFilterParams {
  enabled?: boolean
}

export function useGetAnnouncement({
  date,
  page = 1,
  perPage = 20,
  enabled = true,
}: UseGetAnnouncementParams) {
  return useQuery<AnnouncementListResponse>({
    queryKey: ['announcement', date, page, perPage],
    enabled,
    queryFn: async () => {
      const response = await dashboardHeaderApi.getAnnouncements({
        date,
        page,
        perPage,
      })
      return response.data
    },
  })
}
