import { cleaningShiftApi } from '@/api/cleaning-shift.api'
import { useQuery } from '@tanstack/react-query'

interface UseGetCleanDetailNotesParams {
  detailId: number | null | undefined
  enabled?: boolean
}

export function useGetCleanDetailNotes({ detailId, enabled = true }: UseGetCleanDetailNotesParams) {
  return useQuery({
    queryKey: ['clean-detail-notes', detailId],
    queryFn: async () => {
      const res = await cleaningShiftApi.getNotes(detailId as number)
      return res.data
    },
    enabled: enabled && typeof detailId === 'number' && detailId > 0,
  })
}
