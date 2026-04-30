import { cleaningShiftApi } from '@/api/cleaning-shift.api'
import type { UpdateCleaningDetailBody } from '@/types/cleaning-shift'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface Params {
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

export function useUpdateCleaningDetail({ onSuccess, onError }: Params = {}) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['update-cleaning-detail'],
    mutationFn: ({ id, data }: { id: number; data: UpdateCleaningDetailBody }) =>
      cleaningShiftApi.updateDetail(id, data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['cleaning-shifts'] })
      queryClient.invalidateQueries({ queryKey: ['cleaning-detail', vars.id] })
      onSuccess?.()
    },
    onError,
  })
}
