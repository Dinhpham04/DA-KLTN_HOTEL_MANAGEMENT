import { cleaningShiftApi } from '@/api/cleaning-shift.api'
import type { UpdateCleaningDetailType2Body } from '@/types/cleaning-shift'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface Params {
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

export function useUpdateCleaningDetailType2({ onSuccess, onError }: Params = {}) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['update-cleaning-detail-type2'],
    mutationFn: ({ id, data }: { id: number; data: UpdateCleaningDetailType2Body }) =>
      cleaningShiftApi.updateDetailType2(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaning-shifts'] })
      onSuccess?.()
    },
    onError,
  })
}
