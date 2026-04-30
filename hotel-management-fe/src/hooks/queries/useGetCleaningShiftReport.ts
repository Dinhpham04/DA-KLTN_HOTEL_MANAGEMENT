import { cleaningShiftApi } from '@/api/cleaning-shift.api'
import type { Cleans } from '@/types/cleaning-shift'
import { useQueries } from '@tanstack/react-query'

interface UseGetCleaningShiftReportParams {
  cleaningDate: string
  facilityIds: number[]
  roomTypeIds?: number[]
  enabled?: boolean
}

export function useGetCleaningShiftReport({
  cleaningDate,
  facilityIds,
  roomTypeIds,
  enabled = true,
}: UseGetCleaningShiftReportParams) {
  const queries = useQueries({
    queries: facilityIds.map((facilityId) => ({
      queryKey: ['cleaning-shift-report', cleaningDate, facilityId, roomTypeIds],
      queryFn: async () => {
        const response = await cleaningShiftApi.getAll({
          cleaningDate,
          facilityId,
          roomTypeIds,
          sort: 'reserveCheckoutAt',
          direction: 'asc',
        })
        return response.data
      },
      enabled: enabled && facilityIds.length > 0,
    })),
  })

  return {
    shifts: queries.map((query) => query.data).filter((shift): shift is Cleans => Boolean(shift)),
    isLoading: queries.some((query) => query.isLoading),
    isFetching: queries.some((query) => query.isFetching),
    isError: queries.some((query) => query.isError),
    refetch: () => Promise.all(queries.map((query) => query.refetch())),
  }
}
