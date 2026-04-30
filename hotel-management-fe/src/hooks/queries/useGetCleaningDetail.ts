import { cleaningShiftApi } from '@/api/cleaning-shift.api'
import { useQuery } from '@tanstack/react-query'

interface UseGetCleaningDetailParams {
  id: number | null | undefined
  enabled?: boolean
}

export function useGetCleaningDetail({ id, enabled = true }: UseGetCleaningDetailParams) {
  return useQuery({
    queryKey: ['cleaning-detail', id],
    queryFn: async () => {
      const res = await cleaningShiftApi.getDetail(id as number)
      return res.data
    },
    enabled: enabled && typeof id === 'number' && id > 0,
  })
}
