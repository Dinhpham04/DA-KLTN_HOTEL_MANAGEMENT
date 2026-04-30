import { cleaningShiftApi } from '@/api/cleaning-shift.api'
import type { CleaningShiftFilterParams } from '@/types/cleaning-shift'
import { useQuery } from '@tanstack/react-query'

interface UseGetCleaningShiftsParams {
  params: CleaningShiftFilterParams
  enabled?: boolean
}

export function useGetCleaningShifts({ params, enabled = true }: UseGetCleaningShiftsParams) {
  return useQuery({
    queryKey: ['cleaning-shifts', params],
    queryFn: async () => {
      const res = await cleaningShiftApi.getAll(params)
      return res.data
    },
    enabled,
    staleTime: 0,
  })
}
